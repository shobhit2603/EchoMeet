import mongoose, { Schema, Document, Model } from "mongoose";

// 🔹 Define TypeScript interface for Meeting
export interface IMeeting extends Document {
    user_id: string;
    meetingCode: string;
    date: Date;
}

// 🔹 Schema definition
const meetingSchema: Schema<IMeeting> = new Schema(
    {
        user_id: { type: String, required: true },
        meetingCode: { type: String, required: true, unique: true },
        date: { type: Date, required: true, default: Date.now },
    },
    { timestamps: true } // ✅ optional: adds createdAt & updatedAt
);

// 🔹 Create model
const Meeting: Model<IMeeting> = mongoose.model < IMeeting > ("Meeting", meetingSchema);

export { Meeting };
