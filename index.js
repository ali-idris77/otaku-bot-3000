const {makeWASocket, useMultiFileAuthState} = require('@whiskeysockets/baileys')
const qrcode = require('qrcode-terminal')
const {messageHandler} = require('./handlers/messageHandler')
const botStart = Date.now() 
async function startBot() {
    console.log("starting....")
    const {state, saveCreds} = await useMultiFileAuthState('./auth_info')
    const sock = makeWASocket({
        auth: state
    });
    sock.ev.on("creds.update", saveCreds);
    
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect , qr} = update;
        if(qr){
            qrcode.generate(qr, {small: true})
            console.log("scan the qr code above to log in")
        }
        if(connection === "open"){
            console.log("connected")
        }else if(connection === "close"){
            const shouldRec = lastDisconnect?.error?.output?.statusCode !== 401
            console.log("disconnected", lastDisconnect?.error)
            if(shouldRec){
                startBot()
            }
        }
    })
    //message handler
    sock.ev.on("messages.upsert",
        ({messages})=>{
            if(!messages || messages.length ===0) return
             console.log(botStart, messages[0].messageTimestamp)
    if((messages[0].messageTimestamp || messages[0].messageTimestamp.seconds) * 1000 < botStart){
        console.log("old message, ignoring...")
        return}
            messageHandler(sock, messages[0])
        }
    )

    sock.ev.on("group-participants.update",async (update)=>{
        const {id, participants, action} = update
        console.log(update);
        
        if(action === "add"){
                sock.sendMessage(id, {
                    text:`Welcome to the group @${participants[0].id.split('@')[0]}! 
                    please introduce yourself.
                    name
                    age
                    department
                    top 5 animes`,
                    mentions: [participants[0].id]
                })
            }
            if(action === "remove"){
                sock.sendMessage(id, {
                    text:`Goodbye @${participants[0].id.split('@')[0]}! .`,
                    mentions: [participants[0].id]
                })
            }
})
}
startBot()