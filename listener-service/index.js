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
import express from 'express';
import cors from 'cors';
// const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
// var clientio  = require('socket.io-client');         // this is the socket.io client
// var client    = clientio.connect(process.env.REACT_SOCKET);
const __dirname = dirname(__filename);
const { JSDOM } = jsdom;
global.document = new JSDOM(html).window.document;
const app = express();
// __dirname = path.resolve(path.dirname(''));


// const io = require("socket.io")(server);
var messages = []
const io = new WebSocketServer({ port: process.env.SOCKET_PORT },{origins:'*'});
var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // For legacy browser support
}
app.get('/',function(req,res) {
  res.sendFile(path.join(__dirname+'/view.html'));
});
app.get('/data',function(req,res) {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ 'values': messages }));
});
app.use(cors());
const server = http.createServer(app);
// console.log();

// var index = 1;
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
            messages.push(decryptedMessage);
            console.log("working");
            // addData(decryptedMessage,index)
            // client.emit('reactData',"hi");
            // index = index + 1;
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