class Ray {
  constructor(x0, y0, z0, dx, dy, dz) {
    this.origin = createVector(x0, y0, z0);
    this.direction = createVector(dx, dy, dz);
  }
}
