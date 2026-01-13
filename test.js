const {randomUUID} = require('crypto')
const {storage, saveStr} = require('./state/storage')
// async function formatQ() {
//     try{
//         console.log("fetchin....")
//     const res = await fetch('https://opentdb.com/api.php?amount=40&category=31&type=multiple')
//     if(res.ok){
//         console.log("fetched trivia")
//         const data = await res.json()
//         console.log("data:", data)
//         const ques = normalize(data)
//         ques.forEach(q => {
//             console.log('pushing', q)
//             storage.games.trivia.questions.push(q)
//         }
//         )
//         saveStr(storage)
//     }else{
//         console.log("problem")
//     }
//     }catch(err){
//         console.log(err)
//     }  
// }
// function normalize(ques){
//     const que = ques.results
//     return que.map(q =>{
//         const question = q.question
//         const answ = q.correct_answer
//         .toLowerCase()
//         .trim()
//         const ansWords = answ.split(/\s+/)
//         return{
//             id: randomUUID(),
//             question,
//             ans: [answ, ...ansWords]
//         }
//     })
// }
// formatQ()
console.log(storage.games.trivia.questions.length)