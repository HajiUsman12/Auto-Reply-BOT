const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const config = require("./config");

// 🧠 Decode Base64 SESSION_ID from .env
const decodedSession = Buffer.from(config.SESSION_ID, "base64").toString("utf-8");

// 💾 Save it as Multi-Auth format in ./session
const sessionDir = path.join(__dirname, "session");
if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir);
fs.writeFileSync(path.join(sessionDir, "creds.json"), decodedSession);

// 🛠️ Use Baileys Auth
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("session");

  const sock = makeWASocket({
    printQRInTerminal: false,
    auth: state
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (!messages || type !== "notify") return;

    const msg = messages[0];
    const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
    const from = msg.key.remoteJid;

    if (body.toLowerCase() === "hi") {
      await sock.sendMessage(from, { text: "Hi Noob X Hasan! Bot is active ✅" });
    }
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      console.log("⛔ Connection closed, trying to reconnect...", reason);
      startBot(); // Auto-reconnect
    } else if (connection === "open") {
      console.log("✅ Bot connected!");
    }
  });
}

startBot();
