const col = require("./collection.js")

module.exports = class {

constructor(db , ready){
this._db = db
this._ready = ready
this.name = db.databaseName
}



async collection(name){
if(!this._ready.value) return new Error("the db is not ready!")
if(!name) return new Error("the name of the collection must be inserted")
if(typeof name !== "string") return new Error("The Name must be string")
let col1 = this._db.collection(name)
if(!col1) return null;
return new col(col1 , this._ready)
}





}
