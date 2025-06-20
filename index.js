const { default: makeWASocket, useSingleFileAuthState } = require("@whiskeysockets/baileys");
const fs = require("fs");

const { state, saveState } = useSingleFileAuthState("./session.json");
const keywords = JSON.parse(fs.readFileSync("./keywords.json", "utf8"));

async function connectBot() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  sock.ev.on("creds.update", saveState);

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    const lower = body.trim().toLowerCase();

    if (keywords[lower]) {
      await sock.sendMessage(from, { text: keywords[lower] });
      console.log(`[AutoReply]: "${body}" → "${keywords[lower]}"`);
    }
  });
}

connectBot();
