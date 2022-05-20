const { Matrix } = require("/src/Matrix");

class Camera {
  constructor(CameraPos, TargetPos, w_dis, wvsize, whsize, z_m, zchilda, zmi, c_width, c_height, shiftX, shiftY) {
    //視点
    this.location = new Matrix(3, 1);
    this.location.elements = [
      CameraPos[0],
      CameraPos[1],
      CameraPos[2]
    ];

    console.log("カメラ座標", this.location);
    
    //注視点
    this.targetLoc = new Matrix(3, 1);
    this.targetLoc.elements = [
      TargetPos[0],
      TargetPos[1],
      TargetPos[2]
    ];

    //ドキュメントのサイズ定義

    this.canv_width = c_width;
    this.canv_height = c_height;

    //カメラ座標系での軸
    this.axis = [new Matrix(3, 1), new Matrix(3, 1), new Matrix(3, 1)];

    this.w_distance = w_dis; //投影面までの距離
    this.w_hSize = whsize;  //投影面の縦サイズ
    this.w_vSize = wvsize;  //投影面の横サイズ
    this.zMax = z_m;  //最大描画距離
    this.z_dash_min = zchilda;
    this.zMin = zmi; //最小描画距離
    this.shift_x = shiftX //オフセット
    this.shift_y = shiftY //オフセット

    this.calcAxis();
    this.matrixNormalizer = this.makeNormalize(); //正規化行列
    this.matrixCameraTransformer = this.makeCameraTransform(); //カメラ座標系変換行列
    this.matrixProjector = this.makeProjection(); //プロジェクション行列
    this.mx_ViewToScr = this.makeViewToScr(); //スクリーン座標変換行列
  }

  calcTargetVec() {
    //注視点へのベクトル。
    var vec = new Matrix(3, 1);
    console.log("TargetLoc", this.targetLoc, "Inverted", Matrix.Invert(this.location));
    vec = Matrix.add(this.targetLoc, Matrix.Invert(this.location));
    vec = Matrix.makeNorm(vec);
    vec = Matrix.Invert(vec);
    console.table("Z vector:", vec);
    return vec;
  }

  calcAxis() {
    //カメラの軸計算
    //axis[0]がカメラ座標系でのx軸
    //axis[1]がカメラ座標系でのy軸
    //axis[2]がカメラ座標系でのz軸
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
    //カメラ座標系変換行列
    var mx = new Matrix(4, 4);
    console.log("カメラ location", this.location)
    mx.elements = [
      this.axis[0].getElement(0, 0), this.axis[1].getElement(0, 0), this.axis[2].getElement(0, 0), -Matrix.dot(this.axis[0], this.location),
      this.axis[0].getElement(1, 0), this.axis[1].getElement(1, 0), this.axis[2].getElement(1, 0), -Matrix.dot(this.axis[1], this.location),
      this.axis[0].getElement(2, 0), this.axis[1].getElement(2, 0), this.axis[2].getElement(2, 0), -Matrix.dot(this.axis[2], this.location),
      0, 0, 0, 1
    ];
    return mx;
  }

  makeViewToScr() {
    //スクリーン座標変換行列
    let mx = new Matrix(4, 4);
    mx.elements = [
      this.canv_width / 2, 0, 0, this.canv_width / 2 + this.canv_width * this.shift_x,
      0, this.canv_height / 2, 0, this.canv_height / 2 + this.canv_height * this.shift_y,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
    return mx;
  }

  makeNormalize() {
    //カメラ座標系を正規化する。
    return Matrix.makeScale(this.w_distance / (this.zMax * this.w_hSize), this.w_distance / (this.w_vSize * this.zMax), 1 / this.zMax);
  }

  makeProjection() {
    //透視投影変換行列
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
    //ビューポート変換
    vert = Matrix.multiply(this.matrixCameraTransformer, vert);// カメラ座標系へ変換
    vert = Matrix.multiply(this.matrixNormalizer, vert); //カメラ座標系を正規化
    vert = Matrix.multiply(this.matrixProjector, vert); //透視投影変換
    //頂点(x,y,z,w)->(x/w, y/w, z/w, 1)へ変換
    vert = Matrix.multiplyByScalar(1 / vert.getElement(3, 0), vert); 
    return vert;
  }

  ProjectToScreen(vert) {
    //スクリーン座標変換
    //ビューポート座標系からスクリーン座標系へ。
    vert = this.Project(vert);
    console.log("変換テスト", Matrix.multiply(this.mx_ViewToScr, vert));
    return Matrix.multiply(this.mx_ViewToScr, vert);
  }

  setShift(x, y) {
    //オフセット定義
    this.shift_x = x
    this.shift_y = y
    this.mx_ViewToScr = this.makeViewToScr();
  }

}

module.exports = {
  Camera
}