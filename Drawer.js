const { Matrix, Point } = require("./Matrix");
const { DrawObject } = require("./DrawObject")

class Drawer {
    constructor(app, currentDoc, constants) {
        this.app = app
        this.currentDoc = currentDoc
        this.constants = constants
        console.log("Drawer Initialized")
    }

    async draw(IDrawObject) {
        const spi = new this.app.SubPathInfo()
        spi.closed = IDrawObject.IsClosed()
        console.log(IDrawObject.IsClosed())
        spi.operation = this.constants.ShapeOperation.SHAPEXOR
        const verts = IDrawObject.getPoints()
        const entirePoint = []
        for (const key in verts) {
            if (Object.hasOwnProperty.call(verts, key)) {
                const element = verts[key];

                console.log(element)
                const IPathPoint = new this.app.PathPointInfo()

                IPathPoint.anchor = element
                IPathPoint.leftDirection = element
                IPathPoint.rightDirection = element
                IPathPoint.kind = this.constants.PointKind.CORNERPOINT
                entirePoint.push(IPathPoint)
            }
        }
        console.log("IsClosed? : ",spi.closed)
        spi.entireSubPath = entirePoint
        await this.currentDoc.pathItems.add("Primitive", [spi])
        const lines = this.currentDoc.pathItems.getByName("Primitive")
        await lines.strokePath()
        await lines.remove()
    }

}

module.exports = {
    Drawer
}