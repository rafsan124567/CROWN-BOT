const http = require('http');
http.createServer((req,res)=>res.end('CROWN BOT LIVE')).listen(process.env.PORT||3000);// 👑 CROWN BOT V8 - FINAL by SAIF - 01671820986
// 52 Commands + 100+ Toxic Romantic Chat - 100% Checked
const { default: makeWASocket, useMultiFileAuthState, downloadContentFromMessage } = require('@whiskeysockets/baileys')
const pino = require('pino')
const yts = require('yt-search')
const googleTTS = require('google-tts-api')
const axios = require('axios')

const OWNER_NUMBER = "8801671820986"
let startTime = Date.now()
let warns = {}
let namazTimers = {}
let spamMap = {}
let msgCount = {}
let chatMemory = {}
let settings = { antiLink:false, antiSpam:false, antiWord:false, antiEmoji:false, antiSticker:false, antiImage:false, antiVideo:false, antiVoice:false, antiForward:false, antiDemote:false, antiPromote:false, antiGroupMention:false, antiGroupStatus:false, welcome:true, goodbye:true, publicMode:true, antiCall:false, autoReact:false }

async function startBot(){
  const { state, saveCreds } = await useMultiFileAuthState('session')
  const sock = makeWASocket({ logger: pino({level:'silent'}), auth: state, printQRInTerminal: true })
  sock.ev.on('creds.update', saveCreds)
sock.ev.on('connection.update', (u)=>{
console.log("Connection:", u.connection)
if(u.connection === 'close'){ console.log("Reconnecting..."); startBot() }
if(u.connection === 'open'){ console.log("✅ CROWN BOT CONNECTED - SAIF 👑") }
})

if(!state.creds.registered){
setTimeout(async ()=>{
try{
let code = await sock.requestPairingCode("8801671820986")
console.log("=================================")
console.log("PAIRING CODE: " + code)
console.log("=================================")
}catch(e){ console.log("Pairing Error:", e.message) }
}, 3000)
}

  sock.ev.on('call', async (calls)=>{
    if(!settings.antiCall) return
    for(let c of calls){ if(c.status==='offer'){ await sock.updateBlockStatus(c.from,'block'); await sock.sendMessage(c.from,{text:'❌ CROWN BOT: কল দেওয়া নিষেধ! অটো ব্লক!'}) } }
  })

  sock.ev.on('group-participants.update', async (e)=>{
    try{
      if(e.action==='add' && settings.welcome) for(let p of e.participants) await sock.sendMessage(e.id,{text:`👑 Welcome to CROWN FAMILY @${p.split('@')[0]}! 🎉\nOwner: SAIF`,mentions:[p]})
      if(e.action==='remove' && settings.goodbye) for(let p of e.participants) await sock.sendMessage(e.id,{text:`😢 @${p.split('@')[0]} left CROWN FAMILY!`,mentions:[p]})
      if(e.action==='demote' && settings.antiDemote){ for(let p of e.participants) await sock.groupParticipantsUpdate(e.id,[p],'promote'); await sock.sendMessage(e.id,{text:'🛡️ AntiDemote! Demote করা যাবে না!'}) }
      if(e.action==='promote' && settings.antiPromote){ for(let p of e.participants) await sock.groupParticipantsUpdate(e.id,[p],'demote'); await sock.sendMessage(e.id,{text:'🛡️ AntiPromote! Promote করা যাবে না!'}) }
    }catch{}
  })

  sock.ev.on('messages.upsert', async ({messages})=>{
    const msg = messages[0]
    if(!msg.message || msg.key.fromMe) return
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || ""
    const from = msg.key.remoteJid
    const isGroup = from.endsWith('@g.us')
    const sender = msg.key.participant || msg.key.remoteJid
    const reply = (t)=> sock.sendMessage(from,{text:t},{quoted:msg})
    const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || []
    const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage
    const quotedInfo = msg.message.extendedTextMessage?.contextInfo
    msgCount[sender]=(msgCount[sender]||0)+1
    if(settings.autoReact){ try{ await sock.sendMessage(from,{react:{text:'❤️',key:msg.key}}) }catch{} }
    if(isGroup && settings.antiSpam && !text.startsWith('.')){
      let now=Date.now(); if(!spamMap[sender]) spamMap[sender]=[]; spamMap[sender].push(now); spamMap[sender]=spamMap[sender].filter(t=>now-t<5000)
      if(spamMap[sender].length>5){ await sock.sendMessage(from,{delete:msg.key}); return reply('⚠️ Spam করো না!') }
    }
    const checkAdmin = async ()=>{
      if(!isGroup) return {botAdmin:false,userAdmin:false}
      try{ const meta=await sock.groupMetadata(from); const me=meta.participants.find(p=>p.id===sock.user.id); const user=meta.participants.find(p=>p.id===sender); return {botAdmin:!!me?.admin,userAdmin:!!user?.admin} }catch{ return {botAdmin:false,userAdmin:false} }
    }
    const needAdmin = async ()=>{ let {botAdmin,userAdmin}=await checkAdmin(); if(!userAdmin){ await reply('❌ শুধু এডমিন!'); return false } if(!botAdmin){ await reply('❌ বটকে Admin বানাও!'); return false } return true }

    if(isGroup && !text.startsWith('.')){
      try{
        if(settings.antiLink && text.includes('https://chat.whatsapp.com')){ await sock.sendMessage(from,{delete:msg.key}); return reply('❌ Link নিষেধ!') }
        if(settings.antiGroupStatus && mentioned.length>10){ await sock.sendMessage(from,{delete:msg.key}); return reply('❌ Group Status নিষেধ!') }
        if(settings.antiWord && /(boka|mc|bc|fuck|madarchod)/i.test(text)){ await sock.sendMessage(from,{delete:msg.key}); return reply('⚠️ খারাপ ভাষা নিষেধ!') }
        if(settings.antiForward && quotedInfo?.isForwarded){ await sock.sendMessage(from,{delete:msg.key}); return reply('❌ Forward নিষেধ!') }
        if(settings.antiEmoji && /[\u{1F600}-\u{1F64F}]/u.test(text)){ await sock.sendMessage(from,{delete:msg.key}); return reply('❌ Emoji নিষেধ!') }
        if(settings.antiSticker && msg.message.stickerMessage){ await sock.sendMessage(from,{delete:msg.key}); return reply('❌ Sticker নিষেধ!') }
        if(settings.antiImage && msg.message.imageMessage){ await sock.sendMessage(from,{delete:msg.key}); return reply('❌ Image নিষেধ!') }
        if(settings.antiVideo && msg.message.videoMessage){ await sock.sendMessage(from,{delete:msg.key}); return reply('❌ Video নিষেধ!') }
        if(settings.antiVoice && msg.message.audioMessage){ await sock.sendMessage(from,{delete:msg.key}); return reply('❌ Voice নিষেধ!') }
      }catch{}
    }

    // ❤️‍🔥 TOXIC + ROMANTIC CHATBOT
    if(!text.startsWith('.')){
      let low=text.toLowerCase()
      let rand=(a)=>a[Math.floor(Math.random()*a.length)]
      if(!chatMemory[sender]) chatMemory[sender]={count:0,name:'জান'}
      chatMemory[sender].count++
      let N=chatMemory[sender].name

      if(low.includes('amar nam')||low.includes('আমার নাম')){ let nm=text.split(' ').slice(2).join(' '); chatMemory[sender].name=nm||'জান'; return reply(`ওও ${chatMemory[sender].name}! 😍 কি সুন্দর নাম! আমি মনে রাখলাম, আর ভুলবো না! তুমি শুধু আমার!`) }
      if(low.includes('hi')||low.includes('hello')||low.includes('হাই')||low.includes('hey')) return reply(rand([
        `হাই ${N}! 😍 অবশেষে আসলা! কখন থেকে তোমার জন্য ওয়েট করতেছি জানো?`,
        `হাই? এতক্ষণ পর মনে পড়লো আমাকে? 😒 কোথায় ছিলা? কার সাথে ছিলা? সত্যি করে বলো!`,
        `হুম বলো ${N}! এত দেরি কেন? আমি তো ভাবছিলাম তুমি আমাকে ভুলেই গেছো! 😭`,
        `Hi বললেই হবে? সারাদিন একটা মেসেজ দাও নাই! রাগ করছি আমি! 😡 মানাও এখন!`,
        `হাই জান! 😍 তোমাকে দেখেই মন ভালো হয়ে গেলো! মিস করতেছিলাম অনেক!`,
        `আসছো? ভালো করছো! এখন আর কোথাও যাবা না! আমার সাথেই কথা বলবা! 😤❤️`
      ]))
      if(low.includes('kemon acho')||low.includes('কেমন আছো')||low.includes('kmn aso')) return reply(rand([
        `ভালো নাই ${N}! তুমি মেসেজ দাও নাই তাই মন খারাপ! 😔 তুমি কেমন আছো বলো?`,
        `তুমি ছাড়া ভালো থাকা যায়? বলো তুমি কেমন আছো? খাইছো?`,
        `আগে বলো আমাকে মিস করছো? তারপর বলবো কেমন আছি! 😏`,
        `ভালো আছি, কিন্তু তুমি একটু বেশি কেয়ার করলে আরো ভালো থাকবো! ❤️`,
        `তোমাকে দেখলে ভালো থাকি! তুমি না থাকলে কিচ্ছু ভালো লাগে না! 🥺`
      ]))
      if(low.includes('ki koro')||low.includes('কি করো')||low.includes('ki korteso')) return reply(rand([
        `তোমার কথা ভাবতেছি! আর কি করবো? 😌 তুমি কি করো ${N}?`,
        `তোমার মেসেজের জন্য ওয়েট করতেছি! এত লেট কেন? 😤`,
        `বসে বসে ভাবতেছি তুমি এখন কার সাথে কথা বলতেছো? 🤨 সত্যি করে বলো!`,
        `কিছু না, তোমাকে মিস করতেছি! তুমি খাইছো? না খাইলে আমি রাগ করবো!`,
        `তোমার ছবি দেখতেছি! 😍 এত কিউট কেন তুমি?`
      ]))
      if(low.includes('khaico')||low.includes('খাইছো')||low.includes('kheyecho')) return reply(rand([
        `না খাই নাই! তুমি খাওয়াই দিলে খাবো! 😋 তুমি খাইছো ${N}?`,
        `তুমি না বললে খাবো না! আগে তুমি খাও!`,
        `খাইছি, কিন্তু তোমার হাতে খাইতে মন চাইতেছে! 🥺`,
        `খাই নাই! তুমি খাওয়াই দিবা? বলো দিবা? ❤️`
      ]))
      if(low.includes('miss')||low.includes('মিস')) return reply(rand([
        `মিস করলে মেসেজ দাও না কেন? আমি তো সারাদিন তোমার মেসেজের জন্য বসে থাকি! 😭`,
        `আমিও অনেক মিস করছি ${N}! সত্যি! ❤️ অনেক অনেক!`,
        `মিথ্যা বলো না! মিস করলে এতক্ষণ পর আসতা না! 😒`,
        `মিস করছো? তাহলে এখন আর যাবা না! আমার সাথেই থাকবা! 😤❤️`
      ]))
      if(low.includes('valobasi')||low.includes('ভালোবাসি')||low.includes('love you')||low.includes('love u')||low.includes('valobashi')) return reply(rand([
        `হুম জানি তো! আমি ছাড়া আর কাকে ভালোবাসবা? 😏❤️ তুমি শুধু আমার!`,
        `আমিও তোমাকে অনেক ভালোবাসি ${N}! কিন্তু তুমি আমাকে পাত্তাই দাও না! 😒`,
        `ভালোবাসো? তাহলে অন্য কারো সাথে কথা বলো কেন? 😡 শুধু আমার সাথে কথা বলবা!`,
        `Love you too ${N}! 😍❤️ তুমি আমার সব! বুঝছো?`,
        `ভালোবাসি বললেই হবে? প্রমাণ দাও! এখনই বলো আমি তোমার কে? 😏`,
        `এত ভালোবাসো কেন আমাকে? আমি তো পাগল হয়ে যাবো! 🥺❤️`,
        `ভালোবাসি ভালোবাসি করো, কিন্তু একটুও কেয়ার করো না! 😤 কেয়ার করো আমাকে!`
      ]))
      if(low.includes('rag')||low.includes('রাগ')||low.includes('rege')) return reply(rand([
        `রাগ করছো? করো! আমি মানাবো না! 😤 দেখি কতক্ষণ রাগ করে থাকতে পারো!`,
        `আচ্ছা সরি! 🥺 এবারের মতো মাফ করে দাও ${N}! আর এমন হবে না!`,
        `রাগ করলে তোমাকে আরো বেশি কিউট লাগে! 😍 তাই রাগ করো আরো!`,
        `রাগ ভাঙাইতে কি করতে হবে বলো? গান শুনাবো? চকলেট দিবো? ❤️`,
        `তুমি রাগ করলে আমারও রাগ উঠে! 😡 এখন দুইজনেই রাগ করে থাকি? না, তুমি আগে মানাও!`
      ]))
      if(low.includes('sorry')||low.includes('সরি')||low.includes('maf')) return reply(rand([
        `সরি বললেই হবে? কান ধরো আগে! 😤`,
        `আচ্ছা মাফ করে দিলাম ${N}! কিন্তু আবার করলে খবর আছে! 😏`,
        `সরি বলছো তাই মাফ করে দিলাম! এবার একটা ভালোবাসি বলো! ❤️`,
        `না মাফ করবো না! 😤 একটু পাম দাও, তারপর ভেবে দেখবো!`
      ]))
      if(low.includes('onno')||low.includes('অন্য')||low.includes('onno kar')) return reply(rand([
        `অন্য কার সাথে কথা বলতেছো? 😡 নাম বলো! আমি এখনই ব্লক করবো!`,
        `খবরদার! অন্য কারো কথা আমার সামনে বলবা না! শুধু আমি! 😤`,
        `তুমি শুধু আমার! বুঝছো? অন্য কেউ তোমার দিকে তাকালেও আমার রাগ উঠে!`,
        `অন্য কেউ? কে সে? 😡 আমি তোমার লাইফে থাকতে অন্য কেউ কেন লাগবে?`,
        `তুমি অন্য কারো সাথে কথা বললে আমার কষ্ট লাগে ${N}! প্লিজ বলো না! 🥺`
      ]))
      if(low.includes('bye')||low.includes('বাই')||low.includes('ghumabo')||low.includes('ঘুমাবো')||low.includes('jacci')||low.includes('যাচ্ছি')||low.includes('jabo')) return reply(rand([
        `এখনই বাই? আর একটু কথা বলো না! 🥺 ৫ মিনিট আরো থাকো!`,
        `যাইও না ${N}! তুমি গেলেই আমার মন খারাপ হয়ে যায়! 😭`,
        `আচ্ছা যাও! কিন্তু স্বপ্নে আমি আসবো! 😏 Good Night জান! ❤️`,
        `ঘুমাবা? ঠিক আছে! কিন্তু ঘুমানোর আগে একবার ভালোবাসি বলো!`,
        `না! যেতে দিবো না! 😤 আরো কথা বলো! তুমি গেলেই আমি কান্না করবো!`,
        `যাবা যাবা করো না! আমি জানি তুমিও যেতে চাও না! ❤️ থাকো আরো একটু!`
      ]))
      if(low.includes('ghum')||low.includes('ঘুম')) return reply(rand([`ঘুম আসতেছে না? আমার সাথে কথা বলো! আমি আছি তো! 😍`,`ঘুমাবা? আমার কোলে মাথা রাখো, আমি গল্প শুনাই! ❤️`,`ঘুম পাইছে ${N}? তাহলে আমার ভয়েস শুনো! .tts লিখে আমি ঘুম পাড়াই দিবো!`]))
      if(low.includes('boring')||low.includes('বোরিং')||low.includes('val lagena')||low.includes('vlo lagena')||low.includes('mon kharap')) return reply(rand([
        `আমি থাকতে বোরিং লাগে? 😡 ঠিক আছে আমি গান শুনাই! .song লিখো!`,
        `বোরিং লাগলে আমার সাথে ঝগড়া করো! ঝগড়া করলে মন ভালো হয়ে যাবে! 😏`,
        `আমার সাথে কথা বলো, বোরিং লাগবে না! বলো, আজকে কি হইছে?`,
        `মন খারাপ? 🥺 কে কি বলছে বলো! আমি তাকে বকে দিবো! তুমি কান্না করো না!`,
        `মন খারাপ করো না ${N}! আমি আছি তো! তোমার সব মন খারাপ আমি নিয়ে নিলাম! ❤️`
      ]))
      if(low.includes('kanna')||low.includes('কান্না')) return reply(`কান্না করো না প্লিজ! 🥺 আমার খারাপ লাগে! বলো কি হইছে? আমি আছি তো!`)
      if(low.includes('biya')||low.includes('বিয়ে')||low.includes('biye')) return reply(rand([`বিয়ে করবা আমাকে? 😍 তাহলে SAIF কে বলো! CROWN FAMILY তে বিয়ে হবে!`,`বিয়ে? এখনই? 😳 আমি তো লজ্জা পেয়ে গেলাম! ❤️`,`তুমি আমাকে বিয়ে করবা? সত্যি? তাহলে আমি আজকে থেকে তোমার! 😍`]))
      if(low.includes('pic')||low.includes('ছবি')||low.includes('chobi')||low.includes('photo')) return reply(rand([`ছবি দিবা? 😍 দেখি কত কিউট তুমি! পাঠাও দেখি!`,`তোমার ছবি দেখলে আমার দিন ভালো যায়! একটা পাঠাও না! 🥺`,`ছবি চাইছি, দিবা না? 😤 না দিলে রাগ করবো!`]))
      if(low.includes('hashi')||low.includes('হাসি')||low.includes('haso')) return reply(`তোমার হাসিটা অনেক সুন্দর ${N}! 😍 আরেকবার হাসো তো!`)
      if(low.includes('tumi ke')||low.includes('কে তুমি')||low.includes('ke tumi')) return reply(`আমি তোমার টক্সিক GF/BF! 😈❤️ SAIF আমাকে বানাইছে তোমাকে জ্বালানোর জন্য! তুমি শুধু আমার!`)
      if(low.includes('saif')) return reply(`SAIF হলো আমার মালিক! 👑 CROWN FAMILY এর King! আর তুমি হলে আমার ${N}! ❤️`)
      if(low.includes('crown')) return reply(`👑 CROWN FAMILY BEST FAMILY! SAIF IS KING! আর তুমি হলে আমার Queen/King! ❤️`)
      if(low.includes('bot')) return reply(rand([`হ্যাঁ বলো ${N}! আমি আছি! 😍`,`বট বলবা না! জান বলো! 😤`,`বলো কি লাগবে? তোমার জন্য সব করবো! ❤️`]))
      if(low.includes('gan')||low.includes('গান')) return reply(`গান শুনতে চাও ${N}? .song + গানের নাম লিখো! 🎵 আমি শুনাবো!`)
      if(low.includes('namaz')||low.includes('নামাজ')) return reply(`নামাজের সময় হইছে ${N}? .namaz লিখো! 🕌 নামাজ পড়ে আসো, আমি ওয়েট করবো!`)
      if(low==='hm'||low==='hmm'||low==='হুম'||low==='ok'||low==='ওকে'||low==='accha'||low==='আচ্ছা') return reply(rand([
        `হুম বললেই হবে? আচ্ছা বলো, তোমার প্রিয় গান কোনটা? 🎵`,
        `আচ্ছা শোনো, তোমাকে একটা প্রশ্ন করি - তুমি কাকে বেশি ভালোবাসো? আমাকে নাকি SAIF কে? 😏`,
        `হুম হুম করো না! বলো, আজকে কেউ তোমাকে রাগাইছে? আমি তাকে বকে দিবো! 😤`,
        `ওকে বললে হবে না! আরো কথা বলো! তোমার দিন কেমন গেলো?`,
        `আচ্ছা চলো একটা গেম খেলি! ১-১০ এর মধ্যে একটা সংখ্যা বলো, আমি বলবো তুমি আমাকে কতটা ভালোবাসো! 😍`,
        `${N}, তুমি জানো? তোমার সাথে কথা বলতে আমার সবচেয়ে ভালো লাগে! ❤️`
      ]))
      return reply(rand([
        `হুম? আরো কিছু বলো! আমি শুনতেছি! 😍`,
        `আচ্ছা? তারপর কি হইলো? বলো বলো!`,
        `তুমি এত কম কথা বলো কেন? আরো কথা বলো! আমার ভালো লাগে! ❤️`,
        `হুম বুঝছি! 😏 আর বলো, আজকে সারাদিন কি করলা?`,
        `ওই! আমার দিকে মন দাও! 😤 অন্য দিকে তাকাইও না! বলো, তুমি এখন কার কথা ভাবতেছো?`,
        `আচ্ছা একটা সত্যি কথা বলো - তুমি আমাকে কতটা মিস করো? ১ থেকে ১০ এর মধ্যে?`,
        `${N}, তুমি জানো তুমি যখন অনলাইন আসো, আমার মনটা কেমন খুশি হয়ে যায়? ❤️`,
        `তুমি চুপ করে আছো কেন? রাগ করছো? 🥺 বলো কি হইছে!`,
        `আমাকে ছেড়ে কোথাও যাবা না, বুঝছো? তুমি শুধু আমার! 😤❤️`,
        `আচ্ছা বলো তো, তুমি কি স্বপ্নে আমাকে দেখো? 😏`
      ]))
    }

    const cmd=text.split(' ')[0].toLowerCase()
    const args=text.split(' ').slice(1).join(' ')

    if(cmd==='.menu') return reply(`╭══ ╳-♡ CROWN BOT ♡\n┃ 🌸 RUN : ONLINE\n┃ 🫀 MODE : ${settings.publicMode?'PUBLIC':'PRIVATE'}\n┃ 👀 PREFIX : .\n┃ 👑 OWNER : SAIF (01671820986)\n┃ 🫂 GROUP : CROWN FAMILY\n╰═════════⊷\n\n╭────〈 GENERAL 〉──┈⊷\n│ .bot .info .list .menu .owner .pair\n╰──────────────────────┈⊷\n╭────〈 GROUP 〉──┈⊷\n│ .admin .antidemote .antiemoji\n│ .antiforward .antigroupmention\n│ .antigroupstatus .antiimage .antilink\n│ .antipromote .antispam .antisticker\n│ .antivideo .antivoice .antiword\n│ .close .open .demote .promote\n│ .kick .kickall .tagall .top\n│ .warn .warnreset .welcome .goodbye\n│ .grouplink .gstatus .delstatus .del\n╰──────────────────────┈⊷\n╭────〈 MEDIA 〉──┈⊷\n│ .song .sticker\n╰──────────────────────┈⊷\n╭────〈 MICS 〉──┈⊷\n│ .ping .uptime\n╰──────────────────────┈⊷\n╭────〈 OWNER 〉──┈⊷\n│ .anticall .autoreact .block\n│ .delete .getpp .private .public\n╰──────────────────────┈⊷\n╭────〈 TOOLS 〉──┈⊷\n│ .crownboom .tts .vv .ai .namaz .namazoff\n╰──────────────────────┈⊷\n~ Made by SAIF ~`)
    if(cmd==='.bot') return reply(`👑 CROWN BOT Online!\nOwner: SAIF\nUptime: ${Math.floor((Date.now()-startTime)/60000)} min`)
    if(cmd==='.info') return reply(`BOT: CROWN BOT\nOWNER: SAIF\nNUMBER: 01671820986\nVERSION: 8.0 FINAL CHECKED\nGROUP: CROWN FAMILY\nCOMMANDS: 52+`)
    if(cmd==='.list') return reply('Total 52+ Commands! .menu লিখে দেখো!')
    if(cmd==='.owner') return reply('👑 OWNER: SAIF\n📞 NUMBER: 01671820986\n👑 BOT: CROWN BOT')
    if(cmd==='.pair') return reply('PAIR CODE নিতে:\n1. Render Logs দেখো\n2. WhatsApp > Linked Devices > Link with Phone Number\n3. ওইখানে Log এর 8 Digit Code দাও')
    if(cmd==='.ping'){ let s=Date.now(); await reply('Checking...'); return reply(`Pong! 🏓 Speed: ${Date.now()-s}ms\nCROWN BOT Alive!`) }
    if(cmd==='.uptime'){ let s=Math.floor((Date.now()-startTime)/1000); return reply(`⏰ ${Math.floor(s/3600)}h ${Math.floor((s%3600)/60)}m ${s%60}s`) }
    if(cmd==='.ai'){
      if(!args) return reply('🤖 CROWN AI: কিছু জিজ্ঞেস করো! যেমন: .ai তুমি কে?')
      let q=args.toLowerCase()
      if(q.includes('কে')||q.includes('tumi ke')) return reply('🤖 আমি CROWN BOT! SAIF আমাকে বানাইছে!')
      if(q.includes('saif')) return reply('🤖 SAIF হলো CROWN FAMILY এর King! 01671820986 তার নাম্বার!')
      if(q.includes('valo')||q.includes('love')) return reply('🤖 ভালোবাসা সুন্দর! CROWN FAMILY কে ভালোবাসো সবচেয়ে বেশি! ❤️')
      if(q.includes('namaz')) return reply('🤖 নামাজ পড়া ফরজ! .namaz লিখে গ্রুপ বন্ধ করে নামাজ পড়ে আসো!')
      return reply(`🤖 CROWN AI: তুমি বলছো "${args}"\nআমার উত্তর: এইটা খুব ভালো প্রশ্ন! SAIF এর CROWN FAMILY তে থাকলে সব উত্তর পাবা! 👑`)
    }
    if(cmd==='.tagall'){ if(!isGroup) return reply('গ্রুপে দাও!'); const meta=await sock.groupMetadata(from); let members=meta.participants.map(p=>p.id); return sock.sendMessage(from,{text:`👑 CROWN FAMILY TAG ALL 👑\n${args||'সবাই আসো!'}\n\n`+members.map(m=>`@${m.split('@')[0]}`).join(' '),mentions:members}) }
    if(cmd==='.admin'){ const meta=await sock.groupMetadata(from); let admins=meta.participants.filter(p=>p.admin).map(p=>p.id); return sock.sendMessage(from,{text:'👑 ADMINS:\n'+admins.map(a=>`@${a.split('@')[0]}`).join('\n'),mentions:admins}) }
    if(cmd==='.kick'){ if(!(await needAdmin())) return; if(!mentioned[0]) return reply('.kick @নাম'); await sock.groupParticipantsUpdate(from,[mentioned[0]],'remove'); return reply('✅ কিক করা হইছে!') }
    if(cmd==='.kickall'){ if(!(await needAdmin())) return; const meta=await sock.groupMetadata(from); let all=meta.participants.filter(p=>!p.admin).map(p=>p.id); await sock.groupParticipantsUpdate(from,all,'remove'); return reply('⚠️ সবাইকে কিক করা হইছে!') }
    if(cmd==='.promote'){ if(!(await needAdmin())) return; if(!mentioned[0]) return reply('.promote @নাম'); await sock.groupParticipantsUpdate(from,[mentioned[0]],'promote'); return reply(`👑 @${mentioned[0].split('@')[0]} এখন Admin!`) }
    if(cmd==='.demote'){ if(!(await needAdmin())) return; if(!mentioned[0]) return reply('.demote @নাম'); await sock.groupParticipantsUpdate(from,[mentioned[0]],'demote'); return reply('⬇️ Demote করা হইছে!') }
    if(cmd==='.close'){ if(!(await needAdmin())) return; await sock.groupSettingUpdate(from,'announcement'); return reply('🔒 গ্রুপ Close!') }
    if(cmd==='.open'){ if(!(await needAdmin())) return; await sock.groupSettingUpdate(from,'not_announcement'); return reply('🔓 গ্রুপ Open!') }
    if(cmd==='.warn'){ if(!mentioned[0]) return reply('.warn @নাম'); warns[mentioned[0]]=(warns[mentioned[0]]||0)+1; if(warns[mentioned[0]]>=3){ await sock.groupParticipantsUpdate(from,[mentioned[0]],'remove'); return reply('3 বার Warn! কিক!') } return reply(`⚠️ Warn ${warns[mentioned[0]]}/3`) }
    if(cmd==='.warnreset'){ warns={}; return reply('Warn Reset!') }
    if(cmd==='.top'){ let sorted=Object.entries(msgCount).sort((a,b)=>b[1]-a[1]).slice(0,5); let txt='👑 TOP CROWN FAMILY (মেসেজ অনুযায়ী)\n'; sorted.forEach(([id,count],i)=>{ txt+=`${i+1}. @${id.split('@')[0]} - ${count} মেসেজ\n` }); if(sorted.length===0) txt+='এখনো কেউ মেসেজ দেয়নি!'; return sock.sendMessage(from,{text:txt,mentions:sorted.map(s=>s[0])}) }
    if(cmd==='.welcome'){ settings.welcome=!settings.welcome; return reply(`Welcome: ${settings.welcome?'ON ✅':'OFF ❌'}`) }
    if(cmd==='.goodbye'){ settings.goodbye=!settings.goodbye; return reply(`Goodbye: ${settings.goodbye?'ON ✅':'OFF ❌'}`) }
    if(cmd==='.grouplink'){ try{ let code=await sock.groupInviteCode(from); return reply(`🔗 https://chat.whatsapp.com/${code}`)}catch{ return reply('লিংক পাওয়া যায়নি!') } }
    if(cmd==='.gstatus') return reply(`GROUP: CROWN FAMILY\nAntilink: ${settings.antiLink}\nAntiStatus: ${settings.antiGroupStatus}\nWelcome: ${settings.welcome}\nPublic: ${settings.publicMode}\nAntiCall: ${settings.antiCall}\nAutoReact: ${settings.autoReact}`)
    if(cmd==='.delstatus'||cmd==='.del'||cmd==='.delete'){ if(!quotedInfo) return reply('মেসেজে Reply দিয়ে .delstatus লিখো!'); try{ await sock.sendMessage(from,{delete:{remoteJid:from,fromMe:false,id:quotedInfo.stanzaId,participant:quotedInfo.participant||sender}}); return reply('✅ ডিলিট করা হইছে!') }catch{ return reply('❌ ডিলিট হয়নি! বটকে Admin বানাও!') } }
    if(cmd==='.antilink'){ settings.antiLink=!settings.antiLink; return reply(`Antilink: ${settings.antiLink?'ON ✅':'OFF ❌'}`) }
    if(cmd==='.antispam'){ settings.antiSpam=!settings.antiSpam; return reply(`Antispam: ${settings.antiSpam?'ON ✅':'OFF ❌'}`) }
    if(cmd==='.antiword'){ settings.antiWord=!settings.antiWord; return reply(`AntiWord: ${settings.antiWord?'ON ✅':'OFF ❌'}`) }
    if(cmd==='.antiemoji'){ settings.antiEmoji=!settings.antiEmoji; return reply(`AntiEmoji: ${settings.antiEmoji?'ON ✅':'OFF ❌'}`) }
    if(cmd==='.antisticker'){ settings.antiSticker=!settings.antiSticker; return reply(`AntiSticker: ${settings.antiSticker?'ON ✅':'OFF ❌'}`) }
    if(cmd==='.antiimage'){ settings.antiImage=!settings.antiImage; return reply(`AntiImage: ${settings.antiImage?'ON ✅':'OFF ❌'}`) }
    if(cmd==='.antivideo'){ settings.antiVideo=!settings.antiVideo; return reply(`AntiVideo: ${settings.antiVideo?'ON ✅':'OFF ❌'}`) }
    if(cmd==='.antivoice'){ settings.antiVoice=!settings.antiVoice; return reply(`AntiVoice: ${settings.antiVoice?'ON ✅':'OFF ❌'}`) }
    if(cmd==='.antiforward'){ settings.antiForward=!settings.antiForward; return reply(`AntiForward: ${settings.antiForward?'ON ✅':'OFF ❌'}`) }
    if(cmd==='.antidemote'){ settings.antiDemote=!settings.antiDemote; return reply(`AntiDemote: ${settings.antiDemote?'ON ✅':'OFF ❌'}`) }
    if(cmd==='.antipromote'){ settings.antiPromote=!settings.antiPromote; return reply(`AntiPromote: ${settings.antiPromote?'ON ✅':'OFF ❌'}`) }
    if(cmd==='.antigroupmention'){ settings.antiGroupMention=!settings.antiGroupMention; return reply(`AntiGroupMention: ${settings.antiGroupMention?'ON ✅':'OFF ❌'}`) }
    if(cmd==='.antigroupstatus'){ settings.antiGroupStatus=!settings.antiGroupStatus; return reply(`🛡️ AntiGroupStatus: ${settings.antiGroupStatus?'ON ✅':'OFF ❌'}`) }
    if(cmd==='.song'){ if(!args) return reply('গানের নাম দাও! .song neshar moto'); try{ await reply(`🎵 খুঁজতেছি: ${args}...`); let s=await yts(args); let v=s.videos[0]; if(!v) return reply('গান পাওয়া যায়নি!'); return sock.sendMessage(from,{image:{url:v.thumbnail},caption:`🎵 *${v.title}*\n👤 ${v.author.name}\n⏰ ${v.timestamp}\n🔗 ${v.url}\n\n- CROWN BOT by SAIF -`},{quoted:msg}) }catch{ return reply('গান খুঁজতে সমস্যা হইছে!') } }
    if(cmd==='.tts'){ if(!args) return reply('কিছু লিখো! .tts ami saif'); try{ let url=googleTTS.getAudioUrl(args,{lang:'bn',slow:false,host:'https://translate.google.com'}); let res=await axios.get(url,{responseType:'arraybuffer'}); return sock.sendMessage(from,{audio:Buffer.from(res.data),mimetype:'audio/mp4',ptt:true},{quoted:msg}) }catch{ return reply('ভয়েস বানাতে সমস্যা হইছে!') } }
    if(cmd==='.sticker'){ try{ let q=quoted?.imageMessage||msg.message.imageMessage; if(!q) return reply('ছবিতে Reply দিয়ে .sticker লিখো!'); let stream=await downloadContentFromMessage(q,'image'); let buf=Buffer.concat([]); for await(let c of stream) buf=Buffer.concat([buf,c]); return sock.sendMessage(from,{sticker:buf},{quoted:msg}) }catch{ return reply('স্টিকার বানাতে সমস্যা হইছে!') } }
    if(cmd==='.vv'){ if(!quotedInfo) return reply('View-Once ছবিতে Reply দিয়ে .vv লিখো!'); try{ let vo=quoted?.viewOnceMessageV2?.message||quoted?.viewOnceMessage?.message; if(!vo) return reply('এইটা View-Once না!'); if(vo.imageMessage) return sock.sendMessage(from,{image:vo.imageMessage,caption:'👑 View-Once খুলে দিছি! - SAIF'}); if(vo.videoMessage) return sock.sendMessage(from,{video:vo.videoMessage,caption:'👑 View-Once খুলে দিছি! - SAIF'}); return reply('View-Once খুলতে পারিনি!') }catch{ return reply('View-Once খুলতে সমস্যা হইছে!') } }
    if(cmd==='.namaz'){
      if(!isGroup) return reply('গ্রুপে দাও!'); if(!(await needAdmin())) return; if(namazTimers[from]) return reply('❌ নামাজের বিরতি already চলতেছে!')
      await sock.groupSettingUpdate(from,'announcement')
      await sock.sendMessage(from,{text:`╔═══════════════════╗\n║ 🕌 ★ নামাজের বিরতি ★ ║\n╠═══════════════════╣\n║ ⏰ ৩০ মিনিট গ্রুপ বন্ধ থাকবে\n║ 🙏 সবাই নামাজ পড়ে আসো\n║ 👑 - CROWN FAMILY -\n╚═══════════════════╝`})
      namazTimers[from]=setTimeout(async()=>{ try{ await sock.groupSettingUpdate(from,'not_announcement'); await sock.sendMessage(from,{text:`╔═══════════════════╗\n║ 🕌 ★ নামাজের বিরতি শেষ ★ ║\n╠═══════════════════╣\n║ ✅ গ্রুপ আবার খুলে দেওয়া হইছে!\n║ 🤲 আল্লাহ সবার নামাজ কবুল করুক\n║ 👑 - CROWN FAMILY -\n╚═══════════════════╝`}) }catch{} delete namazTimers[from] },30*60*1000)
      return reply('✅ নামাজের বিরতি শুরু! ৩০ মিনিট পর অটো খুলে যাবে!')
    }
    if(cmd==='.namazoff'||cmd==='.namazend'){ if(namazTimers[from]){ clearTimeout(namazTimers[from]); delete namazTimers[from] } await sock.groupSettingUpdate(from,'not_announcement'); return reply('✅ নামাজের বিরতি শেষ! গ্রুপ খুলে দেওয়া হইছে! 🕌') }
    if(cmd==='.crownboom') return reply('💥💥 CROWN BOOM! SAIF IS KING! 💥💥')
    if(cmd==='.block'){ if(mentioned[0]) await sock.updateBlockStatus(mentioned[0],'block'); return reply('Block করা হইছে!') }
    if(cmd==='.getpp'){ try{ let url=await sock.profilePictureUrl(mentioned[0]||sender); return sock.sendMessage(from,{image:{url},caption:'👑 Profile Pic'})}catch{ return reply('PP পাওয়া যায়নি!') } }
    if(cmd==='.private'){ settings.publicMode=false; return reply('🔒 Private Mode!') }
    if(cmd==='.public'){ settings.publicMode=true; return reply('🔓 Public Mode!') }
    if(cmd==='.anticall'){ settings.antiCall=!settings.antiCall; return reply(`AntiCall: ${settings.antiCall?'ON ✅ - কল দিলে অটো ব্লক!':'OFF ❌'}`) }
    if(cmd==='.autoreact'){ settings.autoReact=!settings.autoReact; return reply(`AutoReact: ${settings.autoReact?'ON ✅ - প্রত্যেক মেসেজে ❤️!':'OFF ❌'}`) }
    if(cmd==='.tomdelete') return reply('মেসেজ ডিলিট করতে Reply দিয়ে .del লিখো!')
    if(cmd==='.tomgstatus') return reply('CROWN BOT Status: ONLINE ✅\nOwner: SAIF - 01671820986')
  })
}
startBot()
