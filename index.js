
const { Matrix, Point } = require("./Matrix");
const { entrypoints } = require("uxp");
const { Camera } = require("./Camera");
const { MultiPoly } = require("./MultiPoly");
const { PrimitivePlane } = require("./Primitive");
const { Drawer } = require("./Drawer");
const { World } = require("./World");

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

let app = window.require('photoshop').app;
let constants = window.require("photoshop").constants;
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

function createScene() {
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
  return new World(new Camera(c_pos, t_pos, window_distance, window_v_size, window_h_size, z_max, z_c_min, z_min, canvas_width, canvas_height));
}

async function dFunc(executionControl) {
  Init()
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

  const renderer = new Drawer(app, currentDoc, constants)

  let pNumX = Math.trunc(Number(document.getElementById("perseLineNumX").value))
  let pNumY = Math.trunc(Number(document.getElementById("perseLineNumY").value))
  let pNumZ = Math.trunc(Number(document.getElementById("perseLineNumZ").value))

  wld = createScene()
  wld.createPerse(
    pNumX,
    pNumY,
    pNumZ
  );
  await renderer.draw(wld.getDrawObjectPerse())
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

async function primitiveDraw(executionControl) {
  Init()
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

  wld = createScene()
  const renderer = new Drawer(app, currentDoc, constants)

  const IPrimitive = new PrimitivePlane(
    Matrix.makeVert(0, 0, 0),
    Matrix.makeScale(1, 1, 1),
    Matrix.makeRotationY(0)
  )

  console.table(wld.getDrawObject(IPrimitive.poly))
  await renderer.draw(wld.getDrawObject(IPrimitive.poly))
  await hostControl.resumeHistory(suspensionID);

}

async function generatePrimitive() {
  const Tprimitive = document.getElementById("menuPrimitives").value
  await require('photoshop').core.executeAsModal(primitiveDraw, { "commandName": "Test command" });


  switch (Tprimitive) {
    case plane:

      break;

    default:
      console.log("Nothing selected")
      break;
  }
}

function testFunction() {
  Init()
  const IPrimitive = new PrimitivePlane(
    Matrix.makeVert(0, 0, 0),
    Matrix.makeScale(1, 1, 1),
    Matrix.makeRotationY(0)
  )
  console.log(IPrimitive.getPoly())
  wld = createScene()
  console.log(wld.getDrawObject(IPrimitive.poly))
  console.log("IsClosed? : ", IPrimitive.IsClosed())
  wld.createPerse(3, 3, 3)
  console.log(wld.getDrawObjectPerse())
}

document.getElementById("btnGo").addEventListener("click", drawPerspective);
document.getElementById("btnUpdateCameraPath").addEventListener("click", updateSelectionCameraPath);
document.getElementById("pickerCamerapath").addEventListener("change", updateTextCamPath);
document.getElementById("updateTargetPaths").addEventListener("click", updateSelectionTargetPaths)
document.getElementById("menuTargets").addEventListener("dblclick", addPath)
document.getElementById("updateNormal").addEventListener("click", updateNormalPathPicker)
document.getElementById("pickerNormalLength").addEventListener("change", updateNormalText)
document.getElementById("btnGeneratePrimitive").addEventListener("click", generatePrimitive)
document.getElementById("btnReset").addEventListener("click", testFunction)