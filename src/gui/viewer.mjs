// Viewer interactions (eg. clicking on a model, etc.)
import * as renderer from "./renderer.mjs";
import { models } from "./stl_viewer.mjs"
import * as THREE from "three"

var raycaster = new THREE.Raycaster();

let focused_model = null;

export function start_viewer() {
    renderer.animate();
}

// This logic is for differentiating between a click and a drag
let clicked = false;
let click_pos = null;
document.addEventListener('mousedown', e => {
    clicked = true;
    click_pos = { x: e.clientX, y: e.clientY };
});
document.addEventListener('mousemove', e => {
    if (click_pos) {
        if ((Math.abs(e.clientX - click_pos.x) > 5) || (Math.abs(e.clientY - click_pos.y) > 5))
            clicked = false
    }
});
document.addEventListener('mouseup', event => {
    if (clicked) {
        var mouse = new THREE.Vector2(event.clientX / renderer.view_width * 2 - 1, -(event.clientY / renderer.view_height * 2 - 1));
        console.log(mouse)
        raycaster.setFromCamera(mouse, renderer.camera);

        let intersects = raycaster.intersectObjects(Array.from(Object.values(models), (model) => model.mesh), true)
        console.log(intersects)
        if (intersects.length > 0) {
            if (focused_model) {
                console.log("reclicking", models[focused_model].mesh.name)
                models[focused_model].mesh.material.color.setHex(0x1a5f5a);
                models[focused_model].mesh.material.emissive.setHex(0x1a5f5a);
            }

            focused_model = intersects[0].object.uuid;
            console.log("clicking", models[focused_model].mesh.name)
            models[focused_model].mesh.material.color.setHex(0x37d79c);
            models[focused_model].mesh.material.emissive.setHex(0x37d79c);

            console.log(models[intersects[0].object.uuid].mesh);
        }
        else {
            if (focused_model) {
                console.log("unclicking", models[focused_model].mesh.name)
                models[focused_model].mesh.material.color.setHex(0x1a5f5a);
                models[focused_model].mesh.material.emissive.setHex(0x1a5f5a);
                focused_model = null;
            }
        }
    }
    clicked = false;
});
