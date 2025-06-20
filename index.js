const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const config = require("./config");

// decode base64 session ID from .env
const decodedSession = Buffer.from(config.SESSION_ID, "base64").toString("utf-8");

// save session as multi-auth format
const sessionDir = path.join(__dirname, "session");
if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir);
fs.writeFileSync(path.join(sessionDir, "creds.json"), decodedSession);

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("session");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

    if (body.toLowerCase() === "hi") {
      await sock.sendMessage(from, { text: "Bot active Noob X Hasan 🔥" });
    }
  });

  sock.ev.on("connection.update", (update) => {
    const { connection } = update;
    if (connection === "open") {
      console.log("✅ Bot Connected Successfully");
    }
  });
}

startBot();
