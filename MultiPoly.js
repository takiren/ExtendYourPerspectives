const { Matrix } = require("./Matrix");
const { Poly } = require("./Poly");

class MultiPoly {
  constructor() {
    this.polys = [];
  }
  addPoly(poly) {
    this.polys.push(poly);
  }

  static createMultiPolyFromPath(pathItem) {
    const mp = new MultiPoly();
    for (let index = 0; index < pathItem.subPathItems.length; index++) {
      const p = new Poly();
      const subPaths = pathItem.subPathItems[index];
      for (let indexj = 0; indexj < subPaths.pathPoints.length; indexj++) {
        const point = subPaths.pathPoints[indexj];
        const vert = new Matrix(4, 1);
        vert.elements = [
          point.anchor[0],
          0,
          point.anchor[1],
          1
        ];
        p.addVert(vert);
      }
      console.log(p);
      mp.addPoly(p);
    }
    console.log(mp);
    return mp;
  }
}
exports.MultiPoly = MultiPoly;
