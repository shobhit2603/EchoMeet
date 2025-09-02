import { Router } from "express";
import { login, register } from "../controllers/user.controller";

const router = Router();

// 🔹 Auth routes
router.post("/login", login);
router.post("/register", register);

// 🔹 Activity routes (placeholders – need controllers later)
router.post("/add_to_activity", (req, res) => {
    return res.status(501).json({ message: "Not Implemented" });
});

router.get("/get_all_activity", (req, res) => {
    return res.status(501).json({ message: "Not Implemented" });
});

export default router;
