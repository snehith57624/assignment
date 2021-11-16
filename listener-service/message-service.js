import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

export function decryptMessage(message) {
  try {
    message = message.toString();
    // console.log("received encrypted message:", message, "\n");

    const iv = message.substring(message.length - 32);
    const encryptedMessageWithoutIv = message.substring(0, message.length - 32);
    const key = crypto.scryptSync(process.env.SECRET_KEY, process.env.SALT, 32);

    const decipher = crypto.createDecipheriv(
      "aes-256-ctr",
      key,
      Buffer.from(iv, "hex")
    );

    let decryptedData = decipher.update(
      encryptedMessageWithoutIv,
      "hex",
      "utf-8"
    );
    decryptedData = decryptedData + decipher.final("utf8");

    // console.log("Decrypted Data:", decryptedData, "\n");

    return decryptedData;
  } catch (err) {
    console.log("Error caught ", err);
  }
}

export function validateMessage(message) {
  try {
    message = JSON.parse(message);
    let orignalHash = message.messageHash;
    delete message.messageHash;
    let calculatedHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(message))
    .digest("hex");
    return calculatedHash == orignalHash ? true : false;
  } catch (err) {
    console.log(err);
  }
}
