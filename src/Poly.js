const { Matrix, Point } = require("/src/Matrix");
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
    this.bClosed = false
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
        v.push(Matrix.multiply(mx))
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

  transform(mx) {
    //行列の掛け算をpolyのすべての頂点に対して行う。multiplyだとなんかピンとこなかった。
    //結果を返す。
    const v = []
    for (const key in this.verts) {
      if (Object.hasOwnProperty.call(this.verts, key)) {
        const element = this.verts[key];
        v.push(Matrix.multiply(mx, element))
      }
    }
    return v
  }

  transformOverride(mx) {
    //行列の掛け算をpolyのすべての頂点に対して行う。multiplyだとなんかピンとこなかった。
    //変数this.vertsを書き換え
    for (const key in this.verts) {
      if (Object.hasOwnProperty.call(this.verts, key)) {
        this.verts[key] = Matrix.multiply(mx, this.verts[key])
      }
    }
  }


  rotateYOverride(radian) {
    //元のデータを書き換え
    let mx_rot = Matrix.makeRotationY(radian)

    for (const key in this.verts) {
      if (Object.hasOwnProperty.call(this.verts, key)) {
        this.verts[key] = Matrix.multiply(mx_rot, this.verts[key])
      }
    }
  }

  getVertsWorld() {
    //ワールド座標系で(頂点を)取得
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
    //2点で構成されるPolyを作る。
    const p = new Poly();
    p.addVert(v1);
    p.addVert(v2);
    return p;
  }

}
exports.Poly = Poly;
