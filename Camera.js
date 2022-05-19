const { Matrix } = require("./Matrix");

class Camera {
  constructor(CameraPos, TargetPos, w_dis, wvsize, whsize, z_m, zchilda, zmi, c_width, c_height) {
    this.location = new Matrix(3, 1);
    this.location.elements = [
      CameraPos[0],
      CameraPos[1],
      CameraPos[2]
    ];

    console.log("カメラ座標", this.location);
    this.targetLoc = new Matrix(3, 1);
    this.targetLoc.elements = [
      TargetPos[0],
      TargetPos[1],
      TargetPos[2]
    ];

    this.canv_width = c_width;
    this.canv_height = c_height;

    this.axis = [new Matrix(3, 1), new Matrix(3, 1), new Matrix(3, 1)];

    this.w_distance = w_dis;
    this.w_hSize = whsize;
    this.w_vSize = wvsize;
    this.zMax = z_m;
    this.z_dash_min = zchilda;
    this.zMin = zmi;
    this.shift_x = 0
    this.shift_y = 0

    this.calcAxis();
    this.mn = this.makeNormalize();
    this.mt = this.makeCameraTransform();
    this.mp = this.makeProjection();
    this.mx_ViewToScr = this.makeViewToScr();
    this.scaleI = Matrix.makeScale(1, 1, 1);
  }

  calcTargetVec() {
    var vec = new Matrix(3, 1);
    console.log("TargetLoc", this.targetLoc, "Inverted", Matrix.Invert(this.location));
    vec = Matrix.add(this.targetLoc, Matrix.Invert(this.location));
    vec = Matrix.makeNorm(vec);
    vec = Matrix.Invert(vec);
    console.table("Z vector:", vec);
    return vec;
  }

  calcAxis() {
    this.axis[2] = this.calcTargetVec();
    this.axis[1].elements = [
      0,
      1,
      0
    ];

    this.axis[0] = Matrix.makeNorm(Matrix.cross(this.axis[2], this.axis[1]));
    this.axis[1] = Matrix.makeNorm(Matrix.cross(this.axis[0], this.axis[2]));

    console.table("axis Right", this.axis[0]);
    console.table("axis Up", this.axis[1]);
    console.table("axis Front", this.axis[2]);
  }

  makeCameraTransform() {
    var mx = new Matrix(4, 4);
    console.log("カメラ location",this.location)
    mx.elements = [
      this.axis[0].getElement(0, 0), this.axis[0].getElement(0, 1), this.axis[0].getElement(0, 2), -Matrix.dot(this.axis[0], this.location),
      this.axis[1].getElement(0, 0), this.axis[1].getElement(0, 1), this.axis[1].getElement(0, 2), -Matrix.dot(this.axis[1], this.location),
      this.axis[2].getElement(0, 0), this.axis[2].getElement(0, 1), this.axis[2].getElement(0, 2), -Matrix.dot(this.axis[2], this.location),
      0, 0, 0, 1
    ];
    mx.elements = [
      this.axis[0].getElement(0, 0), this.axis[1].getElement(0, 0), this.axis[2].getElement(0, 0), -Matrix.dot(this.axis[0], this.location),
      this.axis[0].getElement(1, 0), this.axis[1].getElement(1, 0), this.axis[2].getElement(1, 0), -Matrix.dot(this.axis[1], this.location),
      this.axis[0].getElement(2, 0), this.axis[1].getElement(2, 0), this.axis[2].getElement(2, 0), -Matrix.dot(this.axis[2], this.location),
      0, 0, 0, 1
    ];
    return mx;
  }

  makeViewToScr() {
    let mx = new Matrix(4, 4);
    mx.elements = [
      this.canv_width / 2, 0, 0, this.canv_width / 2 + this.canv_width * this.shift_x,
      0, this.canv_height / 2, 0, this.canv_height / 2 + this.canv_height * this.shift_y,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
    console.table("ターブル", mx);
    return mx;
  }

  makeNormalize() {
    return Matrix.makeScale(this.w_distance / (this.zMax * this.w_hSize), this.w_distance / (this.w_vSize * this.zMax), 1 / this.zMax);
  }

  makeProjection() {
    var mx_P = new Matrix(4, 4);
    mx_P.elements = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1 / (1 - this.z_dash_min), -this.z_dash_min / (1 - this.z_dash_min),
      0, 0, 1, 0
    ];
    return mx_P;
  }

  Project(vert) {
    vert = Matrix.multiply(this.scaleI, vert);
    vert = Matrix.multiply(this.mt, vert);
    vert = Matrix.multiply(this.mn, vert);
    vert = Matrix.multiply(this.mp, vert);
    vert = Matrix.multiplyByScalar(1 / vert.getElement(3, 0), vert);
    return vert;
  }

  ProjectToScreen(vert) {
    vert = this.Project(vert);
    console.log("変換テスト", Matrix.multiply(this.mx_ViewToScr, vert));
    return Matrix.multiply(this.mx_ViewToScr, vert);
  }

  setShift(x, y) {
    this.shift_x = x
    this.shift_y = y
    this.mx_ViewToScr = this.makeViewToScr();
  }

}

module.exports = {
  Camera
}