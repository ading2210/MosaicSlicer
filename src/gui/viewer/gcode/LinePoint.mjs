import { Color } from "three";

export class LinePoint {
  constructor(point, radius, color = new Color("#29BEB0")) {
    this.point = point;
    this.radius = radius;
    this.color = color;
  }
}
