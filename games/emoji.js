const {storage, saveStr} = require('../state/storage')
const questions = storage.games.emoji.questions
    function normalize(ans){
        console.log("normalizing", ans)
        return ans.toLowerCase()
                .trim() 
                .replace(/[^\w\s]/g,"")
    }

    async function nextQue(sock, from, sender, text){
        const session = storage.games.active[from]
        console.log("nextQue session:", session)
        if(!session)return
        if(session.questionsIndex >= 5 || session.availableQues.length === 0 ){
            console.log("ending emoji")
           await  endemoji(sock, from)
            return
        }
        const rem = session.availableQues.filter(q => ! session.usedThisSession.includes(q.id))
        const que = rem[Math.floor(Math.random()*rem.length)]
        session.currentQuestion = que
        session.usedThisSession.push(que.id)
        session.answered = false
        console.log("sending next que")
        await sock.sendMessage(from, {
            text:`❔${que.question} 
            20s`
        })
        session.timer = setTimeout(async ()=>{
         if(session.answered) return       
            await sock.sendMessage(from,{
                text:`⏱Time's up, correct answer is ${que.ans[0]}.`
            })
            session.questionsIndex += 1
            await nextQue(sock, from, sender, text)
        }, 20_000)
    }
async function emoji(sock, from, sender, text, isContinuation = false){
     if(!text && isContinuation) return
    //init str if missing
    if(!storage.games.active) storage.games.active = {};
    const used = storage.games.emoji.usedLastSession[from] || []
    const availableQues = questions.filter(q => !used.includes(q.id))
    console.log("availableQues:", availableQues)
    if(!isContinuation){
        storage.games.active[from] = {
        type: "emoji",
        questionsIndex :0,
        usedThisSession:[],
        currentQuestion:null,
        score:{},
        timeLimit:20,
        timer:null,
        availableQues,
        answered:false
    }
    console.log(storage.games.active[from])
    console.log("starting emoji")
        await sock.sendMessage(from,{
            text:`Okayy😁 time for emoji guess👏
        Reply with the correct answer to the question given
        Y'all have 20s for each question⏱
        The first to get the correct answer scores 
        (be careful with spellings tho)
        Let's gooo`
        })
        await nextQue(sock, from, sender, text)
        return
    }
    if(isContinuation){
         const session = storage.games.active[from]
         if(!session) return
         if(!sender || !session.currentQuestion) return
        if(session.answered) return
        const userAns = normalize(text)

        const correct = session.currentQuestion.ans.some(a => normalize(a) === userAns)
        console.log("userAns:", userAns, "correct:", correct)
        if(correct){
            session.answered = true
            clearTimeout(session.timer)
            console.log(sender, "got it correct")
            session.score[sender] = (session.score[sender] || 0) + 1;
            sock.sendMessage(from, {
                text:`🎉Scoore!! @${sender.split("@")[0]} got it🎯`,
                mentions:[sender]
            })
            setTimeout(async () =>{
                session.questionsIndex += 1
                await nextQue(sock, from, sender, text)
            }, 2000)
        }
    }
}

async function endemoji(sock, from) {
    const session = storage.games.active[from]
    console.log("ending", session)
    if(!session)return
    await sock.sendMessage(from, {
        text:`📝Aight, Game Over Peeps, was a good round🤝!`
    })
    const scoreMsg = formatScore(session.score)
    await sock.sendMessage(from, {
            text:scoreMsg.text,
            mentions: scoreMsg.mentions
    })
    storage.games.emoji.usedLastSession[from] = session.usedThisSession
    clearTimeout(session.timer)
    storage.games.emoji.scores[from] = storage.games.emoji.scores[from] || []
    storage.games.emoji.scores[from].push({date: Date.now(),scores:session.score})
    delete storage.games.active[from]
    saveStr(storage)
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
module.exports = emoji