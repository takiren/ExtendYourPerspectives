const { Matrix } = require("./Matrix");

class Poly {
  constructor() {
    this.origin = new Matrix(4, 1);
    this.verts = [];
  }

  addVert(vec) {
    this.verts.push(vec);
  }

  static createLine(v1, v2) {
    const p = new Poly();
    p.addVert(v1);
    p.addVert(v2);
    return p;
  }

  static createPoly(...args) {
    for (const key in arguments) {
      if (Object.hasOwnProperty.call(arguments, key)) {
        const element = arguments[key];
        this.verts.push(element);
      }
    }
  }

  static addPerspectives() {
  }

  static createPolyFromPath(pathItem) {
    for (const key in pathItem) {
      if (Object.hasOwnProperty.call(pathItem, key)) {
        const element = pathItem[key];
        console.log(element);
      }
    }
  }
}
exports.Poly = Poly;
