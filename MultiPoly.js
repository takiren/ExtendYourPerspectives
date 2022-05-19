const { Matrix } = require("./Matrix");
const { Poly } = require("./Poly");

class MultiPoly {
  constructor() {
    this.origin=Matrix.makeVert(0,0,0)
    if(arguments.length!=0){
      this.origin=arguments[0]
    }
    this.polys = [];

    this.rotY=Matrix.makeRotationY(0)
    this.scl=Matrix.makeScale(1,1,1)
    this.loc=Matrix.makeTranslation(0,0,0)
  }

  setScale(scale){
    this.scl=scale
  }

  addPoly(poly) {
    this.polys.push(poly);
  }
  
  rotateY(radian){
  }

  getPolys(){
    return this.polys
  }
  static createMultiPolyFromPath(pathItem,scalar) {
    if(!scalar){
      console.error("Scalarを入れてください．")
      return
    }
    const mp = new MultiPoly();
    for (let index = 0; index < pathItem.subPathItems.length; index++) {
      const p = new Poly();
      const subPaths = pathItem.subPathItems[index];
      for (let indexj = 0; indexj < subPaths.pathPoints.length; indexj++) {
        const point = subPaths.pathPoints[indexj];
        const vert = new Matrix(4, 1);
        vert.elements = [
          point.anchor[0]*scalar,
          0,
          point.anchor[1]*scalar,
          1
        ];
        p.addVert(vert);
      }
      console.log(p);
      mp.addPoly(p);
    }
    return mp;
  }

  static createMultiPolyFromPathWithOffset(pathItem,scalar,offset) {
    if(!scalar){
      console.error("Scalarを入れてください．")
      return
    }
    const mp = new MultiPoly();
    for (let index = 0; index < pathItem.subPathItems.length; index++) {
      const p = new Poly();
      const subPaths = pathItem.subPathItems[index];
      for (let indexj = 0; indexj < subPaths.pathPoints.length; indexj++) {
        const point = subPaths.pathPoints[indexj];
        const vert = new Matrix(4, 1);
        vert.elements = [
          point.anchor[0]*scalar,
          0,
          point.anchor[1]*scalar,
          1
        ];
        p.addVert(vert);
      }
      console.log(p);
      mp.addPoly(p);
    }
    return mp;
  }

  
}
exports.MultiPoly = MultiPoly;
