
const { Matrix, Point } = require("/src/Matrix");
const { Camera } = require("/src/Camera");
const { MultiPoly } = require("/src/MultiPoly");
const { PrimitivePlane } = require("/src/Primitive");
const { Drawer } = require("/src/Drawer");
const { World } = require("/src/World");
const { Vector, Vector2, Vector3 } = require("/src/Vector")

//タブの切り替え用イベント登録
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

const app = window.require('photoshop').app;
const constants = window.require("photoshop").constants;
let currentDoc; //現在のドキュメント
let canvas_height; //キャンバス縦
let canvas_width; //キャンバス横
let z_c_min; //最小クリッピング距離と最大クリッピング距離の比
let z_min; //最小クリッピング距離
let z_max; //最大クリッピング距離
let window_distance; //投影面までの距離

let horizontal_degree; //水平視野角 degree
let horizonta_rads; //水平視野角 radian
let vertical_rads; //水平視野角 radian
let window_v_size; //スクリーン縦サイズ
let window_h_size; //スクリーン横サイズ

let normalLength; //何pxを1mとするか。デフォルトは500px=1m

const Init=()=> {
  //初期化処理
  //こいつを呼ばないとcurrentDocが未定義だから描画されない。
  if (!app) {
  }
  console.log("Initializing...");
  currentDoc = app.activeDocument;
  console.log("Document Name:", currentDoc.title);
  canvas_height = currentDoc.height;
  console.log("Document Height:", currentDoc.height);
  canvas_width = currentDoc.width;
  console.log("Documen Width:", currentDoc.width);
  z_c_min = 0.0;
  z_min = 0.1;
  z_max = 1000.0;
  calc_z_c_min();
  window_distance = 1;
  InitCanvas();
  console.log("Initialized Success.");
  normalLength = Number(document.getElementById("inputNormal").value)
  return true;
}
const InitCanvas=()=> {
  //キャンバスの初期化(投影面とドキュメントのサイズの定義)
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

const createScene=()=> {
  //World, Cameraインスタンスを作成
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

  console.log("オフセットX", Number(document.getElementById("sliderOffsetX").value))
  return new World(
    new Camera(
      c_pos,
      t_pos,
      window_distance,
      window_v_size,
      window_h_size,
      z_max, z_c_min,
      z_min,
      canvas_width,
      canvas_height,
      Number(document.getElementById("sliderOffsetX").value),
      Number(document.getElementById("sliderOffsetY").value))
  );
}


//角度からラジアンに変換
const ang_to_rad=(ang)=> ang * Math.PI / 180

//ラジアンから角度へ
const rad_to_ang=(radian)=> radian * 180 / Math.PI

//最小クリッピング距離と最大クリッピング距離の差を計算。
const calc_z_c_min=()=> z_min / z_max

const updateSelectionTargetPaths=()=> {
  //変換対象のパスを指定。現在未使用
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

const updateSelectionCameraPath=()=> {
  addPathsToPicker("menuCameraPath", 1, 3)
  return
}

const addPath=()=> {
  const target = document.getElementById("menuTargets")
  const candidate = document.getElementById("menuCandidate")
  let newSpmenu = document.createElement("sp-menu-item")
  console.log(target.value)
  newSpmenu.textContent = target.value
  newSpmenu.value = target.value
  candidate.appendChild(newSpmenu)
}

const addPathsToPicker=(targetPickerName, subPathNum, pointsNum) =>{
  //条件に沿ったパスをtargePickerNameにアイテムとして登録
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
    console.log(newSpmenu.value)
    pickerNormal.appendChild(newSpmenu);
  }
}

const updateNormalPathPicker=()=> {
  addPathsToPicker("menuNormalLength", 1, 2)
}

const updateNormalText=()=> {
  //1mを何ピクセルとするかを決定。
  const element = document.getElementById("pickerNormalLength")
  if (!element.value) {
    return
  }
  const t = document.getElementById("inputNormal")
  const pathNormal = currentDoc.pathItems.getByName(element.value).subPathItems[0]
  const x = pathNormal.pathPoints[0].anchor[0] - pathNormal.pathPoints[1].anchor[0]
  const y = pathNormal.pathPoints[0].anchor[1] - pathNormal.pathPoints[1].anchor[1]
  const length = Math.sqrt(x ** 2 + y ** 2)
  t.value = Math.trunc(length);
  console.log(t.value)
}

const testFunction=()=> {
  //使い道はない。関数が正しく動くかを試すために雑に使っている。
  Init()
  console.log(Matrix.makeVert(
    Number(document.getElementById("primitivePosX").value),
    Number(document.getElementById("primitivePosY").value),
    Number(document.getElementById("primitivePosZ").value)
  ))
}

const calcCamera=()=> {
  //指定したパスから画角、カメラ位置、注視点を算出する関数。
  const element = document.getElementById("pickerCamerapath")
  if (!element.value) {
    console.error("カメラパスが指定されていません")
    return
  }
  console.log("カメラパスname ", element.value)
  const camPath = currentDoc.pathItems.getByName(element.value).subPathItems[0]
  console.log("カメラパス", camPath.pathPoints.length)
  const v1 = new Vector2()
  const v2 = new Vector2()
  v1.elements = [
    camPath.pathPoints[0].anchor[0] - camPath.pathPoints[1].anchor[0],
    camPath.pathPoints[0].anchor[1] - camPath.pathPoints[1].anchor[1]
  ]
  v2.elements = [
    camPath.pathPoints[2].anchor[0] - camPath.pathPoints[1].anchor[0],
    camPath.pathPoints[2].anchor[1] - camPath.pathPoints[1].anchor[1]
  ]
  console.table(v1.elements)
  console.table(v2.elements)
  console.log()
  const fov = Vector.formedAngle(v1, v2)
  console.log("カメラ画角", rad_to_ang(fov))
  const camLoc = new Vector2()
  camLoc.elements = [
    camPath.pathPoints[1].anchor[0] / normalLength,
    camPath.pathPoints[1].anchor[1] / normalLength
  ]
  const tagetVector = Vector.bisector(v1, v2)
  console.log(tagetVector)
  const targetLoc = Vector.add(tagetVector, camLoc)
  console.log("注視点", targetLoc)

  document.getElementById("cameraPosX").value = "" + camPath.pathPoints[1].anchor[0] / normalLength
  document.getElementById("cameraPosZ").value = "" + camPath.pathPoints[1].anchor[1] / normalLength

  document.getElementById("cameraTargetX").value = "" + targetLoc.elements[0]
  document.getElementById("cameraTargetZ").value = "" + targetLoc.elements[1]
  document.getElementById("cameraFOV").value = "" + rad_to_ang(fov)
}

const offsetReset=()=> {
  document.getElementById("sliderOffsetX").value = 0
  document.getElementById("sliderOffsetY").value = 0
}

const drawPrimitive=async()=> {
  //プリミティブを描画
  await require('photoshop').core.executeAsModal(DoPrimitiveDraw, { "commandName": "Drawing Primitive" });
}

const DoPrimitiveDraw=async(executionControl)=> {
  //プリミティブを描画
  Init()
  let hostControl = executionControl.hostControl;

  // Get an ID for a target document
  let documentID = await currentDoc.id;

  // Suspend history state on the target document
  // This will coalesce all changes into a single history state called
  // 'Custom Command'
  let suspensionID = await hostControl.suspendHistory({
    "documentID": documentID,
    "name": "プリミティブ描画"
  });

  //ここから
  wld = createScene()
  const renderer = new Drawer(app, currentDoc, constants) //Drawerをrendererでインスタンス化．
  const Tprimitive = document.getElementById("menuPrimitives").value

  const location = Matrix.makeVert(
    Number(document.getElementById("primitivePosX").value),
    Number(document.getElementById("primitivePosY").value),
    Number(document.getElementById("primitivePosZ").value)
  )
  const rotation = Matrix.makeRotationY(
    Number(document.getElementById("primitiveRotY").value)
  )

  switch (Tprimitive) {
    case 'plane':
      const IPrimitive = new PrimitivePlane(
        Matrix.makeVert(
          Number(document.getElementById("primitivePosX").value),
          Number(document.getElementById("primitivePosY").value),
          Number(document.getElementById("primitivePosZ").value)
        ),
        Matrix.makeScale(1, 1, 1),
        Matrix.makeRotationY(
          ang_to_rad(Number(document.getElementById("primitiveRotY").value))
        )
      )
      console.table(wld.getDrawObject(IPrimitive.poly))
      wld.addPoly(IPrimitive.poly)
      await renderer.draw(wld.getDrawObjectFromWorld())
      break;

    case 'box':
      break

    default:
      console.warn("プリミティブが未指定です．")
      await hostControl.resumeHistory(suspensionID)
      return
  }

  //ここまで
  await hostControl.resumeHistory(suspensionID);
}

const transformPath=async()=> {
  //パスの変形を行う
  await require('photoshop').core.executeAsModal(DoTransformPath, { "commandName": "Transformation" })
}

const DoTransformPath=async(executionControl) =>{
  Init()

  let hostControl = executionControl.hostControl

  let documentID = await currentDoc.id

  let suspensionID = await hostControl.suspendHistory({
    "documentID": documentID,
    "name": "パース変形"
  })

  wld = createScene()
  const renderer = new Drawer(app, currentDoc, constants)
  const path = currentDoc.pathItems.getByName(document.getElementById("menuTargets").value)
  wld.addMultiPoly(MultiPoly.createMultiPolyFromPath(path, 1 / normalLength))
  const Idobj = wld.getDrawObjectFromWorld()
  console.log(Idobj)
  await renderer.draw(Idobj)
  await hostControl.resumeHistory(suspensionID)
}

const drawPerspective= async()=> {
  await require('photoshop').core.executeAsModal(DoDrawPerspective, { "commandName": "Drawing Perspective lines" });
}

const DoDrawPerspective=async(executionControl)=> {
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
//イベント登録用

document.getElementById("btnGo").addEventListener("click", drawPerspective);
document.getElementById("btnUpdateCameraPath").addEventListener("click", updateSelectionCameraPath);
document.getElementById("updateNormal").addEventListener("click", updateNormalPathPicker)
document.getElementById("pickerNormalLength").addEventListener("change", updateNormalText)
document.getElementById("btnGeneratePrimitive").addEventListener("click", drawPrimitive)
document.getElementById("btnCalcCamera").addEventListener("click", calcCamera)
document.getElementById("btnResetOffset").addEventListener("click", offsetReset)
document.getElementById("btnTransform").addEventListener("click", transformPath)
document.getElementById("world").addEventListener("click", updateSelectionTargetPaths)