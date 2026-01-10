const {WARN_LIMIT} = require('../state/warnings')
const {storage, saveStr} = require('../state/storage')
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
async function adminWarn(from, sender, oga, msg, sock){
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
      const key = `${from}:${sender}`
    storage.warnings = storage.warnings || {}
    const count = (storage.warnings[key] || 0) + 1;
    storage.warnings[key] = count;
    saveStr(storage)
        console.log(`Warning count for links ${sender} in ${from}: ${count}`)
        if(count <= WARN_LIMIT){
            await sock.sendMessage(from, {
            text:`@${mentioned[0].split("@")[0]}, you have been warned by the admin. you got ${count} of ${WARN_LIMIT} warnings before u get kicked😑.`,
      mentions: mentioned
        });
        console.log("warning")
    }
        if(count > WARN_LIMIT){
            await sock.sendMessage(from, {
            text: `@${sender.split('@')[0]} admin warned you but you decided that dey was just
            yapping.
            well then kiss this group bye bye bitch😒`,
            mentions: [sender]
            })
            await sock.groupParticipantsUpdate(from, [sender], "remove");
            delete storage.warnings[key]
            saveStr(storage)
            console.log(`Link warning count reset for removal of ${sender} in ${from}`)
        }
   }
   console.log("kick command processed.")
}
module.exports = {adminKick, adminWarn}