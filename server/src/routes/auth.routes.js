 // routes/authRoutes.js
import express from "express";
import {
  signupUser,
  loginUser,
  refreshUserAccessToken,
  logoutUser,
  forgotPassword,
  resetPassword,
  googleCallback,
  storeRefreshToken
} from "../controllers/auth.controller.js";
import { verifyRefreshToken } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/inputValidationMiddleware.js";
import passport from "../config/passport.js";

const router = express.Router();

router.post("/signup", validate("signup"), signupUser);
router.post("/login", validate("login"), loginUser);
router.get("/google", 
    passport.authenticate("google", 
    {
        scope: ["profile", "email"]
    }
));
router.get("/google/dashboard",
  passport.authenticate("google", { failureRedirect: "/", session: false }),
  googleCallback
);
router.post("/forgot-password", validate("forgotPassword"), forgotPassword);
router.post("/reset-password", validate("resetPassword"), resetPassword);
router.post("/refresh", verifyRefreshToken, refreshUserAccessToken);
router.post("/logout", logoutUser);

export default router;