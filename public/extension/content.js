console.log("content script loaded.");

let slicer_options_exists = false;
const observer = new MutationObserver(mutations => {
  if (document.querySelector(".slicer-option-button")) {
    if (!slicer_options_exists) {
      let slicer_option = document.createElement("button");
      slicer_option.classList = document.querySelector(".slicer-option-button").classList;

      let slicer_icon = document.createElement("img");
      slicer_icon.classList.add("dark");
      slicer_icon.setAttribute("width", "14px");
      slicer_icon.setAttribute("height", "14px");
      // slicer_icon.src = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='800'%20height='800'%20viewBox='0%200%20800%20800'%3e%3cpath%20d='m%20680.14429,102.36264%20c%20-131.72203,-131.722038%20-345.22674,-131.722038%20-476.94877,0%20-131.722035,131.72203%20-131.722035,345.22674%200,476.94877%20z'%20fill='%23888'%20/%3e%3cpath%20d='m%20123.79757,699.53056%20c%20131.72203,131.72203%20345.22674,131.72203%20476.94877,0%20131.72204,-131.72204%20131.72204,-345.22674%200,-476.94877'%20fill='%23ed6b21'%20/%3e%3c/svg%3e"
      slicer_option.appendChild(slicer_icon);

      slicer_option.appendChild(document.createTextNode("Web Slicer"));

      slicer_option.addEventListener("click", () => {
        // chrome runtime or whatever goes here
      });

      document.querySelector(".slicer-option-button").parentElement.appendChild(slicer_option);
    }
    slicer_options_exists = true;
  }
  else {
    slicer_options_exists = false;
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
