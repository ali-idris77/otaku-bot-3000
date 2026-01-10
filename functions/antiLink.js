const {WARN_LIMIT} = require('../state/warnings')
const {storage, saveStr} = require('../state/storage')
async function antiLink(sock, from , sender, text, oga){
    const metadata = await sock.groupMetadata(from);
    const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)
    if(text.includes('http://') || text.includes('https://')){
    if(!oga.includes(sender) && !admins.includes(sender)) return
    const key = `${from}:${sender}`
    storage.warnings = storage.warnings || {}
    const count = (storage.warnings[key] || 0) + 1;
    storage.warnings[key] = count;
    saveStr(storage)
        console.log(`Warning count for links ${sender} in ${from}: ${count}`)
        if(count <= WARN_LIMIT){
            await sock.sendMessage(from, {
            text: `⚠ Niggaaww @${sender.split('@')[0]} links are not allowed here DUMBASS😑.
            This is ${count} of ${WARN_LIMIT} before i kick your ass, bitch😒`,
            mentions: [sender]
        });
        console.log("link warning")
    }
        if(count > WARN_LIMIT){
            await sock.sendMessage(from, {
            text: `@${sender.split('@')[0]} i warned you but you decided that i was just
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
}

module.exports = {antiLink}