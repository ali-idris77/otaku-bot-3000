const {storage, saveStr} = require('../state/storage')
const questions = storage.games.trivia.questions
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
            console.log("ending trivia")
           await  endTrivia(sock, from)
            return
        }
        const rem = session.availableQues.filter(q => ! session.usedThisSession.includes(q.id))
        const que = rem[Math.floor(Math.random()*rem.length)]
        session.currentQuestion = que
        session.usedThisSession.push(que.id)
        session.answered = false
        console.log("sending next que")
        await sock.sendMessage(from, {
            text:`❔Next question:
            ${que.question} 
            20s`
        })
        session.timer = setTimeout(async ()=>{
            if(session.answered) return
            await sock.sendMessage(from,{
                text:`⏱Time's up, correct answer is ${que.ans[0]}. 
                `
            })
            session.questionsIndex += 1
            await nextQue(sock, from, sender, text)
        }, 20_000)
    }
async function trivia(sock, from, sender, text, isContinuation = false){
     if(!text && isContinuation) return
    //init str if missing
    if(!storage.games.active) storage.games.active = {};
    const used = storage.games.trivia.usedLastSession[from] || []
    const availableQues = questions.filter(q => !used.includes(q.id))
    console.log("availableQues:", availableQues)
    if(!isContinuation){
        storage.games.active[from] = {
        type: "trivia",
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
    console.log("starting trivia")
        await sock.sendMessage(from,{
            text:`Okayy😁 time for anime trivia👏
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

async function endTrivia(sock, from) {
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
    storage.games.trivia.usedLastSession[from] = session.usedThisSession
    clearTimeout(session.timer)
    console.log("saving trivia scores")
    storage.games.trivia.scores[from] = storage.games.trivia.scores[from] || []
    console.log("pushing trivia scores", {date: Date.now(),scores:session.score})
    storage.games.trivia.scores[from].push({date: Date.now(),scores:session.score})
    console.log("deleting active trivia game")
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
module.exports = trivia