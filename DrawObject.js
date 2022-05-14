class DrawObject{
    constructor(Points,bClosed){
        this.bClosed=bClosed
        this.points=Points
    }

    getPoints(){
        return this.points
    }
    setClosed(){
        this.bClosed=true
    }

    IsClosed(){
        return this.bClosed
    }
}

module.exports={
    DrawObject
}