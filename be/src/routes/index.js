import express from "express";
import { createUser, getUsers, login } from "../controllers/user.controller.js";
import { verfifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create-user", createUser);
router.post("/login", login);
router.get("/users", verfifyToken, getUsers);

export default router;
