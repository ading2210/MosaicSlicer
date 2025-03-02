import { loadMicroPython } from "@micropython/micropython-webassembly-pyscript";
import mp_wasm from "@micropython/micropython-webassembly-pyscript/micropython.wasm";

export const micropython = await loadMicroPython({ url: mp_wasm });

export function eval_py(expression, vars = {}) {
  let python = `__eval_ret = (${expression})`;

  for (let [var_name, value] of Object.entries(vars))
    micropython.globals.set(var_name, value);

  micropython.runPython(python);
  return micropython.globals.get("__eval_ret");
}