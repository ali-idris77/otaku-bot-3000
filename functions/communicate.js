const {storage} = require('../state/storage')
const {homo, hobo} = require('../state/adminCache')
const arr = storage.greet
const rep = storage.replies


async function greet(sock, from, sender,text, oga) {
    const metadata = await sock.groupMetadata(from);
    const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

console.log("admins:", admins)
    if(!text)return
    if(text.startsWith("!"))return
    console.log("trying to greet")
    const lower = text.toLowerCase().trim()
    const iBot = [
        "Yo yobi", "Yobi", "Hey yobi"
    ]
    const qWords = ["who", "what", "when", "why", "how", "is","are", "can", "could", "should", "will",
                    "do", "does", "did"
    ]
    const isBot = iBot.some(w => {
        console.log("greet check")
        const wrd = w.toLowerCase().trim()
        return lower.includes(wrd)
    })
    const isQuestion = lower.endsWith("?") || qWords.some(w => lower.includes(w + ""))
    console.log(arr)
    if(!isQuestion){
        console.log("not a question, greeting")
    let replies;

    switch (true) {
    case oga.includes(sender):
            replies = arr.oga?.[Math.floor(Math.random()*arr.oga.length)]
            break;
    case homo.includes(sender):
            replies = arr.homo?.[Math.floor(Math.random()*arr.homo.length)]
            break;
    case admins.includes(sender) && !hobo.includes(sender):
            replies = arr.admin?.[Math.floor(Math.random()*arr.admin.length)]
            break;
    case hobo.includes(sender):
            replies = arr.meh?.[Math.floor(Math.random()*arr.meh.length)]
            break;
    default:
            replies = arr.regular?.[Math.floor(Math.random()*arr.regular.length)]
            break;
    }
    if(replies){
        await sock.sendMessage(from, {text: replies})
        return
    }
}
}

const cooldown = new Map
async function handleQues(from, sender, text, oga, sock) {
    const metadata = await sock.groupMetadata(from);
    const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

console.log("admins:", admins)
    if(!text)return
    if(text.startsWith("!"))return
    console.log("handling question...")
    const lower = text.toLowerCase().trim()
    const iBot = [
        "Yo yobi", "Yobi", "Hey yobi"
    ]
    const qWords = ["who", "what", "when", "why", "how", "is","are", "can", "could", "should", "will",
                    "do", "does", "did"
    ]
    const isBot = iBot.some(w => {
        const wrd = w.toLowerCase().trim()
        return lower.includes(wrd)
    })
    const isQuestion = lower.endsWith("?") || qWords.some(w => lower.includes(w + ""))

    if(!isBot)return
    if(!isQuestion)return
    console.log("question confirmed...")
    const last = cooldown.get(from) || 0
    if (Date.now() - last < 15_000)return

    cooldown.set(from, Date.now())
    console.log("answering question...")
    let replies
    switch (true) {
        case oga.includes(sender):
           replies = rep.oga?.[Math.floor(Math.random()*rep.oga.length)]
            break;
        case homo.includes(sender) || hobo.includes(sender):
           replies = rep.meh?.[Math.floor(Math.random()*rep.meh.length)]
            break;
        default:
           replies = rep.regular?.[Math.floor(Math.random()*rep.regular.length)] 
            break;
    }
    if(replies){
        await sock.sendMessage(from, {text: replies})
    }
    console.log("question handled.")
    return
}
module.exports = {greet, handleQues}