const {storage} = require('../state/storage')


async function intro(from, sender, oga, sock) {
    const metadata = await sock.groupMetadata(from);
    const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

console.log("admins:", admins)

    console.log("introducing...")
    let reply
    switch (true) {
        case oga.includes(sender):
            reply =`All ye lowly peasants make way for it is the one and only😎 Masta of Scata, the Mover and Shaker🙌, Sultan of 
            Suya Ruler of Ribena👑, Odogwu of Otakus🥱, Magistrate of Meat pie😏, Leutenant of Legwork😌, Olympic Organizer of Ondo Oyo and also Ogun state😤, Azaman of A+🤘,
            Crusader of Cous-cous⚔,The Chosen champion of chicken lap chapman and chin chin, Big boss, Boss big, the satiation of the insatiables,the domination of the indomitables 
            the...the.. ehn i got it The Boasted breadwinner of Bayero University🔥 , His steezeness , his royal royalty highness All time Ogaa @${sender.split('@')[0]}🔥🔥🔥`
            break;
        case admins.includes(sender):
            reply =`An admin identifiable as @${sender.split('@')[0]}`   
            break;
        default:
            reply = `some random dude or dudés who likes anime going by @${sender.split('@')[0]}`
            break;
    }
    await sock.sendMessage(from, {
        text: reply,
        mentions:[sender]
    })
    console.log("introduced")
}

async function intro_me(from, sock){
    await sock.sendMessage(from, {
            text:`Yo everyone I am the greatly revered *OTAKU BOT 3000*🔥🔥🔥 
            but you can call me yobi🌚, im here to moderate all your bullshit 
            so you can behave like proper humans😊 Imagine even a bot knows y'all tripping . 
            anyway i plan to make myself very useful
            whether or not you will have me , thank you😁`
        }
    )
}
async function menu(from, sock) {
    await sock.sendMessage(from, {
        text: `⚔ *OTAKU BOT 3000* ⚔
        ~*BIO*~
        ⨳ *NICKNAME* : YOBI 🔥
        ⨳ *PREFIX* : !
        ~*ADMIN COMMANDS*~😎
        ⨳!kick
        ⨳!warn
        ⨳!lock
        ⨳!unlock
        ~*USER COMMANDS*~👤
        ⨳!rules
        ⨳!ntro
        ⨳!intro-me
        ⨳!menu
        ⨳!scores
        ~*CHECKS*~👀
        ⨳antilink check
        ⨳antispam check
        ~*GAMES*~🕹
        ⨳!game wordChain
        ⨳!game wordChainS
        ⨳!game trivia
        ⨳!game emoji
> P.S: i know nothing, dont ask me shi , for now atleast😊
        `
    })
}
async function scores(from, sock) {
    const emoji = storage.games.emoji.scores[from] || []
    const trivia = storage.games.trivia.scores[from] || []
    const chain = storage.games.chain.scores[from] || []
    const chaino = storage.games.chainOne.scores[from] || []
    let mentions = []
    let text = `🏆*SCORES*🏆\n\n`
    text += `*EMOJI GAME*:\n`
    if(emoji.length ===0){
        text += `No scores yet\n\n`
    }else{
        emoji.forEach((s,i) => {
            text += `${i+1}. Date: ${new Date(s.date).toLocaleDateString()} | Scores: \n`
            const entries = Object.entries(s.scores)
            entries.sort((a,b) => b[1]- a[1])
            entries.forEach(([user, score], index) => {
                text += `   ${index+1}. @${user.split("@")[0]} -- ${score}pts \n`;
                if(!mentions.includes(user)){
                    mentions.push(user)
                }
            })
        })
        text += `\n`
    }
    text += `*TRIVIA GAME*:\n`
        if(trivia.length ===0){
            text += `No scores yet\n\n`
        }else{
            trivia.forEach((s,i) => {
                text += `${i+1}. Date: ${new Date(s.date).toLocaleDateString()} | Scores: \n`
                const entries = Object.entries(s.scores)
                entries.sort((a,b) => b[1]- a[1])
                entries.forEach(([user, score], index) => {
                    text += `   ${index+1}. @${user.split("@")[0]} -- ${score}pts \n`;
                   if(!mentions.includes(user)){
                    mentions.push(user)
                }
                })
            })
        text += `\n`
    }
    text += `*WORD CHAIN GAME*:\n`
            if(chain.length ===0){
                text += `No scores yet\n\n`
            }else{
                chain.forEach((s,i) => {
                    text += `${i+1}. Date: ${new Date(s.date).toLocaleDateString()} | Scores: \n`
                    const entries = Object.entries(s.scores)
                    entries.sort((a,b) => b[1]- a[1])
                    entries.forEach(([user, score], index) => {
                        text += `   ${index+1}. @${user.split("@")[0]} -- ${score}pts \n`;
                    if(!mentions.includes(user)){
                    mentions.push(user)
                    }
                    })
                })
            text += `\n`
    }
    text += `*WORD CHAIN GAME (SINGLE PLAYER)*:\n`
            if(chaino.length === 0){
                text += `No scores yet\n\n`
            }else{
                chaino.forEach((s,i) => {
                    text += `${i+1}. Date: ${new Date(s.date).toLocaleDateString()} | Scores: \n`
                    const entries = Object.entries(s.scores)
                    entries.sort((a,b) => b[1]- a[1])
                    entries.forEach(([user, score], index) => {
                        text += `   ${index+1}. @${user.split("@")[0]} -- ${score}pts \n`;
                    if(!mentions.includes(user)){
                    mentions.push(user)
                    }
                    })
                })
            text += `\n`
    }
    console.log("mentions:", mentions)
    sock.sendMessage(from, {
        text,
        mentions
    })
}
module.exports = {intro, intro_me, menu, scores}