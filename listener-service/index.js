import { WebSocketServer } from "ws";
import dotenv from "dotenv";
import url from "url";
import http from "http";
import { decryptMessage, validateMessage } from "./message-service.js";
import html from "html";
import path from "path";
import { saveRecords } from "./db.js";
import fs from "fs";

// import socket from "socket.io";
// const socket = require("socket.io");
import { createRequire } from 'module';
import jsdom from "jsdom";
dotenv.config();
import { fileURLToPath } from 'url';
import { dirname } from 'path';
// const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);
const { JSDOM } = jsdom;
global.document = new JSDOM(html).window.document;

// __dirname = path.resolve(path.dirname(''));
const server = http.createServer((req,res)=>{
  const pathName = req.url;
  console.log(req.url);
  const val = url.parse(req.url);
  // console.log(__dirname);
  // res.writeHead(200, {'Content-type':'text/html'});
  // res.writeHead(200, {'Content-type':'application/json'});
  res.writeHead(200, {"Content-Type": "text/html"});

  fs.createReadStream(path.resolve(__dirname, 'view.html')) 
    .pipe(res);
});
function addData(decryptedMessage,index) {
  var a = document.getElementById('messagestable');
  console.log("element");
  console.log(a);
  let newrow = a.insertRow(index);
  var cell1 = newrow.insertCell(0);
  var cell2 = newrow.insertCell(1);
  var cell3 = newrow.insertCell(2);

  cell1.innerHTML = decryptedMessage['name'],
  cell2.innerHTML = decryptedMessage['origin'],
  cell3.innerHTML = decryptedMessage['destination'];
}
// const io = require("socket.io")(server);
const io = new WebSocketServer({ port: process.env.SOCKET_PORT });

console.log();
var index = 1;
server.listen(8000,()=>{
  console.log("listening to port");
  io.on("connection", (ws) => {
    try {
      var msgBatchToSave = [];
      var startDateTime = new Date();
      ws.on("message", (message) => {
        let incomingData = message.toString().split("|"); //array of encrypted data
        incomingData.forEach((item) => {
          let decryptedMessage = decryptMessage(item);
          if (validateMessage(decryptedMessage)) {
            decryptedMessage = JSON.parse(decryptedMessage);
            delete decryptedMessage.messageHash;
            decryptedMessage["timestamp"] = new Date(); // deleted hash and added timestamp to save to db
            let endDateTime = new Date();
            msgBatchToSave.push(decryptedMessage);
            // addData(decryptedMessage,index)
            index = index + 1;
            // res.sendFile('static/view.html', {root: __dirname })
            if (endDateTime.getTime() - startDateTime.getTime() > 60) {
              // if time diff 1 min 60 ms = 0.000 1m
              saveRecords(msgBatchToSave);
              startDateTime = new Date();
              msgBatchToSave = []; //set to 0 length for next batch of messages
            }
          }
        });
      });
  
      ws.on("error", function onError(err) {
        console.log("Error while receiving message", err);
      });
    } catch (err) {
      console.error("caught error", err);
    }
  });
});