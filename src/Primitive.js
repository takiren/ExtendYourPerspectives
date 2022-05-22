const { Matrix, Point } = require("/src/Matrix");
const { MultiPoly } = require("/src/MultiPoly");
const { Poly } = require("/src/Poly");

class PrimitiveBase {
    constructor(OriginMatrix, ScaleMatrix, RotationMatrix) {
        this.loc = OriginMatrix
        this.scl = ScaleMatrix
        this.rot = RotationMatrix
        this.poly = new Poly();
        this.poly.setOrigin(OriginMatrix)
        console.log("プリミティブが作成されました")
        this.createPoly()
    }

    createPoly() {
        console.error("基底クラスが呼び出されました．この関数は無効です")
        return false
    }

    setLocation(matrix) {
        this.loc = matrix
    }

    setScale(matrix) {
        this.scl = matrix
    }
    getPolys() {
    }
}

class PrimitivePlane extends PrimitiveBase {
    createPoly() {
        this.poly.verts.push(Matrix.makeVert(0.5, 0.5, 0))
        this.poly.verts.push(Matrix.makeVert(-0.5, 0.5, 0))
        this.poly.verts.push(Matrix.makeVert(-0.5, -0.5, 0))
        this.poly.verts.push(Matrix.makeVert(0.5, -0.5, 0))
        this.poly.setClosed()
        console.log("平面を作成")

        this.poly.transformOverride(this.rot)
    }

    getPoly() {
        return this.poly
    }
    IsClosed() {
        return this.poly.IsClosed()
    }
}

class PrimitiveBox extends PrimitiveBase {
    //-------WIP-------
    createPoly() {
        //箱は6面だから6ループ
        const MultiPolyBox = new MultiPoly()
        for (let index = 0; index < 6; index++) {
            let originPoint = new Point()
            switch (index) {
                case 0:
                    originPoint = new Point(0.5, 0, 0)
                    break
                case 1:
                    originPoint = new Point(-0.5, 1, 1)
                case 2:
                    originPoint = new Point(0, 0.5, 0)
                    break
                case 3:
                    originPoint = new Point(0, -0.5, 0)
                    break
                case 4:
                    originPoint = new Point(0, 0, 0.5)
                    break
                case 5:
                    originPoint = new Point(0, 0, -0.5)
                    break
            }
            MultiPolyBox.addPoly(
                new PrimitivePlane(
                    Matrix.multiply(ScaleMatrix, Point.add(originPoint, OriginMatrix)),
                    ScaleMatrix,
                    RotationMatrix
                )
            )
        }
        console.log("平面を作成")
        this.poly.TransformOverride(this.rot)
    }
    getPolys() {
        return new MultiPoly()
    }
}

module.exports = {
    PrimitivePlane
}