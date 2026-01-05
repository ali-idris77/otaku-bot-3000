const {storage, saveStr} = require('../state/storage')

async function triviaUpd(sock,from, sender, text, oga) {
    const metadata = await sock.groupMetadata(from);
    const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

console.log("admins:", admins)
   if(!oga.includes(sender) && !admins.includes(sender)) return
   if(text.startsWith("!addtrivia")){
    const parts = text.replace("!addtrivia", "")
    .split("|")
    if(!parts.length)return
    const question = parts[0] 
    const ans = parts[1].split(",").map( a => a.trim())
    if(question && ans.length){
        console.log(question, ans)
        storage.games.trivia.questions.push({id:Date.now(), question, ans})
        saveStr(storage)
        sock.sendMessage(from, {
            text:"question added👍"
        })
    }
   }
}

async function repUpd(sock,from, sender, text, oga) {
    const metadata = await sock.groupMetadata(from);
    const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

console.log("admins:", admins)
   if(!oga.includes(sender) && !admins.includes(sender)) return
}
module.exports = {triviaUpd}