const {storage, saveStr} = require('../state/storage')
function getRandom(exclude=[]){
 const starterWrds = storage.games.chain.starter
 const words = starterWrds.filter(w => !exclude.includes(w))
    return words[Math.floor(Math.random()*words.length)]
}

async function wordChain(sock, from, sender, text, isContinuation = false) {
    if(!text)return
    //init str if missing
    if(!storage.games.active) storage.games.active = {};
    let game = storage.games.active[from]
    if(game && game.gtype === 'play'){
        console.log("playing...")
        const currentPlayer = game.players[game.currentPlayerIndex]

 if(sender !== currentPlayer) {
    console.log("not this player's turn", currentPlayer)
    return
}
console.log(game.timer)
  if(game.timer){
    console.log("clearing time")
    clearTimeout(game.timer)
    }
    const word = text.trim().toLowerCase()

  if(game.usedWords.includes(word)){
        return await eliminatePlayer(sock, from, sender, `${word} has already been used can-t use it again smart ass🤣`) 
  }

  if(game.lastWord && word[0] !== game.lastWord.slice(-1)){
        return await eliminatePlayer(sock, from, sender, `💔Your answer ${word}'s first letter doesn't match the first letter of ${game.lastWord}`) 
}
game.usedWords.push(word)
game.lastWord = word
game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length
game.score[sender] = (game.score[sender] || 0) + 1
console.log("game", game)
if(game.usedWords.length % 10 === 0){
    console.log("level up", game.usedWords.length)
    game.level += 1
    game.timeLimit = Math.max(5, game.timeLimit - 5)
    await sock.sendMessage(from,{
        text:`💥Level up! Level ${game.level} reached. 
         time per word is now ${game.timeLimit}`
    })
}
saveStr(storage)
    await sock.sendMessage(from,{
        text:`✅ Accepted. 
        🕹@${game.players[game.currentPlayerIndex].split('@')[0]} its your turn
         next ${word.slice(-1)} 
         time : ${game.timeLimit}s`,
         mentions:[game.players[game.currentPlayerIndex]]
    })
    startTurn(sock, from)
    }
    if(game && game.gtype === 'join'){
         if(text.toLowerCase() !== "join") return

     if(!game.players.includes(sender)){
                    game.players.push(sender)
                    await sock.sendMessage(from, {
                        text:`♟ @${sender.split("@")[0]} joined the fun.`,
                        mentions:[sender]
                    })
                }
                return
    }
    console.log("startin", game)
    //start game
    if(!isContinuation){
         storage.games.active[from]= {
                        type: "wordChain",
                        gtype: "join",
                        players : [],
                        joinTimer : null
                    }
            game = storage.games.active[from]       
            await sock.sendMessage(from, {
    text:`Ok my fellow dudes and dudés😁, its time for word chaaaaiin so if you're interested 
    just send in *join* to _ofcourse_ join the FUUUN👾
    joining wiill take 30s after that no one else can join let's gooo kono kusariyodomoooo😈😈`
            })
                
                game.joinTimer = setTimeout(async ()=>{
                   await startGame(sock, from)
                }, 30_000)
console.log("started", game)
        return 
    }

}
async function startGame(sock, from){
    const joinGame = storage.games.active[from]
    console.log("join timeout",joinGame)
        if(!joinGame || joinGame.players.length <= 0){
            await sock.sendMessage(from, {
                text:`No one wants to play so the game is cancelled, good bye🥺`
            })
            delete storage.games.active[from]
            return saveStr(storage)
        }
        const firstWord = getRandom()
        storage.games.active[from] = {
            type: 'wordChain',
            gtype: 'play',
            lastWord: firstWord,
            usedWords:[firstWord],
            score:{},
            level:1,
            timeLimit: 25,
            timer: null,
            currentPlayerIndex: 0,
            players : joinGame.players
        }
        saveStr(storage)
        const game = storage.games.active[from]
        console.log(game)
        await sock.sendMessage(from,{
            text:`Aiiit 😁 anime word chain starting now👏
        Reply with an anime character name or attack🤜 with a first letter thats
        the same as the last letter of the previous word👈
        The warriors ${game.players.map(p => '@'+p.split('@')[0]).join(', ')}
        You have 25s for this level ⏱
        The first word is *${firstWord}*
        Let's gooo`,
        mentions:game.players
        })
        startTurn(sock, from)        
                    }
function startTurn(sock, from){
const game = storage.games.active[from]
const player = game.players[game.currentPlayerIndex]
game.timer = setTimeout(async ()=>{
            await eliminatePlayer(sock, from, player, `times up ⏱`)
        }, game.timeLimit*1000)
}
async function eliminatePlayer(sock, from, sender, reason){
const game = storage.games.active[from]
if(!game)return
await sock.sendMessage(from, {
    text:`❌@${sender.split('@')[0]} you've been eliminated
    ${reason}`,
    mentions:[sender]
})
game.players = game.players.filter(p => p !== sender)
if(game.players.length === 1){
    await sock.sendMessage(from,{
        text:`🏆And we have a winner
        @${game.players[0].split('@')[0]} you have defeated all the other losers
        HOLD YOUR HEAD HIGH!!!✊✊`,
        mentions:[game.players[0]]
    })
    const scr = formatScore(game.score)
    await sock.sendMessage(from,{
        text: scr.text,
        mentions: scr.mentions
    })
    storage.games.chain.scores[from] = storage.games.chain.scores[from] || []
    storage.games.chain.scores[from].push({date: Date.now(),scores:game.score}) 
     delete storage.games.active[from]
saveStr(storage)
return 
}
game.currentPlayerIndex %= game.players.length
startTurn(sock, from)
}
function formatScore(score){
    let mentions = []
    let text = "📊Scores: \n"
    const entries = Object.entries(score)
    entries.sort((a,b) => b[1]- a[1])
    entries.forEach(([user, scores], index) => {
        text += `${index+1}. @${user.split("@")[0]} -- ${scores}pts \n`;
        mentions.push(user)
    })
        return {text, mentions}

}
module.exports = wordChain