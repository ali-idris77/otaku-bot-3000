const {storage, saveStr} = require('../state/storage')
function getRandom(exclude=[]){
 const starterWrds = storage.games.chain.starter
 const words = starterWrds.filter(w => !exclude.includes(w))
    return words[Math.floor(Math.random()*words.length)]
}

async function wordChain(sock, from, sender, text, isContinuation = false) {
    if(!text && isContinuation) return

    //init str if missing
    if(!storage.games.active) storage.games.active = {};

    //start game
    if(!isContinuation){
        const firstWord = getRandom()
        storage.games.active[from] = {
            type: 'wordChain',
            lastWord: firstWord,
            usedWords:[firstWord],
            score:0,
            level:1,
            timeLimit: 25,
            timer: null,
            currentPlayer: sender
        }
        console.log(storage.games.active[from])
        saveStr(storage)
        await sock.sendMessage(from,{
            text:`Aiiit @${sender.split('@')[0]}😁 anime word chain starting now👏
        \nReply with an anime character name or attack🤜 with a first letter thats
         the same as the last letter of the previous word👈
        \nYou have 15s for this level (+5s to prepare for 1st round)⏱
        \nThe first word is *${firstWord}*
        \nLet's gooo`,
        mentions:[sender]
        })
        storage.games.active[from].timer = setTimeout(async ()=>{
            await sock.sendMessage(from,{
                text:`⏱Time's up, Game over better luck next time. 
                \n score: 0 | Level: 1`
            })
            storage.games.chain.scores[from] = storage.games.chain.scores[from] || []
            storage.games.chain.scores[from].push({
            date: Date.now(),
            scores:{
            [storage.games.active[from].currentPlayer]: storage.games.active[from].score
        }})
            delete storage.games.active[from]
            saveStr(storage)
        }, 25_000)
        return
    }

//continuation

const game = storage.games.active[from]
  if(!game) return
if(sender !== game.currentPlayer) return

  if(game.timer) clearTimeout(game.timer)
    const word = text.trim().toLowerCase()

  if(game.usedWords.includes(word)){
    await sock.sendMessage(from, {
        text:`${word} has already been used can-t use it again smart ass🤣.
        \nGame over score: ${game.score} | Level: ${game.level}`,
        mentions: [sender]
    })
        storage.games.chain.scores[from] = storage.games.chain.scores[from] || []
        storage.games.chain.scores[from].push({
        date: Date.now(),    
        scores:{
            [storage.games.active[from].currentPlayer]: storage.games.active[from].score
        }})
    delete storage.games.active[from]
    saveStr(storage)
    return
  }

  if(game.lastWord && word[0] !== game.lastWord.slice(-1)){
    await sock.sendMessage(from, {
        text:`Your answer ${word}'s first letter doesn't match the first letter of ${game.lastWord}
    \nGame over score: ${game.score} | Level: ${game.level}`,
            mentions: [sender]
        })
        storage.games.chain.scores[from] = storage.games.chain.scores[from] || []
        storage.games.chain.scores[from].push({
        date: Date.now(),    
        scores:{
            [storage.games.active[from].currentPlayer]: storage.games.active[from].score
        }})
    delete storage.games.active[from]
    saveStr(storage)
    return
}
game.usedWords.push(word)
game.lastWord = word
game.score += 1

if(game.score % 10 === 0){
    game.level += 1
    game.timeLimit = Math.max(5, game.timeLimit - 5)
    await sock.sendMessage(from,{
        text:`Level up! Level ${game.level} reached. 
        \n time per word is now ${game.timeLimit}`
    })
}
saveStr(storage)
    await sock.sendMessage(from,{
        text:`Accepted. 
        \n next ${word.slice(-1)}
        \n time : ${game.timeLimit}s`
    })

    game.timer = setTimeout(async ()=>{
            await sock.sendMessage(from,{
                text:`⏱Time's up, Game over nice try. 
                \n score: ${game.score} | Level: ${game.level}`
            })
            storage.games.chain.scores[from] = storage.games.chain.scores[from] || []
            storage.games.chain.scores[from].push({
            date: Date.now(),
            scores:{
            [storage.games.active[from].currentPlayer]: storage.games.active[from].score
            }})
            delete storage.games.active[from]
            saveStr(storage)
        }, game.timeLimit*1000)
}
module.exports = wordChain