import { load_stl } from "./stl_viewer.mjs"

const file_input = document.getElementById("stl-file");

function load_file(file) {
  const reader = new FileReader();

  reader.onload = (e) => {
    const array_buffer = e.target.result;
    load_stl(array_buffer);
  };

  reader.readAsArrayBuffer(file);
}

file_input.addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (file) {
    if (file.name.split(".").pop() == "stl") {
      load_file(file);
    }
  }
});

var drop_zone = document.getElementById("drop-zone");
window.addEventListener("dragover", (event) => {
  event.preventDefault();
  console.log("dragover");
  drop_zone.style.display = "flex";
});

drop_zone.addEventListener("dragleave", (event) => {
  event.preventDefault();
  console.log("dragleave");
  drop_zone.style.display = "none";
});

drop_zone.addEventListener("drop", (event) => {
  event.preventDefault();
  console.log("drop");
  drop_zone.style.display = "none";

  const file = event.dataTransfer.files[0];

  if (file) {
    if (file.name.split(".").pop() == "stl") {
      load_file(file);
    }
  }
});