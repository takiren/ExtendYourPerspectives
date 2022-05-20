const { Matrix, Point } = require("./Matrix");
const { DrawObject, DrawObjectElements } = require("./DrawObject")

class Drawer {
    constructor(app, currentDoc, constants) {
        this.app = app
        this.currentDoc = currentDoc
        this.constants = constants
        console.log("Drawer Initialized")
    }

    async draw(IDrawObject) {
        console.log("DrawCall")
        const spis = []
        const FDrawObject = IDrawObject.getElements()
        for (const key in FDrawObject) {
            if (Object.hasOwnProperty.call(FDrawObject, key)) {
                const DObjectElement = FDrawObject[key];
                const spi = new this.app.SubPathInfo()
                
                spi.closed = DObjectElement.IsClosed()
                spi.operation = this.constants.ShapeOperation.SHAPEXOR
                console.log("ポイント",DObjectElement)
                
                const verts = DObjectElement.getPoints()
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
                spi.entireSubPath = entirePoint
                spis.push(spi)
            }
        }

        await this.currentDoc.pathItems.add("Primitive", spis)
        const lines = this.currentDoc.pathItems.getByName("Primitive")
        await lines.strokePath()
        await lines.remove()
    }

}

module.exports = {
    Drawer
}