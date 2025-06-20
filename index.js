const { default: makeWASocket, useSingleFileAuthState } = require("@whiskeysockets/baileys");
const fs = require("fs");

// Session auth file path
const { state, saveState } = useSingleFileAuthState("./session.json"); // <-- SESSION FILE

// Load keywords
const keywords = JSON.parse(fs.readFileSync("./keywords.json", "utf8"));

async function connectBot() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true, // QR sirf first time
  });

  // Save session when it updates
  sock.ev.on("creds.update", saveState);

  // Message event
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

    const lowerBody = body.toLowerCase();
    if (keywords[lowerBody]) {
      await sock.sendMessage(from, { text: keywords[lowerBody] });
      console.log(`[AutoReply]: "${body}" => "${keywords[lowerBody]}"`);
    }
  });
}

connectBot();
