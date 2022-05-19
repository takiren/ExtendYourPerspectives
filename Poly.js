const { Matrix, Point } = require("./Matrix");
const { Vector3, Vector4, Matrix4, Quaternion } = require('./matrixgl.min.js');
class Poly {
  constructor() {
    this.origin = new Point()
    if (arguments.length == 0) {
      this.origin.elements = [
        0,
        0,
        0,
        1
      ]
    }
    else {
      this.origin = arguments[0]
    }
    this.verts = [];
    this.rotY = Matrix.makeRotationY(0)
    this.bClosed = true
    this.scale = Matrix.makeScale(1, 1, 1)
  }

  setScale(mx) {
    this.scale = mx
  }

  setRotationY(mx) {
    this.rotY = mx
  }

  setClosed() {
    this.bClosed = true
  }
  IsClosed() {
    return this.bClosed
  }

  setUnclosed() {
    this.bClosed = false
  }

  setOrigin(OriginMatrix) {
    this.origin = OriginMatrix
  }

  addVert(vec) {
    this.verts.push(vec);
  }

  translate(mx) {
    const v = []
    for (const key in this.verts) {
      if (Object.hasOwnProperty.call(this.verts, key)) {
        const element = this.verts[key];
        v.push(Matrix.multiply(mx,))
      }
    }
  }

  scale(mx) {
    const v = []
    for (const key in this.verts) {
      if (Object.hasOwnProperty.call(this.verts, key)) {
        const element = this.verts[key];
        v.push(Matrix.multiply)
      }
    }
  }

  Transform(mx) {
    const v = []
    for (const key in this.verts) {
      if (Object.hasOwnProperty.call(this.verts, key)) {
        const element = this.verts[key];
        v.push(Matrix.multiply(mx, element))
      }
    }
    return v
  }

  TransformOverride(mx) {
    for (const key in this.verts) {
      if (Object.hasOwnProperty.call(this.verts, key)) {
        this.verts[key] = Matrix.multiply(mx, this.verts[key])
      }
    }
  }


  rotateYOverride(radian) {
    let mx_rot = Matrix.makeRotationY(radian)

    for (const key in this.verts) {
      if (Object.hasOwnProperty.call(this.verts, key)) {
        this.verts[key] = Matrix.multiply(mx_rot, this.verts[key])
      }
    }
  }

  getVertsWorld() {
    const worldVerts = []
    for (const key in this.verts) {
      if (Object.hasOwnProperty.call(this.verts, key)) {
        const element = this.verts[key];
        worldVerts.push(Matrix.translateByMatrix(this.origin, element))
      }
    }
    return worldVerts
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
        poly_ins = new Poly()
        poly_ins.verts.push(element);
      }
    }
    return poly_ins
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
  static createPlane() {
    console.error("This F does nothing.")
  }
}
exports.Poly = Poly;
