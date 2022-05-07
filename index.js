
const { Matrix } = require("./Matrix");
Array.from(document.querySelectorAll(".sp-tab")).forEach(theTab => {
  theTab.onclick = () => {
    localStorage.setItem("currentTab", theTab.getAttribute("id"));
    Array.from(document.querySelectorAll(".sp-tab")).forEach(aTab => {
      if (aTab.getAttribute("id") === theTab.getAttribute("id")) {
        aTab.classList.add("selected");
      } else {
        aTab.classList.remove("selected");
      }
    });
    Array.from(document.querySelectorAll(".sp-tab-page")).forEach(tabPage => {
      if (tabPage.getAttribute("id").startsWith(theTab.getAttribute("id"))) {
        tabPage.classList.add("visible");
      } else {
        tabPage.classList.remove("visible");
      }
    });
  }
});

let app = window.require('photoshop').app;;
let constants = window.require("photoshop").constants;;
let currentDoc;
let canvas_height;
let canvas_width;
let max_split;
let z_c_min;
let z_min;
let z_max;
let window_distance;

let horizontal_degree;
let horizonta_rads;
let vertical_rads;
let window_v_size;
let window_h_size;

let cameraPos = [0, 0, 0];
let cameraTargetPos = [0, 0, 0];

let normalLength;

function Init() {
  if (!app) {
    // 初期化処理．
  }
  console.log("Initializing...");
  currentDoc = app.activeDocument;
  console.log("Document Name:", currentDoc.title);
  canvas_height = currentDoc.height;
  console.log("Document Height:", currentDoc.height);
  canvas_width = currentDoc.width;
  console.log("Documen Width:", currentDoc.width);
  max_split = 20;
  z_c_min = 0.0;
  z_min = 0.1;
  z_max = 1000.0;
  calc_z_c_min();
  window_distance = 1;
  InitCanvas();
  console.log("Initialized Success.");
  normalLength = document.getElementById("inputNormal")
  return true;
}

function InitCanvas() {
  //キャンバスの初期化．
  canvas_height = currentDoc.height;
  canvas_width = currentDoc.width;

  horizontal_degree = Number(document.getElementById("cameraFOV").value) / 2;
  horizonta_rads = ang_to_rad(horizontal_degree);
  vertical_rads = horizonta_rads * canvas_height / canvas_width;
  window_v_size = window_distance * Math.tan(vertical_rads);
  window_h_size = window_distance * Math.tan(horizonta_rads);
  calc_z_c_min();
  return;
}

function ang_to_rad(ang) {
  return ang * Math.PI / 180;
}
function calc_z_c_min() {
  z_c_min = z_min / z_max;
  return z_c_min;
}

class Camera {
  constructor(CameraPos, TargetPos, w_dis, wvsize, whsize, z_m, zchilda, zmi, c_width, c_height) {
    this.location = new Matrix(3, 1);
    this.location.elements = [
      CameraPos[0],
      CameraPos[1],
      CameraPos[2]
    ]

    console.log("カメラ座標", this.location);
    this.targetLoc = new Matrix(3, 1);
    this.targetLoc.elements = [
      TargetPos[0],
      TargetPos[1],
      TargetPos[2]
    ]

    this.canv_width = c_width
    this.canv_height = c_height

    this.axis = [new Matrix(3, 1), new Matrix(3, 1), new Matrix(3, 1)];

    this.w_distance = w_dis;
    this.w_hSize = whsize;
    this.w_vSize = wvsize;
    this.zMax = z_m;
    this.z_dash_min = zchilda;
    this.zMin = zmi;

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
    mx.elements = [
      this.axis[0].getElement(0, 0), this.axis[0].getElement(0, 1), this.axis[0].getElement(0, 2), -Matrix.dot(this.axis[0], this.location),
      this.axis[1].getElement(0, 0), this.axis[1].getElement(0, 1), this.axis[1].getElement(0, 2), -Matrix.dot(this.axis[1], this.location),
      this.axis[2].getElement(0, 0), this.axis[2].getElement(0, 1), this.axis[2].getElement(0, 2), -Matrix.dot(this.axis[2], this.location),
      0, 0, 0, 1
    ];
    return mx;
  }

  makeViewToScr() {
    let mx = new Matrix(4, 4);
    mx.elements = [
      this.canv_width / 2, 0, 0, this.canv_width / 2,
      0, this.canv_height / 2, 0, this.canv_height / 2,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
    console.table("ターブル", mx)
    return mx;
  }

  makeNormalize() {
    return Matrix.makeScale(this.w_distance / (this.zMax * this.w_hSize), this.w_distance / (this.w_vSize * this.zMax), 1 / this.zMax);
  }

  makeProjection() {
    calc_z_c_min();
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
    console.log("スクリーン座標変換", this.mx_ViewToScr)
    console.log("変換テスト", Matrix.multiply(this.mx_ViewToScr, vert))
    return Matrix.multiply(this.mx_ViewToScr, vert);
  }

}

class World {
  constructor() {
    this.multiPolys = [];
    const c_pos = [
      Number(document.getElementById("cameraPosX").value),
      Number(document.getElementById("cameraPosY").value),
      Number(document.getElementById("cameraPosZ").value)
    ]

    const t_pos = [
      Number(document.getElementById("cameraTargetX").value),
      Number(document.getElementById("cameraTargetY").value),
      Number(document.getElementById("cameraTargetZ").value)
    ]
    console.table(c_pos)
    console.table(t_pos)
    calc_z_c_min();
    this.instanceCam = new Camera(c_pos, t_pos, window_distance, window_v_size, window_h_size, z_max, z_c_min, z_min, canvas_width, canvas_height);
    console.log("World Initialized")
    this.PersepectivePolys = [];
  }

  addPoly(p) {
    this.multiPolys.push(p)
  }

  createPerse() {
    let pNumX = Math.trunc(Number(document.getElementById("perseLineNumX").value))
    let pNumY = Math.trunc(Number(document.getElementById("perseLineNumY").value))
    let pNumZ = Math.trunc(Number(document.getElementById("perseLineNumZ").value))
    for (let index = 0; index < pNumZ + 1; index++) {
      let vert1 = new Matrix(4, 1)
      let vert2 = new Matrix(4, 1)
      vert1.elements = [
        pNumX,
        0,
        index,
        1
      ]

      vert2.elements = [
        0,
        0,
        index,
        1
      ]
      this.PersepectivePolys.push(Poly.createLine(vert1, vert2))
    }

    for (let index = 0; index < pNumX + 1; index++) {
      let vert1 = new Matrix(4, 1)
      let vert2 = new Matrix(4, 1)
      vert1.elements = [
        index,
        0,
        pNumZ,
        1
      ]

      vert2.elements = [
        index,
        0,
        0,
        1
      ];
      this.PersepectivePolys.push(Poly.createLine(vert1, vert2))

    }
    console.log("パースライン", this.PersepectivePolys)
  }

  async drawPerse(executionControl) {
    const spis = []
    for (let index = 0; index < this.PersepectivePolys.length; index++) {
      const element = this.PersepectivePolys[index];
      let startp = this.instanceCam.ProjectToScreen(element.verts[0])
      let endp = this.instanceCam.ProjectToScreen(element.verts[1])
      let s_p = [startp.getElement(0, 0), startp.getElement(1, 0)]
      let e_p = [endp.getElement(0, 0), endp.getElement(1, 0)]

      console.log("始点", startp, "終点", endp)

      const startPoint = new app.PathPointInfo();
      startPoint.anchor = s_p;
      startPoint.leftDirection = s_p;
      startPoint.rightDirection = s_p;
      startPoint.kind = constants.PointKind.CORNERPOINT;
      const stopPoint = new app.PathPointInfo();
      stopPoint.anchor = e_p;
      stopPoint.leftDirection = e_p;
      stopPoint.rightDirection = e_p;
      stopPoint.kind = constants.PointKind.CORNERPOINT;

      const spi = new app.SubPathInfo()
      spi.closed = false;
      spi.operation = constants.ShapeOperation.SHAPEXOR
      spi.entireSubPath = [startPoint, stopPoint]
      spis.push(spi)
    }
    await currentDoc.pathItems.add("Lines", spis)
    const lines = currentDoc.pathItems.getByName("Lines");
    await lines.strokePath();
    await lines.remove();
  }

  createPerseX(index) {

  }

  static async drawAll() {

  }

}

class MultiPoly {
  constructor() {
    this.polys = []
  }
  addPoly(poly) {
    this.polys.push(poly)
  }

  static createMultiPolyFromPath(pathItem) {
    const mp = new MultiPoly()
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
        ]
        p.addVert(vert)
      }
      console.log(p)
      mp.addPoly(p)
    }
    console.log(mp)
    return mp;
  }
}

class Poly {
  constructor() {
    this.origin = new Matrix(4, 1);
    this.verts = [];
  }

  addVert(vec) {
    this.verts.push(vec)
  }

  static createLine(v1, v2) {
    const p = new Poly();
    p.addVert(v1)
    p.addVert(v2)
    return p;
  }

  static createPoly(...args) {
    for (const key in arguments) {
      if (Object.hasOwnProperty.call(arguments, key)) {
        const element = arguments[key];
        this.verts.push(element)
      }
    }
  }

  static addPerspectives() {

  }

  static createPolyFromPath(pathItem) {
    for (const key in pathItem) {
      if (Object.hasOwnProperty.call(pathItem, key)) {
        const element = pathItem[key];
        console.log(element)
      }
    }
  }
}


class PerspectiveLine {
  constructor() {
  }
}

class Draw {
  constructor() {

  }

  static async line(s_p, e_p) {
    const startPoint = new app.PathPointInfo();
    startPoint.anchor = s_p;
    startPoint.leftDirection = s_p;
    startPoint.rightDirection = s_p;
    startPoint.kind = constants.PointKind.CORNERPOINT;
    const stopPoint = new app.PathPointInfo();
    stopPoint.anchor = e_p;
    stopPoint.leftDirection = e_p;
    stopPoint.rightDirection = e_p;
    stopPoint.kind = constants.PointKind.CORNERPOINT;

    const spi = new app.SubPathInfo();
    spi.closed = false;
    spi.operation = constants.ShapeOperation.SHAPEXOR;
    spi.entireSubPath = [startPoint, stopPoint];
    let line = await currentDoc.pathItems.add("Line", [spi]);
    line = currentDoc.pathItems.getByName("Line");
    await line.strokePath();
    console.log("Draw Line");
    line.remove();
  }

  static async persepectiveLines(executionControl) {
    Init();
    let camera = new Camera();

    let hostControl = executionControl.hostControl;

    // Get an ID for a target document
    let documentID = await currentDoc.id;

    // Suspend history state on the target document
    // This will coalesce all changes into a single history state called
    // 'Custom Command'
    let suspensionID = await hostControl.suspendHistory({
      "documentID": documentID,
      "name": "Custom Command"
    });
    // modify the document
    // . . .

    let vert1 = new Matrix(4, 1);
    let vert2 = new Matrix(4, 1);
    let pNum = Math.trunc(Number(document.getElementById("perseLineNum").value));

    console.log("Draw Perspectives", documentID);
    for (var i = 0; i < pNum + 1; i++) {
      executionControl.reportProgress({ "value": 1 / (pNum * 2) * (i + 1), "commandName": "Drawing lines" });
      vert1.elements = [
        pNum,
        0,
        i,
        1
      ];

      vert2.elements = [
        0,
        0,
        i,
        1
      ];

      let startp = camera.ProjectToScreen(vert1);
      let endp = camera.ProjectToScreen(vert2);
      let s_p = [startp.getElement(0, 0), startp.getElement(1, 0)];
      let e_p = [endp.getElement(0, 0), endp.getElement(1, 0)];

      const startPoint = new app.PathPointInfo();
      startPoint.anchor = s_p;
      startPoint.leftDirection = s_p;
      startPoint.rightDirection = s_p;
      startPoint.kind = constants.PointKind.CORNERPOINT;
      const stopPoint = new app.PathPointInfo();
      stopPoint.anchor = e_p;
      stopPoint.leftDirection = e_p;
      stopPoint.rightDirection = e_p;
      stopPoint.kind = constants.PointKind.CORNERPOINT;

      const spi = new app.SubPathInfo();
      spi.closed = false;
      spi.operation = constants.ShapeOperation.SHAPEXOR;
      spi.entireSubPath = [startPoint, stopPoint];
      let line = await currentDoc.pathItems.add("Line", [spi]);
      line = currentDoc.pathItems.getByName("Line");
      await line.strokePath();
      console.log("Draw Line");
      line.remove();

    }

    for (var i = 0; i < pNum + 1; i++) {
      executionControl.reportProgress({ "value": 1 / (pNum * 2) * (i + 1 + pNum), "commandName": "Drawing lines" });

      vert1.elements = [
        i,
        0,
        pNum,
        1
      ];

      vert2.elements = [
        i,
        0,
        0,
        1
      ];

      let startp = camera.ProjectToScreen(vert1);
      let endp = camera.ProjectToScreen(vert2);
      let s_p = [startp.getElement(0, 0), startp.getElement(1, 0)];
      let e_p = [endp.getElement(0, 0), endp.getElement(1, 0)];

      const startPoint = new app.PathPointInfo();
      startPoint.anchor = s_p;
      startPoint.leftDirection = s_p;
      startPoint.rightDirection = s_p;
      startPoint.kind = constants.PointKind.CORNERPOINT;
      const stopPoint = new app.PathPointInfo();
      stopPoint.anchor = e_p;
      stopPoint.leftDirection = e_p;
      stopPoint.rightDirection = e_p;
      stopPoint.kind = constants.PointKind.CORNERPOINT;

      const spi = new app.SubPathInfo();
      spi.closed = false;
      spi.operation = constants.ShapeOperation.SHAPEXOR;
      spi.entireSubPath = [startPoint, stopPoint];
      let line = await currentDoc.pathItems.add("Line", [spi]);
      line = currentDoc.pathItems.getByName("Line");
      await line.strokePath();
      console.log("Draw Line");
      line.remove();
    }

    // resume the history state
    await hostControl.resumeHistory(suspensionID);
  }
}


function updateSelectionEyelevel() {
  if (!Init()) {
    console.alert("Initialize Failed")
    return;
  }
  const eyelevelElement = document.getElementById("menuEyelevel");
  var i;
  while (eyelevelElement.lastChild) {
    eyelevelElement.removeChild(eyelevelElement.lastChild);
  }

  var pathItems = currentDoc.pathItems;
  for (i = 0; i < pathItems.length; i++) {
    var path = pathItems[i];
    console.log("Name", path.name, "Path length.", path.subPathItems.length, "Type:", path.kind);
    if (path.kind != constants.PathKind.NORMALPATH || path.subPathItems.length != 1) {
      console.log("Loop passed.")
      continue;
    }
    if (path.subPathItems[0].pathPoints.length != 2) {
      continue;
    }
    var newSpmenu = document.createElement("sp-menu-item");
    newSpmenu.textContent = path.name;
    newSpmenu.value = path.name;
    eyelevelElement.appendChild(newSpmenu);
  }
}

function updateSelectionTargetPaths() {
  Init();
  const tarPathElement = document.getElementById("menuTargets")
  while (tarPathElement.lastChild) {
    tarPathElement.removeChild(tarPathElement.lastChild);
  }
  const pathItems = currentDoc.pathItems
  console.log(currentDoc)
  for (let index = 0; index < pathItems.length; index++) {
    const element = pathItems[index];
    const newSpmenu = document.createElement("sp-menu-item")
    newSpmenu.textContent = element.name
    newSpmenu.value = element.name
    tarPathElement.appendChild(newSpmenu)
    console.log(element.name)
  }
}

function updateSelectionCameraPath() {
  if (!Init()) {
    console.alert("Initialize Failed")
    return;
  }
  const camPathlElement = document.getElementById("menuCameraPath");
  var i;
  while (camPathlElement.lastChild) {
    camPathlElement.removeChild(camPathlElement.lastChild);
  }

  var pathItems = currentDoc.pathItems;

  for (i = 0; i < pathItems.length; i++) {
    var path = pathItems[i];
    console.log("Name", path.name, "Path length.", path.subPathItems.length, "Type:", path.kind);
    if (path.kind != constants.PathKind.NORMALPATH || path.subPathItems.length != 1) {
      console.log("Loop passed.")
      continue;
    }
    if (path.subPathItems[0].pathPoints.length != 3) {
      continue;
    }
    var newSpmenu = document.createElement("sp-menu-item");
    newSpmenu.textContent = path.name;
    newSpmenu.value = path.name;
    camPathlElement.appendChild(newSpmenu);
  }
}

function addPath() {
  const target = document.getElementById("menuTargets")
  const candidate = document.getElementById("menuCandidate")
  let newSpmenu = document.createElement("sp-menu-item")
  console.log(target.value)
  newSpmenu.textContent = target.value
  newSpmenu.value = target.value
  candidate.appendChild(newSpmenu)
}

function updateTextEyelevel() {
  console.log("Updating text");
  if (document.getElementById("menuEyelevel").length == 0) {
    return false;
  }
  const index = document.getElementById("pickerEyelevel");
  var textElement = document.getElementById("textEyelevel");
  textElement.textContent = index.selectedIndex.value;
}

function updateTextCamPath() {
  return;
  console.log("Updating text");
  if (document.getElementById("menuCameraPath").childElementCount == 0) {
    console.log("No item");
    return false;
  }
  const indexss = document.getElementById("pickerCamerapath");
  console.log(indexss.selectedIndex);
  var textElement = document.getElementById("textCameraPath");
  textElement.textContent = indexss.value;
}

async function drawPerspective() {
  await require('photoshop').core.executeAsModal(dFunc, { "commandName": "Test command" });
}

async function dFunc(executionControl) {
  Init();
  let hostControl = executionControl.hostControl;

  // Get an ID for a target document
  let documentID = await currentDoc.id;

  // Suspend history state on the target document
  // This will coalesce all changes into a single history state called
  // 'Custom Command'
  let suspensionID = await hostControl.suspendHistory({
    "documentID": documentID,
    "name": "パース描画"
  });
  wld = new World();
  console.log("TestLog")
  wld.createPerse();
  await wld.drawPerse();

  await hostControl.resumeHistory(suspensionID);

}

function addPathsToPicker(targetPickerName, subPathNum, pointsNum) {
  if (!Init()) {
    console.alert("Initialize Failed")
    return;
  }
  const pickerNormal = document.getElementById(targetPickerName);
  var i;
  while (pickerNormal.lastChild) {
    pickerNormal.removeChild(pickerNormal.lastChild);
  }

  var pathItems = currentDoc.pathItems;

  for (i = 0; i < pathItems.length; i++) {
    var path = pathItems[i];
    if (path.kind != constants.PathKind.NORMALPATH || path.subPathItems.length != subPathNum) {
      continue;
    }
    if (path.subPathItems[0].pathPoints.length != pointsNum) {
      continue;
    }
    var newSpmenu = document.createElement("sp-menu-item");
    newSpmenu.textContent = path.name;
    newSpmenu.value = path.name;
    pickerNormal.appendChild(newSpmenu);
  }
}

function updateNormalPathPicker() {
  addPathsToPicker("menuNormalLength", 1, 2)
}

const { entrypoints } = require("uxp");

const createBase = (elm) => {
  const container = document.createElement("div");
  container.className = "group"
  container.id = "canvasGroup"
  elm.appendChild(container);
  return { container: container };
}

class CreatePanel {
  constructor() {

  }
  static createGroup(base, label) {
    const container = document.createElement("div")
    container.className = "group"
    container.id = "primitibeGroup"
    base.appendChild(container)
  }

  static createFooter() {

  }
}

entrypoints.setup({
  panels: {
    vanilla: {
      show(event) {
      }
    },
    canvas: {
      show(event) {
        CreatePanel.createGroup(event.node, "")
      }
    }
  }
});

function canvasTest() {
  Init()
  MultiPoly.createMultiPolyFromPath(currentDoc.pathItems.getByName("パス 4"))
}

function updateSelectionNormal() {
}

function updateNormalText() {
  const element = document.getElementById("pickerNormalLength")
  if (!element.value) {
    return
  }
  const t = document.getElementById("textNormal")
  const pathNormal = currentDoc.pathItems.getByName(element.value).subPathItems[0]
  const x = pathNormal.pathPoints[0].anchor[0] - pathNormal.pathPoints[1].anchor[0]
  const y = pathNormal.pathPoints[0].anchor[1] - pathNormal.pathPoints[1].anchor[1]
  const length = Math.sqrt(x ** 2 + y ** 2)
  console.log(length)
  t.textContent = "" + Math.trunc(length) + "px = 1m";
}

function pathLength(a, b) {
  const x = a.anchor[0] - b.anchor[0]
  const y = a.anchor[1] - b.anchor[1]
  const length = Math.sqrt(x ** 2 + y ** 2)
  return length
}

function calcCamera() {
  const element = document.getElementById("pickerNormalLength")
  if (!element.value) {
    return
  }
}

document.getElementById("btnGo").addEventListener("click", drawPerspective);
document.getElementById("btnUpdateCameraPath").addEventListener("click", updateSelectionCameraPath);
document.getElementById("pickerCamerapath").addEventListener("change", updateTextCamPath);
document.getElementById("updateTargetPaths").addEventListener("click", updateSelectionTargetPaths)
document.getElementById("menuTargets").addEventListener("dblclick", addPath)
document.getElementById("btnReset").addEventListener("click", canvasTest)
document.getElementById("updateNormal").addEventListener("click", updateNormalPathPicker)
document.getElementById("pickerNormalLength").addEventListener("change", updateNormalText)