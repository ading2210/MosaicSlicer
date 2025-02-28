import pako from "pako";
import untar from "js-untar";

export async function extract_tar(archive_data) {
  let decompressed = pako.inflate(archive_data);
  let tar_files = await untar(decompressed.buffer);
  let files = {};
  for (let file of tar_files) {
    let relative_path = file.name.substring(1);
    files[relative_path] = tar_files.buffer;
  }
  return files;
}