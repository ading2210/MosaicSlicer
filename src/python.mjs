import { loadMicroPython } from "@micropython/micropython-webassembly-pyscript";
import mp_wasm from "@micropython/micropython-webassembly-pyscript/micropython.wasm";

export const micropython = await loadMicroPython({
  url: mp_wasm,
  pystack: 1024 * 1024,
  heapsize: 16 * 1024 * 1024
});
const name_error_regex = /NameError: name '(\S+)' isn't defined/;
const preserved_globals = [];

export const py_api = {
  extruderValues: () => {},
  extruderValue: () => {},
  anyExtruderWithMaterial: () => {},
  anyExtruderNrWithOrDefault: () => {},
  resolveOrValue: () => {},
  defaultExtruderPosition: () => {},
  valueFromContainer: () => {},
  valueFromExtruderContainer: () => {}
};

export class PythonNameError extends Error {
  constructor(message) {
    super(message);
    this.var_name = message.match(name_error_regex)[1];
  }
}

function clean_globals() {
  for (let key of Object.keys(micropython.globals.__dict__)) {
    if (!preserved_globals.includes(key))
      micropython.globals.delete(key);
  }
}

export function eval_py(expression, vars = {}) {
  for (let [var_name, value] of Object.entries(vars)) {
    micropython.globals.set(var_name, JSON.stringify(value));
    micropython.runPython(`${var_name} = json.loads(${var_name})`);
  }

  try {
    micropython.runPython(`__eval_ret = (${expression})`);
    micropython.runPython(`__eval_ret = json.dumps(__eval_ret)`);
  }
  catch (py_error) {
    clean_globals();
    if (name_error_regex.test(py_error.message))
      throw new PythonNameError(py_error.message);
    else
      throw py_error;
  }
  clean_globals();
  let ret = micropython.globals.get("__eval_ret");
  return JSON.parse(ret);
}

export function whitelist_globals() {
  preserved_globals.length = 0;
  preserved_globals.push(...Object.keys(micropython.globals.__dict__));
}

export function setup() {
  const py_api_private = {};
  for (let py_func in py_api) {
    py_api_private[py_func] = (...args) => {
      return JSON.stringify(py_api[py_func](...args));
    };
  }

  micropython.runPython(`import math, json`);
  micropython.registerJsModule("__cura_api", py_api_private);
  micropython.runPython(`import __cura_api`);
  for (let py_func in py_api)
    micropython.runPython(`def ${py_func}(*args): return json.loads(__cura_api.${py_func}(*args))`);
  whitelist_globals();
}

setup();
