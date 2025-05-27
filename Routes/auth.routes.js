import { Router } from "express";
import { signIn, signOut, signUp } from "../Controller/auth.js";

const router = Router();
// /api/v1/auth/sign-up -> post body {name, email, password}
// /api/v1/auth/sign-in -> post body {email, password}
router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.post("/sign-out", signOut);
export default router;

