const fs = require('fs')
const path = require('path')

const FILE_PATH = path.join(__dirname, "storage.json")
console.log("file path:", FILE_PATH)

//load storage
 function loadStr(){
    try{
        console.log("loading storage...")
        const data = fs.readFileSync(FILE_PATH, "utf-8")
        console.log("storage loaded")
        return JSON.parse(data)
    }catch(err){
        console.log("empty storage loaded", err)
        return {}
    }
    
 }

 function saveStr(data){
    console.log("saving storage...")
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2))
    console.log("storage saved")
 }

 const storage = loadStr()

 module.exports = {storage, saveStr}