import { default as mongoDb } from 'mongodb';
import dotenv from "dotenv";

dotenv.config();
let MongoClient = mongoDb.MongoClient;
export function saveRecords(query) {
    const client = new MongoClient(process.env.DB_URI, { useNewUrlParser: true });
    client.connect(err => {
        if (err) {
            return err;
        }
        const collection = client.db(process.env.DB_NAME).collection(process.env.COLLECTION_NAME)
        collection.insertMany(query, (err, result) => {
            if (err) {
                return err;
            }
            client.close();
        });
    });
}