import { Request, Response } from "express";
import httpStatus from "http-status";
import { User } from "../models/user.model";
import bcrypt from "bcrypt";
import crypto from "crypto";

// 🔹 Login Controller
const login = async (req: Request, res: Response): Promise<Response> => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res
            .status(httpStatus.BAD_REQUEST)
            .json({ message: "Username and password are required" });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res
                .status(httpStatus.NOT_FOUND)
                .json({ message: "User Not Found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res
                .status(httpStatus.UNAUTHORIZED)
                .json({ message: "Invalid Credentials" });
        }

        const token = crypto.randomBytes(20).toString("hex");
        user.token = token;
        await user.save();

        return res
            .status(httpStatus.OK)
            .json({ message: "Login Successful", token });
    } catch (e: any) {
        return res
            .status(httpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: `Something went wrong: ${e.message}` });
    }
};

// 🔹 Register Controller
const register = async (req: Request, res: Response): Promise<Response> => {
    const { name, username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res
                .status(httpStatus.CONFLICT)
                .json({ message: "User Already Exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            username,
            password: hashedPassword,
        });

        await newUser.save();

        return res
            .status(httpStatus.CREATED)
            .json({ message: "User Registered Successfully" });
    } catch (e: any) {
        return res
            .status(httpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: `Something went wrong: ${e.message}` });
    }
};

export { login, register };
