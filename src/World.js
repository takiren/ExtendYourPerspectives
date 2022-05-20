const { Matrix, Point } = require("/src/Matrix");
const { Poly } = require("/src/Poly");
const { MultiPoly } = require("/src/MultiPoly")
const { DrawObject, DrawObjectElements } = require("/src/DrawObject");

class World {
  constructor(CameraInstance) {
    this.multiPolys = [];
    this.polys = []
    this.instanceCam = CameraInstance;
    console.log("World Initialized");
    this.PersepectivePolys = [];
  }
  
  addPoly(p) {
    this.polys.push(p)
  }
  addMultiPoly(mp) {
    this.multiPolys.push(mp)
  }

  createPerse(NumX, NumY, NumZ) {
    //パースライン生成
    for (let index = 0; index < NumZ + 1; index++) {
      let vert1 = new Matrix(4, 1);
      let vert2 = new Matrix(4, 1);
      vert1.elements = [
        NumX,
        0,
        index,
        1
      ];

      vert2.elements = [
        0,
        0,
        index,
        1
      ];
      this.PersepectivePolys.push(Poly.createLine(vert1, vert2));
    }

    for (let index = 0; index < NumX + 1; index++) {
      let vert1 = new Matrix(4, 1);
      let vert2 = new Matrix(4, 1);
      vert1.elements = [
        index,
        0,
        NumZ,
        1
      ];

      vert2.elements = [
        index,
        0,
        0,
        1
      ];
      this.PersepectivePolys.push(Poly.createLine(vert1, vert2));
    }

      for (let index = 0; index < NumY + 1; index++) {
        let vert1 = new Point(0, index, 0)
        let vert2 = new Point(NumX, index, 0)
        this.PersepectivePolys.push(Poly.createLine(vert1, vert2))
      }
      for (let index = 0; index < NumX + 1; index++) {
        let vert1 = new Point(index, 0, 0)
        let vert2 = new Point(index, NumY, 0)
        this.PersepectivePolys.push(Poly.createLine(vert1, vert2))
      }
    

    console.log("パースライン", this.PersepectivePolys);
  }

  IsClosed(poly) {
    return poly.IsClosed();
  }

  getDrawObjectFromWorld() {
    const IDrawObject = new DrawObject()

    for (const key in this.polys) {
      if (Object.hasOwnProperty.call(this.polys, key)) {
        const element = this.polys[key];
        IDrawObject.addElement(this.getDrawObjectElement(element))
      }
    }

    for (const key in this.multiPolys) {
      if (Object.hasOwnProperty.call(this.multiPolys, key)) {
        const multipoly = this.multiPolys[key];
        for (const key in multipoly.getPolys()) {
          if (Object.hasOwnProperty.call(multipoly.getPolys(), key)) {
            const poly = multipoly.getPolys()[key];
            IDrawObject.addElement(this.getDrawObjectElement(poly))
          }
        }
      }
    }

    return IDrawObject
  }

  getDrawObjectElement(poly) {
    //Poly -> DrawObjectElement
    const pointsOnScreen = [];
    const verts = poly.getVertsWorld();
    for (const key in verts) {
      if (Object.hasOwnProperty.call(verts, key)) {
        const element = verts[key];
        const pMatrix = this.instanceCam.ProjectToScreen(element);
        pointsOnScreen.push([
          pMatrix.getElement(0, 0),
          pMatrix.getElement(1, 0)
        ])
      }
    }
    console.log("PolyIsClosed", poly.IsClosed())
    const IDrawObjectElements = new DrawObjectElements(pointsOnScreen, poly.IsClosed());

    return IDrawObjectElements
  }

  getDrawObject(poly) {
    //直接DrawObjectを取得するための関数。　多分いらない
    const IDrawObject = new DrawObject();
    IDrawObject.addElement(this.getDrawObjectElement(poly));
    return IDrawObject;
  }

  getDrawObjectFromMultiPoly(multipoly) {
    //直接DrawObjectを取得するための関数。　多分いらない
    const IDrawObject = new DrawObject();
    const IMultiPoly = multipoly.getPolys();

    for (const key in IMultiPoly) {
      if (Object.hasOwnProperty.call(IMultiPoly, key)) {
        const elementPoly = IMultiPoly[key];
        const pointsOnScreen = []
        const verts = elementPoly.getVertsWorld()

        for (const key in verts) {
          if (Object.hasOwnProperty.call(verts, key)) {
            const element = verts[key];
            const pMatrix = this.instanceCam.ProjectToScreen(element)
            pointsOnScreen.push([
              pMatrix.getElement(0, 0),
              pMatrix.getElement(1, 0)
            ])
          }
        }
        const IDrawObjectElements = new DrawObjectElements(pointsOnScreen, elementPoly.IsClosed())
        IDrawObject.addElement(IDrawObjectElements)
      }
    }

    return IDrawObject
  }

  getDrawObjectPerse() {
    const IDrawObject = new DrawObject();
    for (const key in this.PersepectivePolys) {
      if (Object.hasOwnProperty.call(this.PersepectivePolys, key)) {
        const poly = this.PersepectivePolys[key];
        IDrawObject.addElement(this.getDrawObjectElement(poly))
      }
    }
    return IDrawObject
  }

}
exports.World = World;
