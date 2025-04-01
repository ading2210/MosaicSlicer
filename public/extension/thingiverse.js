console.log("MosaicSlicer: content script loaded");

//https://stackoverflow.com/a/66046176
async function bufferToBase64(buffer) {
  // use a FileReader to generate a base64 data URI:
  const base64url = await new Promise(r => {
    const reader = new FileReader();
    reader.onload = () => r(reader.result);
    reader.readAsDataURL(new Blob([buffer]));
  });
  // remove the `data:...;base64,` part from the start
  return base64url.slice(base64url.indexOf(",") + 1);
}

setInterval(() => {
  if (!location.pathname.startsWith("/thing"))
    return;

  let download_wrappers = document.querySelectorAll(".ItemList__listItemHeader--zpMOx");
  for (let i = 0; i < download_wrappers.length; i++) {
    let download_wrapper = download_wrappers[i];
    if (download_wrapper.dataset.injected)
      continue;
    download_wrapper.dataset.injected = true;

    let download_btn = download_wrapper.children[download_wrapper.children.length - 1];
    let download_itm = download_wrapper.children[0];
    let file_name = download_itm.innerText;
    let file_ext = file_name.split(".").at(-1).toLowerCase();

    if (!["3mf", "stl"].includes(file_ext))
      continue;

    let icon_img = document.createElement("img");
    icon_img.style.width = "14px";
    icon_img.style.height = "14px";
    icon_img.src = chrome.runtime.getURL("img/logo.svg");

    let label = download_btn.children[0].cloneNode();
    label.innerText = "MosaicSlicer";

    let new_btn = download_btn.cloneNode(true);
    new_btn.replaceChildren();
    new_btn.appendChild(label);
    new_btn.append(icon_img);
    new_btn.onclick = async () => {
      new_btn.disabled = true;
      await download_file(file_name);
      new_btn.disabled = false;
    };

    download_wrapper.insertBefore(new_btn, download_btn);
  }
}, 100);

async function download_file(file_name) {
  // From my testing this API key is hardcoded
  // API: 56edfc79ecf25922b98202dd79a291aa
  const API_KEY = "56edfc79ecf25922b98202dd79a291aa";

  let model_id = [...location.pathname.matchAll(/\/thing\:(\d+)/g)][0][1];

  let model_files_res = await fetch("https://www.thingiverse.com/api/things/" + model_id + "/files", {
    "headers": {"authorization": "Bearer " + API_KEY}
  });

  let model_files = await model_files_res.json();
  let download_link;
  for (let model_file of model_files) {
    if (model_file.name === file_name)
      download_link = model_file.direct_url;
  }

  let stl_res = await fetch(download_link);
  let stl_data = await stl_res.arrayBuffer();
  chrome.runtime.sendMessage({cmd: "load_model", args: [file_name, await bufferToBase64(stl_data)]});
}
