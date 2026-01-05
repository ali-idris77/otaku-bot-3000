const {WARN_LIMIT} = require('../state/warnings')
const {storage, saveStr} = require('../state/storage')

const timeWindow = 5_000
const spamLimit = 5
const spamMap = new Map()
    
async function antiSpam(sock, from, sender, oga) {
    const metadata = await sock.groupMetadata(from);
    const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)
    if(!oga.includes(sender) && !admins.includes(sender)) return
    const key = `${from}:${sender}`;
    const now = Date.now();
    let data = spamMap.get(key)
    console.log(`AntiSpam data for ${key}:`, data);
    if(!data){
        spamMap.set(key, {count:1, lastTime: now })
        return
    }
    console.log(`AntiSpam data for ${key} before update:`, data);
    if(now - data.lastTime > timeWindow){
        data.count = 1
        data.lastTime = now
        spamMap.set(key, data)
        return
    }
    data.count++;
    if(data.count > spamLimit){
        storage.warnings = storage.warnings || {}
       const count = (storage.warnings[key] || 0) + 1;
       storage.warnings[key] = count;
       saveStr(storage)
        console.log(`User ${sender} in group ${from} is spamming. Warning count: ${count}`);
        if(count <= WARN_LIMIT){
            await sock.sendMessage(from, {
            text: `⚠ Niggaaww @${sender.split('@')[0]} stop spamming You deranged oaf😑.
            \nYou got ${WARN_LIMIT - count} of ${WARN_LIMIT} warnings left before i kick your ass, bitch😒`,
            mentions: [sender]
        });
        console.log("spam warning")
    }
        if(count > WARN_LIMIT){
            await sock.sendMessage(from, {
            text: `@${sender.split('@')[0]} i warned you but you decided that i was just
            yapping.
            \nwell then kiss this group bye bye bitch😒`,
            mentions: [sender]
            })
            await sock.groupParticipantsUpdate(from, [sender], "remove");
            delete storage.warnings[key]
            saveStr(storage)
            console.log(`Spam warning count reset for removal of ${sender} in ${from}`)
            return
        }
    }
    spamMap.set(key, data)
}

module.exports = {antiSpam}