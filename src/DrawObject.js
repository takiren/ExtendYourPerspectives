class DrawObject{
    constructor(){
        this.elements=[]
    }

    getElements(){
        return this.elements;
    }
    addElement(elem){
        this.elements.push(elem)
    }
}

class DrawObjectElements{
    constructor(points,bClosed){
        this.bClosed=bClosed
        this.points=points
    }

    getPoints(){
        return this.points
    }

    setClosed(){
        this.bClosed=true
    }

    setUnclosed(){
        this.bClosed=false
    }

    IsClosed(){
        return this.bClosed
    }
}

module.exports={
    DrawObject,
    DrawObjectElements
}