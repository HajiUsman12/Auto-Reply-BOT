const { default: makeWASocket, useSingleFileAuthState } = require("@whiskeysockets/baileys");
const fs = require("fs");
const config = require("./config");

const sessionData = Buffer.from(config.SESSION_ID, "base64").toString("utf-8");
fs.writeFileSync("session.json", sessionData);

const { state, saveState } = useSingleFileAuthState("./session.json");
const keywords = JSON.parse(fs.readFileSync("./keywords.json", "utf8"));

async function connectBot() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  sock.ev.on("creds.update", saveState);

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (!messages || type !== "notify") return;

    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    const text = body.toLowerCase();

    if (keywords[text]) {
      await sock.sendMessage(from, { text: keywords[text] });
      console.log(`[REPLY]: ${text} → ${keywords[text]}`);
    }
  });
}

connectBot();
