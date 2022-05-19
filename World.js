const { Matrix } = require("./Matrix");
const { Poly } = require("./Poly");
const { MultiPoly } = require("./MultiPoly")
const { DrawObject, DrawObjectElements } = require("./DrawObject");

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

  createPerse(x, y, z) {
    for (let index = 0; index < z + 1; index++) {
      let vert1 = new Matrix(4, 1);
      let vert2 = new Matrix(4, 1);
      vert1.elements = [
        x,
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

    for (let index = 0; index < x + 1; index++) {
      let vert1 = new Matrix(4, 1);
      let vert2 = new Matrix(4, 1);
      vert1.elements = [
        index,
        0,
        z,
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
    console.log("パースライン", this.PersepectivePolys);
  }

  getScreenLocs(poly) {
    const v_scr = [];
    const verts = poly.getVertsWorld();
    console.table("頂点座標", v_scr);
    for (const key in verts) {
      if (Object.hasOwnProperty.call(verts, key)) {
        const element = verts[key];
        v_scr.push(this.instanceCam.ProjectToScreen(element));
      }
    }

    return v_scr;
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
    const pointsOnScreen = [];
    const verts = poly.getVertsWorld();
    for (const key in verts) {
      if (Object.hasOwnProperty.call(verts, key)) {
        const element = verts[key];
        const pMatrix = this.instanceCam.ProjectToScreen(element);
        pointsOnScreen.push([
          pMatrix.getElement(0, 0),
          pMatrix.getElement(1, 0)
        ]);
      }
    }
    console.log("PolyIsClosed", poly.IsClosed());
    const IDrawObjectElements = new DrawObjectElements(pointsOnScreen, poly.IsClosed());

    return IDrawObjectElements
  }

  getDrawObject(poly) {
    const IDrawObject = new DrawObject();

    IDrawObject.addElement(this.getDrawObjectElement(poly));
    return IDrawObject;
  }

  getDrawObjectFromMultiPoly(multipoly) {
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
        const element = this.PersepectivePolys[key];
        console.table("パース", element);
        const startp = this.instanceCam.ProjectToScreen(element.verts[0]);
        const endp = this.instanceCam.ProjectToScreen(element.verts[1]);

        const s_p = [
          startp.getElement(0, 0),
          startp.getElement(1, 0)
        ];
        const e_p = [
          endp.getElement(0, 0),
          endp.getElement(1, 0)
        ];

        IDrawObject.addElement(
          new DrawObjectElements([s_p, e_p], false)
        );

      }
    }

    return IDrawObject;
  }

  getScreenLocations(poly) {
    const pointsOnScreen = [];
    const verts = poly.getVertsWorld();
    for (const key in verts) {
      if (Object.hasOwnProperty.call(verts, key)) {
        const element = verts[key];
        const pMatrix = this.instanceCam.ProjectToScreen(element);
        pointsOnScreen.push([
          pMatrix.getElement(0, 0),
          pMatrix.getElement(1, 0)
        ]);
      }
    }

    const IDrawObject = new DrawObject(pointsOnScreen, poly.IsClosed());

    return IDrawObject;
  }

}
exports.World = World;
