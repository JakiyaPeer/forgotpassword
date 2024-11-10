import express from "express";
const router=express.Router();

router.post("/forgot-password",forgotPassword);
router.post("/reset-password/:id/:token",resetPassword);

export default router;
