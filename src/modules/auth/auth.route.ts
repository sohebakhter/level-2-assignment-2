import { Router } from "express";
import { authController } from "./auth.controller";
// import { authController } from "./auth.controller";

const router = Router();

router.post("/signup", authController.registerUser);
// router.post("/login", );

export const authRouter = router;
