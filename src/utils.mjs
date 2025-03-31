export function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

//test if string is certain data type
export function is_int(str) {
  return /^[-\d]*$/.test(str);
}
export function is_num(str) {
  return /^-?\d+(\.\d+)?$/.test(str);
}
export function is_var(str) {
  return /^[a-zA-Z_][a-zA-Z_\d]*$/.test(str);
}

//https://stackoverflow.com/a/70291510
export function set_intersect(set_a, set_b, ...args) {
  const result = new Set([...set_a].filter((i) => set_b.has(i)));
  if (args.length === 0)
    return result;
  return set_intersect(result, args.shift(), ...args);
}

export function uuid_v4() {
  return "10000000-1000-4000-8000-100000000000".replace(
    /[018]/g,
    c => (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}
