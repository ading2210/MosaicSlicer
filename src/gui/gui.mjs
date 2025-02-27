
import { load_stl } from "./stl_viewer.mjs"

const file_input = document.getElementById("stl-file");

file_input.addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      const array_buffer = e.target.result;
      load_stl(array_buffer);
    };

    reader.readAsArrayBuffer(file);
  }
});