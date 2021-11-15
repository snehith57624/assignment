import WebSocket from "ws";
import { generateMessage, encryptMessage } from "./message-service.js";
import { randomInteger } from "./utils.js";
import dotenv from "dotenv";
dotenv.config();

const ws = new WebSocket(process.env.SOCKET_URL);

ws.on("open", function open() {
  setInterval(() => {
    let messageCount = randomInteger(49, 499);
    let dataStream = [];
    for (let i = 0; i < messageCount; i++) {
      dataStream.push(encryptMessage(JSON.stringify(generateMessage()))); //stringify and encrypt message before pushing in data stream
    }
    console.log(`dataStream`, dataStream);
    ws.send(dataStream.join("|"));
  }, 10000);
});
