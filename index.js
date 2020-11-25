const { MongoClient } = require('mongodb');

const collection = require("./blocks/collection.js")
const db = require("./blocks/db.js")


let EventEmitter;
try {
    EventEmitter = require("eventemitter3");
} catch(err) {
    EventEmitter = require("events");
}

module.exports = class extends EventEmitter {

constructor(URL){

super();

this._ready = class {

constructor() {
this.value = false
}

async on() {
this.value = true
}

async off() {
this.value = false
}

}


this.ready = new this._ready()

this._dbs = {}

this.database = new MongoClient(URL , { useUnifiedTopology: true })


    this.database.connect().catch(err => { throw  new Error(err.message)}).then(ready =>{
this.ready.on()
this.emit("ready" , this.database)
})



}


async db(name){
if(!this.ready.value) throw new Error("the db is not ready!")
if(!name) throw  new Error("the db and the name of the collection must be inserted")
if(typeof name !== "string") return new Error("The Name must be string")
let db1 = this.database.db(name)
if(!db1) return null;
return new db(db1 , this.ready)
}

async collection(db , name) {
if(!this.ready.value) throw  new Error("the db is not ready!")
if(!name || !db) throw  new Error("the db and the name of the collection must be inserted")
if(typeof name !== "string" || typeof db !== "string") throw  new Error("The Name must be string")
}

}
