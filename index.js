const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const fs = require("fs");
require("dotenv").config();

// Decode session from .env
const sessionData = Buffer.from(process.env.SESSION_ID, "base64").toString("utf-8");

const sessionPath = "./session";
if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath);
fs.writeFileSync(`${sessionPath}/creds.json`, sessionData);

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("session");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

    if (body.toLowerCase() === "hi") {
      await sock.sendMessage(from, { text: "Hello Noob X Hasan! Bot active ✅" });
    }
  });

  sock.ev.on("connection.update", ({ connection }) => {
    if (connection === "open") {
      console.log("✅ Bot connected successfully");
    }
  });
}

startBot();
