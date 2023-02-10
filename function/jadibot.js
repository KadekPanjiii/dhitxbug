const { default: makeWaSocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, generateForwardMessageContent, generateWAMessage, prepareWAMessageMedia, generateWAMessageFromContent, generateMessageID, downloadContentFromMessage, makeInMemoryStore, jidDecode, proto } = require('@adiwajshing/baileys')
const { Boom } = require('@hapi/boom');
const { color, bgcolor } = require('../function/color')
const logg = (pino = require("pino"));
const qrcode = require('qrcode');
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetchJson, await, sleep, reSize } = require('./myfunc')
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })

if (global.listJadibot instanceof Array) color.log()
else global.listJadibot = []

const jadibot = async (rixx, msg, from) => {
const { sendImage, sendMessage } = rixx;
const { reply, sender } = msg;
const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, `./database/jadibot/${sender.split("@")[0]}`), logg({ level: "silent" }));
try {
async function start() {
let { version, isLatest } = await fetchLatestBaileysVersion();
const rixx = await makeWaSocket({
auth: state,
printQRInTerminal: true,
browser: ['Dhitaax Botz', "Chrome", "1.0.0"],
logger: logg({ level: "silent" }),
version,
})

rixx.ev.on('messages.upsert', async chatUpdate => {
try {
kay = chatUpdate.messages[0]
if (!kay.message) return
kay.message = (Object.keys(kay.message)[0] === 'ephemeralMessage') ? kay.message.ephemeralMessage.message : kay.message
if (kay.key && kay.key.remoteJid === 'status@broadcast') return
if (!rixx.public && !kay.key.fromMe && chatUpdate.type === 'notify') return
if (kay.key.id.startsWith('BAE5') && kay.key.id.length === 16) return
m = smsg(rixx, msg, store)
require('./rixx')(rixx, m, chatUpdate, store)
} catch (err) {
color.log(err)}
})

store.bind(rixx.ev);
rixx.ev.on("creds.update", saveCreds);
rixx.ev.on("connection.update", async up => {
const { lastDisconnect, connection } = up;
if (connection == "connecting") return
if (connection){
if (connection != "connecting") color.log("Connecting to jadibot..")
}
if (up.qr) await sendImage(from, await qrcode.toDataURL(up.qr,{scale : 8}), 'Scan QR ini untuk jadi bot sementara\n\n1. Klik titik 3 di pojok kanan atas\n2. Klik Perangkat Tertaut\n3. Scan QR ini \nQR Expired dalam 30 detik', msg)
color.log(connection)
if (connection == "open") {
rixx.id = rixx.decodeJid(rixx.user.id)
rixx.time = Date.now()
global.listJadibot.push(conn)
await reply(`*Connected to Whatsapp - Bot*\n\n*User :*\n _*× ID : ${rixx.decodeJid(rixx.user.id)}*_`)
let user = `${rixx.decodeJid(rixx.user.id)}`
let txt = `*Terdeteksi menumpang Jadibot*\n\n _× User : @${user.split("@")[0]}_`
rixx.sendMessage('6281926892383@s.whatsapp.net', {text: txt, mentions : [user]})
}

if (connection === 'close') {
let reason = new Boom(lastDisconnect?.error)?.output.statusCode
if (reason === DisconnectReason.badSession) { 
color.log(`Bad Session File, Please Delete Session and Scan Again`); rixx.logout(); }
else if (reason === DisconnectReason.connectionClosed) { 
color.log("Connection closed, reconnecting...."); start(); }
else if (reason === DisconnectReason.connectionLost) { 
color.log("Connection Lost from Server, reconnecting..."); start(); }
else if (reason === DisconnectReason.connectionReplaced) { 
color.log("Connection Replaced, Another New Session Opened, Please Close Current Session First"); rixx.logout(); }
else if (reason === DisconnectReason.loggedOut) { 
color.log(`Device Logged Out, Please Scan Again And Run.`); rixx.logout(); }
else if (reason === DisconnectReason.restartRequired) { 
color.log("Restart Required, Restarting..."); start(); }
else if (reason === DisconnectReason.timedOut) { 
color.log("Connection TimedOut, Reconnecting..."); start(); }
else rixx.end(`Unknown DisconnectReason: ${reason}|${connection}`)
}
})

rixx.decodeJid = (jid) => {
if (!jid) return jid
if (/:\d+@/gi.test(jid)) {
let decode = jidDecode(jid) || {}
return decode.user && decode.server && decode.user + '@' + decode.server || jid
} else return jid
}

rixx.sendText = (jid, text, quoted = '', options) => rixx.sendMessage(jid, { text: text, ...options }, { quoted })

}
start()
} catch (e) {
color.log(e)
}
}

module.exports = { jadibot, listJadibot }