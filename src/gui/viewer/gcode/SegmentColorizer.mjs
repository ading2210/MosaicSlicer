import { Color } from "three";
import { Lut } from "three/examples/jsm/math/Lut.js";

const DEFAULT_COLOR = new Color("#29BEB0");

export class LineColorizer {
  // This assumes that getColor is called ordered by gCodeLine.
  currentConfigIndex = 0;

  constructor(lineColorConfig, options) {
    this.lineColorConfig = lineColorConfig;
    this.options = options;
  }

  getColor(meta) {
    // Safeguard check if the config is too short.
    if (this.lineColorConfig[this.currentConfigIndex] === undefined)
      return this.options?.defaultColor || DEFAULT_COLOR;

    if (this.lineColorConfig[this.currentConfigIndex].toLine < meta.gCodeLine)
      this.currentConfigIndex++;

    return (
      this.lineColorConfig[this.currentConfigIndex].color ||
      this.options?.defaultColor ||
      DEFAULT_COLOR
    );
  }
}

export class SimpleColorizer {
  constructor(color = DEFAULT_COLOR) {
    this.color = color;
  }

  getColor() {
    return this.color;
  }
}

export class LutColorizer {
  constructor(lut = new Lut("cooltowarm")) {
    this.lut = lut;
  }
}

export class SpeedColorizer extends LutColorizer {
  constructor(minSpeed, maxSpeed) {
    super();
    this.lut.setMin(minSpeed);
    this.lut.setMax(maxSpeed);
  }

  getColor(meta) {
    return this.lut.getColor(meta.speed);
  }
}

export class TempColorizer extends LutColorizer {
  constructor(minTemp, maxTemp) {
    super();
    this.lut.setMin(minTemp);
    this.lut.setMax(maxTemp);
  }

  getColor(meta) {
    return this.lut.getColor(meta.temp);
  }
}
