import * as THREE from "three";

/**
 * @param {string} gcode
 */
export async function parse(gcode) {
  /**
   * @typedef {Object} Segment
   * @property {'travel' | 'print'} type
   * @property {'SKIRT' | 'WALL-OUTER' | 'SKIN' | 'WALL-INNER' | 'FILL'} subtype
   * @property {THREE.Vector4} vector
   */

  /** @type {Segment[][]} */
  let layers = [];
  /** @type {Segment[]} */
  let layer = [];
  let last_vector = new THREE.Vector4(0, 0, 0, 0);
  let relative = false;
  let type;
  let layer_num = 0;

  for (let [line_num, line] of gcode.split("\n").entries()) {
    let command = line.split(";")[0];
    let comment = line.split(";")[1];

    if (command) {
      command = command.trim();

      let command_args = command.split(" ");

      if (command_args[0] == "G0" || command_args[0] == "G1") {
        let params = Object.fromEntries(command_args.slice(1).map(p => [p[0], parseFloat(p.substring(1))]));

        if (relative) {
          if (params.hasOwnProperty("X"))
            last_vector.x += params.X;
          if (params.hasOwnProperty("Y"))
            last_vector.y += params.Y;
          if (params.hasOwnProperty("Z"))
            last_vector.z += params.Z;
          if (params.hasOwnProperty("E"))
            last_vector.w += params.E;
        }
        else {
          if (params.hasOwnProperty("X"))
            last_vector.x = params.X;
          if (params.hasOwnProperty("Y"))
            last_vector.y = params.Y;
          if (params.hasOwnProperty("Z"))
            last_vector.z = params.Z;
          if (params.hasOwnProperty("E"))
            last_vector.w = params.E;
        }

        layer.push({
          type: params.hasOwnProperty("E") ? "print" : "travel",
          subtype: type,
          vector: last_vector.clone()
        });
      }
      else if (command_args[0] == "G90")
        relative = false;
      else if (command_args[0] == "G91")
        relative = true;
      else if (command_args[0] == "G92") {
        let params = Object.fromEntries(command_args.slice(1).map(p => [p[0], parseFloat(p.substring(1))]));

        if (params.hasOwnProperty("X"))
          last_vector.x = params.X;
        if (params.hasOwnProperty("Y"))
          last_vector.y = params.Y;
        if (params.hasOwnProperty("Z"))
          last_vector.z = params.Z;
        if (params.hasOwnProperty("E"))
          last_vector.w = params.E;
      }
      else {
        console.log("Unsupported Command: " + command_args[0]);
      }
    }
    else if (comment) {
      comment.trim();

      if (comment.startsWith("LAYER:")) {
        layer_num = parseInt(comment.substring(6));
        layers.push(layer);
        layer = [];
      }
      else if (comment.startsWith("TYPE:")) {
        type = comment.substring(5);
      }
    }
  }
  return layers;
}
