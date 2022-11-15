import mongoose, { Document } from "mongoose";

const Schema = mongoose.Schema;
const model = mongoose.model;

export interface Message extends Document {
    id: number;
    data: object;
}
const messageSchema = new Schema<Message>(
    {
        data: { type: Object },
    });

export interface File extends Document {
    id: number;
    hash: string;
    messages: object[];
}
const fileSchema = new Schema<File>(
    {
        hash: { type: String },
        messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
    });

export const MessageModel = mongoose.model("Message", messageSchema);
export const FileModel = mongoose.model("File", fileSchema);
