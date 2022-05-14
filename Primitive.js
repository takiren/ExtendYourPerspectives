const { Matrix } = require("./Matrix");
const { Poly } = require("./Poly");

class PrimitiveBase {
    constructor(OriginMatrix, ScaleMatrix, RotationMatrix) {
        this.loc = OriginMatrix
        this.scl = ScaleMatrix
        this.rot = RotationMatrix
        this.poly=new Poly();
        this.poly.setOrigin(OriginMatrix)
        console.log("プリミティブが作成されました")
        this.createPoly()
    }

    createPoly(){
        console.error("基底クラスが呼び出されました．この関数は無効です")
        return false
    }
}

class PrimitivePlane extends PrimitiveBase{
    createPoly(){
        this.poly.verts.push(Matrix.makeVert(0.5,0.5,0))
        this.poly.verts.push(Matrix.makeVert(-0.5,0.5,0))
        this.poly.verts.push(Matrix.makeVert(-0.5,-0.5,0))
        this.poly.verts.push(Matrix.makeVert(0.5,-0.5,0))
        this.poly.setClosed()
        console.log("平面を作成")
    }

    getPoly(){
        return this.poly
    }
    IsClosed(){
        return this.poly.IsClosed()
    }
}

class PrimitiveBox extends PrimitiveBase{
}

module.exports = {
    PrimitivePlane
}