   async function adminKick(from, sender, oga, msg, sock){
      const metadata = await sock.groupMetadata(from);
    const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

console.log("admins:", admins)
   if(!oga.includes(sender) && !admins.includes(sender)){
      await sock.sendMessage(from, {
         text:`Yo peter, you're not an admin SO SHUT IT🙄`
      })
       return
      }
   console.log("processing kick command...")
   const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid
   console.log(msg.message.extendedTextMessage?.contextInfo)
   console.log(`mentioned: ${mentioned}`)
   if(mentioned?.length){
    await sock.groupParticipantsUpdate(from, mentioned, "remove")
   }
   console.log("kick command processed.")
}
module.exports = {adminKick}