const { Matrix, Point } = require("/src/Matrix");
const { Poly } = require("/src/Poly");

class MultiPoly {
  constructor() {
    this.origin = Matrix.makeVert(0, 0, 0)
    if (arguments.length != 0) {
      this.origin = arguments[0]
    }
    this.polys = [];

    this.rotY = Matrix.makeRotationY(0)
    this.scl = Matrix.makeScale(1, 1, 1)
    this.loc = Matrix.makeTranslation(0, 0, 0)
  }

  setScale(scale) {
    this.scl = scale
  }

  addPoly(poly) {
    this.polys.push(poly);
  }

  rotateY(radian) {
  }

  getPolys() {
    return this.polys
  }
  static createMultiPolyFromPath(pathItem, scalar) {
    if (!scalar) {
      console.error("Scalarを入れてください")
      return
    }
    const mp = new MultiPoly();
    for (let index = 0; index < pathItem.subPathItems.length; index++) {
      const p = new Poly();
      const subPath = pathItem.subPathItems[index];
      for (let indexj = 0; indexj < subPath.pathPoints.length; indexj++) {
        const point = subPath.pathPoints[indexj];
        const vert = new Point;
        vert.elements = [
          point.anchor[0] * scalar,
          0,
          point.anchor[1] * scalar,
          1
        ];
        p.addVert(vert);
      }
      console.log(p);
      if (subPath.closed==true) {
        p.setClosed()
      }
      console.warn(p.IsClosed())
      mp.addPoly(p);
    }
    return mp;
  }

}

exports.MultiPoly = MultiPoly;
