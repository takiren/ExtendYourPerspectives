const {Vector, Vector2}=require("./Vector")

const v1=new Vector2()
const v2=new Vector2()
v1.elements=[2,1]
v2.elements=[1,3]

console.log(Vector.dot(v1,v2))