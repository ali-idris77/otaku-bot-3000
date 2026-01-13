const {storage, saveStr} = require('../state/storage')
const wordChain = require('./chain')
const trivia = require('./trivia')
const emoji = require('./emoji')
const wordChainS = require('./chainone')
const games = {
    trivia,
    wordChain,
    emoji,
    wordChainS
}
const CMD = "!"
async function gameHandler(sock, from, sender, text) {
    storage.games.active = storage.games.active || {}
    const activeGame = storage.games.active?.[from];
    if(text.startsWith(CMD)){
        console.log("game command")
        const [command, gameName] = text.slice(1).trim().split(/\s+/)
        
        if(command.toLowerCase() ==="game"){
            console.log(`game name: ${gameName}`)
        if(!gameName) return
        console.log(`initializing ${gameName}`)

        const game = games[gameName]
        if(!game){ 
            console.log("game not found")
           await sock.sendMessage(from, {
                text:"What game is this, is it good?🙂"
            })
            return
        }
        if(activeGame){
            console.log("game already in progress")
            await sock.sendMessage(from, {
                text:"Calm down fool🙄,can't you see a game is already in progress?!😒"
            })
            return
        }
        await game(sock, from, sender, text)
        console.log("starting game")
        return
        }else if(command.toLowerCase() === "endgame"){
            if(activeGame){
            console.log("ending game")
            delete storage.games.active?.[from]
            saveStr(storage)
            await sock.sendMessage(from, {
                text:"Ending game....😶"
            })  
            }else{
                console.log("no active game")
                await sock.sendMessage(from, {
                text:"Not playing any game tho....😕"
            })
            }
            return
        }else if(command.toLowerCase() !== "game" && command.toLowerCase() !== "endgame"){
            console.log("not a game command")
            return
        }
    }

    if(activeGame){
    console.log("continuing active game")
    const gamehndlr = games[activeGame.type];
    if(!gamehndlr)return
        gamehndlr(sock, from, sender, text, true)
}}
module.exports = {gameHandler}