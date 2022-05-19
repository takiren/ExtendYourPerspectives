const { Matrix } = require("./Matrix")

class Vector extends Matrix {
    constructor(n) {
        super(n, 1)
    }

    getLength() {
        const loopNum = this.getRow()
        let length = 0
        for (let index = 0; index < loopNum; index++) {
            length += this.elements[index] ** 2
        }
        return Math.sqrt(length)
    }

    scale(scalar) {
        for (const key in this.elements) {
            if (Object.hasOwnProperty.call(this.elements, key)) {
                this.elements[key] = this.elements * scalar;
            }
        }
    }


    static dot(vec1, vec2) {
        const loopNum = vec1.getRow()
        if (loopNum != vec2.getRow()) {
            console.error("ベクトルの次元が等しくありません")
            return null
        }

        let nDot = 0;
        for (let index = 0; index < loopNum; index++) {
            nDot += vec1.elements[index] * vec2.elements[index]
        }
        return nDot
    }

    static formedAngle(vec1, vec2) {
        const vec_dot = Vector.dot(vec1, vec2)
        const cos_theta = vec_dot / (vec1.getLength() * vec2.getLength())
        return Math.acos(cos_theta)
    }

    static bisector(vec1, vec2) {

        const v1 = Matrix.multiplyByScalar(vec2.getLength(), vec1)
        const v2 = Matrix.multiplyByScalar(vec1.getLength(), vec2)
        const upper = Vector.add(v1, v2)
        console.log("分子", upper)
        const lower = vec1.getLength() + vec2.getLength()
        return Matrix.multiplyByScalar(1 / lower, upper)
    }

    static bisector2(vec1, vec2) {
        const v1 = Matrix.multiplyByScalar(1 / vec1.getLength(), vec1)
        const v2 = Matrix.multiplyByScalar(1 / vec2.getLength(), vec2)

        return Vector.add(v1, v2)
    }

    static add2(vec1, vec2) {
        const vec = new Vector(vec1.getRow());
        for (let m = 0; m < mat.getRow(); m++) {
            vec.setElement(m, 0, vec1.getElement(m, 0) + vec2.getElement(m, 0))
        }
        return vec;
    }
}

class Vector2 extends Vector {
    constructor() {
        super(2)
    }
}
class Vector3 extends Vector {
    constructor() {
        super(3)
    }
}

module.exports = {
    Vector,
    Vector2,
    Vector3
}