class Matrix {
    constructor(row, col) {
        if (row % 1 || col % 1) {
            //小数なら中断
            return false;
        }
        this.elements = new Array(row * col);
        this.elements.fill(0); //初期化処理
        this.row = row;
        this.col = col;
    }
    init() {
        if (row % 1 || col % 1) {
            //小数なら中断
            return false;
        }
        this.elements = new Array(row * col);
        this.elements.fill(0); //初期化処理
        this.row = row;
        this.col = col;
    }
    set(value) {
        this.elements = value;
    }

    reset(row, col) {
        if (row % 1 || col % 1) {
            //小数なら中断
            return false;
        }
        this.elements = new Array(row * col);
        this.elements.fill(0); //初期化処理
        this.row = row;
        this.col = col;
    }

    getElement(i, j) {
        return this.elements[i * this.col + j];
    }

    setElement(i, j, value) {
        this.elements[i * this.col + j] = value;
    }

    getByIndex(index) {
        return this.elements[index];
    }

    setByIndex(index, value) {
        this.elements[index] = value;
    }

    getDimension() {
        return Math.sqrt(this.elements.length);
    }

    getRow() {
        return this.row;
    }

    getCol() {
        return this.col;
    }

    static log(mat) {
        let tableLog = new Array(this.row);
        for (let m = 0; m < mat.row; m++) {
            let t = new Array(this.col);
            for (let n = 0; n < mat.col; n++) {
                t[n] = mat.elements[n + m * mat.col];
            }
            tableLog[m] = t;
        }
        return tableLog;
    }

    static makeNorm(vec) {
        //正規化，単位ベクトル化．
        var mx = new Matrix(3, 1);
        var e = Math.sqrt(vec.getElement(0, 0) ** 2 + vec.getElement(1, 0) ** 2 + vec.getElement(2, 0) ** 2);
        e = (1 / e);
        for (var i = 0; i < 3; i++) {
            mx.setElement(i, 0, vec.getElement(i, 0) * e);
        }
        return mx;
    }

    static makeTranslation(x, y, z) {
        var translation = this.makeScale(1, 1, 1);
        translation.setElement(0, 3, x);
        translation.setElement(1, 3, y);
        translation.setElement(2, 3, z);
        return translation;
    }

    static add(mat, mat2) {
        var m, n;
        var mx = new Matrix(mat.getRow(), mat.getCol());
        for (m = 0; m < mat.getRow(); m++) {
            for (n = 0; n < mat.getCol(); n++) {
                mx.setElement(m, n, mat.getElement(m, n) + mat2.getElement(m, n));
            }
        }
        return mx;
    }

    static Invert(mat) {
        const mx = new Matrix(mat.getRow(), mat.getCol());
        for (let m = 0; m < mat.getRow(); m++) {
            for (let n = 0; n < mat.getCol(); n++) {
                mx.setElement(m, n, -mat.getElement(m, n));
            }
        }
        return mx;
    }

    static makeScale(x, y, z) {
        var mx_S = new Matrix(4, 4);
        mx_S.elements = [
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        ];
        return mx_S;
    }

    static makeTranslationByMatrix(mat) {
        return this.makeTranslation(mat.getElement(0, 0), mat.getElement(1, 0), mat.getElement(2, 0))
    }

    static translateByMatrix(translater, target) {
        return this.multiply(this.makeTranslationByMatrix(translater), target)
    }

    static translate(mat, x, y, z) {
        return this.multiply(this.makeTranslation(x, y, z), mat);
    }

    static multiplyByScalar(scalar, mat) {
        var m, n;
        var transformed_mx = new Matrix(mat.getRow(), mat.getCol());

        for (m = 0; m < mat.getRow(); m++) {
            for (n = 0; n < mat.getCol(); n++) {
                //console.log(mat.getElement(m,n));
                transformed_mx.setElement(m, n, scalar * mat.getElement(m, n));
            }
        }
        return transformed_mx;
    }

    static multiply(multiplier, target) {
        if (multiplier.col != target.row) {
            //列と行が一致するか判定．
            return false;
        }
        var m, n, l, t;
        // m means row_index.
        // n means col_index.
        var transformed_matrix = new Matrix(multiplier.getRow(), target.getCol());
        for (m = 0; m < multiplier.getRow(); m++) {
            for (l = 0; l < target.getCol(); l++) {
                t = 0;
                for (n = 0; n < multiplier.getCol(); n++) {
                    t += multiplier.getElement(m, n) * target.getElement(n, l);
                }
                transformed_matrix.setElement(m, l, t);
            }
        }
        return transformed_matrix;
    }

    static makeSubMatrix(mat, i, j) {
        var mx = new Matrix(mat.row - 1, mat.row - 1);
        var m, n, index;
        index = 0;
        for (m = 0; m < mat.row; m++) {
            if (m == i) {
                continue;
            }
            for (n = 0; n < mat.col; n++) {
                if (n == j) {
                    continue;
                }
                mx.setByIndex(index, mat.getElement(m, n));
                index++;
            }
        }
        return mx;
    }

    static det(mat) {
        var m, t, dim;
        t = 0;
        dim = mat.getDimension();
        if (dim == 1) {
            return mat.getByIndex(0);
        }
        for (m = 0; m < dim; m++) {
            t += (-1) ** m * mat.getElement(0, m) * this.det(this.makeSubMatrix(mat, 0, m));
        }
        return t;
    }

    static transformFromWorldToView(mat) {
    }


    static makeRotationY(radian) {
        const mx = new Matrix(4, 4)
        mx.elements = [
            Math.cos(radian), 0, Math.sin(radian), 0,
            0, 1, 0, 0,
            -Math.sin(radian), 0, Math.cos(radian), 0,
            0, 0, 0, 1
        ]
        return mx
    }

    static makeAdjugate(mat) {
        var m, n, t, dim, mx;
        mx = new Matrix(mat.getRow(), mat.getCol());
        dim = mat.getDimension();
        t = 0;
        if (dim == 1) {
            return mat.getByIndex(0);
        }
        for (m = 0; m < dim; m++) {
            for (n = 0; n < dim; n++) {
                t = (-1) ** (m + n) * this.det(this.makeSubMatrix(mat, n, m));
                mx.setElement(m, n, t);
            }
        }
        return mx;
    }

    static makeInverse(mat) {
        var d, mx_a;
        d = this.det(mat);
        mx_a = this.Adjugate(mat);
        console.log(mx_a);
        mx_inv = this.MultiplyByScalar(1 / d, mx_a);
        return mx_inv;
    }

    static dot(vec1, vec2) {
        if (vec1.getCol() != 1) {
            console.error("ベクトルの計算しかできません．")
        }
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
        return vec1.getElement(0, 0) * vec2.getElement(0, 0) + vec1.getElement(1, 0) * vec2.getElement(1, 0) + vec1.getElement(2, 0) * vec2.getElement(2, 0);
    }

    static cross(vec1, vec2) {
        var mx = new Matrix(3, 1);
        mx.elements = [
            vec1.getElement(1, 0) * vec2.getElement(2, 0) - vec1.getElement(2, 0) * vec2.getElement(1, 0),
            vec1.getElement(2, 0) * vec2.getElement(0, 0) - vec1.getElement(0, 0) * vec2.getElement(2, 0),
            vec1.getElement(0, 0) * vec2.getElement(1, 0) - vec1.getElement(1, 0) * vec2.getElement(0, 0)
        ];
        return mx;
    }

    static transpose(mat) {
        var mx = new Matrix(mat.getRow(), mat.getRow());
        for (var m = 0; m < mat.getRow(); m++) {
            for (var n = 0; n < mat.getRow(); n++) {
                mx.setElement(m, n, mat.getElement(n, m));
            }
        }
        return mx;
    }

    static makeVert(x, y, z) {
        const v = new Matrix(4, 1)
        if (arguments.length != 3) {
            console.error("頂点座標を正しく入力してください")
            return
        }
        v.setElement(0, 0, x)
        v.setElement(1, 0, y)
        v.setElement(2, 0, z)
        v.setElement(3, 0, 1)
        return v
    }
}

class Point extends Matrix {
    constructor(x,y,z) {
        super(4, 1)
        if(arguments.length==3){
            this.elements=[
                x,
                y,
                z,
                1
            ]
        }
    }
}

exports.Matrix = Matrix
exports.Point = Point