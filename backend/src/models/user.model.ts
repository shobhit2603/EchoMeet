import mongoose, { Schema, Document, Model } from "mongoose";

// 🔹 Define TypeScript interface for User
export interface IUser extends Document {
    name: string;
    username: string;
    password: string;
    token?: string;
}

// 🔹 Schema definition
const userSchema: Schema<IUser> = new Schema(
    {
        name: { type: String, required: true },
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        token: { type: String },
    },
    { timestamps: true } // ✅ optional: adds createdAt & updatedAt fields
);

// 🔹 Create model
const User: Model<IUser> = mongoose.model < IUser > ("User", userSchema);

export { User };
