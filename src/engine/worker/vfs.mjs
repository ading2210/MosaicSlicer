import { engine } from "./cura.mjs";

export function rm_dir(path) {
  if (!engine.FS.analyzePath(path).exists)
    return;
  for (let entry of engine.FS.readdir(path)) {
    let new_path = path + "/" + entry;
    if (entry === "." || entry === "..") 
      continue;
    try {
      engine.FS.unlink(new_path);
    }
    catch {
      rm_dir(new_path);
    }
  }
  engine.FS.rmdir(path);
}

export function import_files(base_dir, files) {
  rm_dir(base_dir);
  engine.FS.mkdir(base_dir);
  for (let [relative_path, data] of Object.entries(files)) {
    let out_path = base_dir + "/" + relative_path;
    if (out_path.endsWith("/")) 
      engine.FS.mkdir(out_path);
    else
      engine.FS.writeFile(out_path, data);
  }
}