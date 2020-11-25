


let EventEmitter;
try {
    EventEmitter = require("eventemitter3");
} catch(err) {
    EventEmitter = require("events");
}

class index extends EventEmitter {

constructor(col , ready){
super();
this._collection = col
this._ready = ready
this.cache = []
this._setupcache()
this.watch = this._collection.watch()
}


async _setupcache(){
let data = await this._getdata()
this.cache = data
this.emit("ready" , this._collection)
this.watch.on("change",async (data) =>{
if(data.operationType === "insert"){
let filter = this.cache.filter(d => d._id === data.fullDocument._id)
if(filter.length < 1) return this.cache.unshift(data.fullDocument) 
}else
if(data.operationType === "delete"){
this.cache = this.cache.filter(d => d._id !== data.documentKey._id)
}else
if(data.operationType === "replace"){

let index = this.cache.findIndex(d => d._id == data.documentKey._id)
this.cache[index] = data.fullDocument
}
})

setInterval(async () => { 
let data = await this._getdata()
this.cache = data
 }, 500);
return true
}

async _getdata(){
return new Promise(async (resolve, reject) => {
  await this._collection.find({}).toArray(async (err, result) => {
if(!err){ resolve(result) } else { resolve(null) }
})
})
}

  
  
  async delete(query) {
if(typeof query !== "object") throw new Error("the query must be object")
return new Promise(async (resolve, reject) => {
let err = null
  await this._collection.deleteOne(query).catch(erro => err = erro.message).then(async res =>{

    if (err) throw new Error(err.message)
this._getdata().then(d =>this.cache = d)
    return resolve(res)
})
 
})
}


async insert(obj) {
if(typeof obj !== "object") return new Error("the query must be object")
this.cache.unshift(obj)
return new Promise(async (resolve, reject) => {
this._collection.insertOne(obj, async(err, res) => {
    if (err) throw new Error(err.message);
    
for( var i = 0; i < this.cache.length; i++){ 
        if ( this.cache[i] === obj) { 
            this.cache.splice(i, 1)
            this.cache.unshift(res.ops[0])
        }
    }
    return resolve(res)
  });
})
}

async update(query , obj){
if(typeof obj !== "object" || typeof query !== "object") return new Error("the query must be object")
return new Promise(async (resolve, reject) => {
  await this._collection.updateOne(query, {$set : obj} , async (err, res) => {
    if (err) throw new Error(err.message)
this._getdata().then(d =>this.cache = d)
    return resolve(res)
  });
})
}

async find(query){
if(typeof query !== "object") return new Error("the query must be object")

let cache = this.cache
let keys = Object.keys(query)
for(var data of keys){
cache = cache.filter(d => d[data] == query[data])
}
return cache
}

async get(query){
if(typeof query !== "object") return new Error("the query must be object")

let cache = this.cache
let keys = Object.keys(query)
for(var data of keys){
cache = cache.filter(d => d[data] == query[data])
}

return cache[0] || null
}


}

module.exports = index
