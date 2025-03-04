import { load_stl } from "./viewer.mjs";

const file_input = document.getElementById("stl-file");

function load_file(file) {
  const reader = new FileReader();

  reader.onload = (e) => {
    const array_buffer = e.target.result;
    load_stl(array_buffer);
  };

  reader.readAsArrayBuffer(file);
}

function save_file(data, filename, type) {
  let blob = new Blob([data], {type: type});
  let a = document.createElement("a");
  a.download = filename;
  a.href = URL.createObjectURL(blob);
  a.style.display = "none";

  document.body.append(a);
  a.click();
  a.remove();
}

file_input.addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (file) {
    if (file.name.split(".").pop() == "stl")
      load_file(file);
  }
});

//listeners for file drop
const drop_zone = document.getElementById("drop-zone");

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
    if (file.name.split(".").pop() == "stl")
      load_file(file);
  }
});
