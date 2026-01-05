async function adminLock(from, sender, oga, sock){
   const metadata = await sock.groupMetadata(from);
    const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

console.log("admins:", admins)
   if(!oga.includes(sender) && !admins.includes(sender)) {
      await sock.sendMessage(from, {
         text:`Yo peter, you're not an admin SO SHUT IT🙄`
      })
       return
      }
      console.log("locking group...")
   await sock.groupSettingUpdate(from, "announcement")
   await sock.sendMessage(from,{
    text:`Aight group locked, now shut your asses \nI mean it's not like you can say anything🤣🤣`
   })
   console.log("group locked")
   }
async function adminUnlock(from, sender, oga, sock){
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
      console.log("unlocking group...")
   await sock.groupSettingUpdate(from, "not_announcement")
   await sock.sendMessage(from,{
    text:`All ye low lives can now continue to run your mouth holes like the peasants you are, \nyou're welcome🥱🥱`
   })
   console.log("group unlocked")
   }
module.exports = {adminLock, adminUnlock}