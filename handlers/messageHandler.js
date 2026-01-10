const {antiLink} = require('../functions/antiLink')
const {antiSpam} = require('../functions/antiSpam')
const {adminKick} = require('../functions/adminKick')
const {intro, intro_me, menu, scores} = require('../functions/intro')
const {triviaUpd} = require('../functions/storageUpd')
const {greet, handleQues} = require('../functions/communicate')
const {adminLock, adminUnlock} = require('../functions/adminLock')
const {gameHandler} = require('../games/gameHandler')


async function messageHandler(sock, msg) {
    console.log("handling messages...", msg)
    if(!msg.message) return
    const from = msg.key.remoteJid;
    const sender = msg.key.participant;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ""
    const OGA = ['135846141403355@lid']
    console.log(`Message from ${sender} in ${from}: ${text}`)
    
    const info = {from, sender, text}
    if(!from.endsWith('@g.us')) return
    //auto warn functions function
        console.log('monitoring....')
       await antiLink(sock, from , sender, text, OGA)
       await antiSpam(sock, from, sender, OGA)
    //admin commands
    if(text.startsWith("!kick")){
        await adminKick(from, sender, OGA, msg, sock)
    }
    if(text.startsWith("!lock")){
        await adminLock(from, sender, OGA, sock)
    }
    if(text.startsWith("!unlock")){
        await adminUnlock(from, sender, OGA, sock)
    }
    await triviaUpd(sock, from, sender, text, OGA)
    //general commands
    if(text.startsWith("!rules")){
        console.log("sending rules...")
         await sock.sendMessage(from, {
            text:`⚔*HEAR HEE HEAR HEE THE RULES OF THIS ESTABLISHMENT*⚔
            1. Links art fobidden heather in this establishment🔗
            2. Thou shall not spam thine valueless words😑
            3. Thou shall not act homo and get away with it🌈
            4. Thou shall not spoil the anime lest thou is gay 
             And most importantly His Majesty the ever great ever awesome akira hero's word are absolute👑
            and thou must obey or die💀
            Have a good time🥱`
        })
    }
    if(text.startsWith("!intro-me")){
        await intro(from,sender,OGA,sock)
    }
    if(text.startsWith("!intro")){
        await intro_me(from,sock)
    }
    if(text.startsWith("!menu")){
        await menu(from,sock)
    }
    if(text.startsWith("!scores")){
        await scores(from,sock)
    }
    if(text.includes("Yobi") || text.includes("yobi")){
        await greet(sock, from, sender, text, OGA)
        await handleQues(from, sender, text, OGA, sock)
    }
    //games logic
    gameHandler(sock,from,sender,text)
}

module.exports = {messageHandler}