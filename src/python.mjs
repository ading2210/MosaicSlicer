import { loadMicroPython } from "@micropython/micropython-webassembly-pyscript";
import mp_wasm from "@micropython/micropython-webassembly-pyscript/micropython.wasm";

export const micropython = await loadMicroPython({url: mp_wasm});
const name_error_regex = /NameError: name '(\S+)' isn't defined/;
const preserved_globals = [];

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
  let python = `__eval_ret = (${expression})`;

  for (let [var_name, value] of Object.entries(vars))
    micropython.globals.set(var_name, value);

  try {
    micropython.runPython(python);
  }
  catch (py_error) {
    clean_globals();
    if (name_error_regex.test(py_error.message))
      throw new PythonNameError(py_error.message);
    else
      throw py_error;
  }
  clean_globals();
  return micropython.globals.get("__eval_ret");
}

export function convert_py_list(list) {
}

export function import_libraries() {
  micropython.runPython(`import math;`);
  preserved_globals.push(...Object.keys(micropython.globals.__dict__));
}

import_libraries();
