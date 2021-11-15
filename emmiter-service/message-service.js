import crypto from "crypto";
import dotenv from "dotenv";
import fs from "fs";

import { getRandom } from "./utils.js";
dotenv.config();

const data = JSON.parse(fs.readFileSync("data.json", "utf8"));

//function generate random message
export function generateMessage() {
  let message = {
    name: getRandom(data.names),
    origin: getRandom(data.cities),
    destination: getRandom(data.cities),
  };
  message["messageHash"] = crypto
    .createHash("sha256")
    .update(JSON.stringify(message))
    .digest("hex");
  return message;
}

export function encryptMessage(message) {
  try {
    const key = crypto.scryptSync(process.env.SECRET_KEY, process.env.SALT, 32); //create key
    const iv = crypto.randomBytes(16); //get IV
    const cipher = crypto.createCipheriv("aes-256-ctr", key, iv); //Cipher

    let encryptedMessage = cipher.update(message, "utf-8", "hex");
    encryptedMessage = encryptedMessage + cipher.final("hex"); // encrypt the message

    console.log(`Encrypted message before iv prefix: ${encryptedMessage} \n`);

    const encryptedMessageWithIV = encryptedMessage + iv.toString("hex");

    console.log("Final encrypted message", encryptedMessageWithIV, "\n");

    return encryptedMessageWithIV;
  } catch (err) {
    console.log("encryption error", err);
  }
}
