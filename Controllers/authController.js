import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export const registerUser = async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      const hashPassword = await bcrypt.hash(password, 10);
      //console.log(hashPassword);
      const newUser = new User({ name, email, password: hashPassword, role });
      await newUser.save();
      res
        .status(200)
        .json({ message: "User Registered Successfully", data: newUser });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  export const loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User Not Found" });
      }
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(400).json({ message: "Invalid Password" });
      }
  
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECERT, {
        expiresIn: "1h",
      });
      user.token = token;
      await user.save();
      res
        .status(200)
        .json({ message: "User Logged In Successfully", token: token });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

import nodemailer from "nodemailer";
import User from "../Models/User.js";
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'your_email@gmail.com',
        pass: 'your_password'
    }
});

// Endpoint to Request Password Reset
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000; // Token valid for 1 hour
    await user.save();

    const resetLink = `http://localhost:5000/reset-password/${resetToken}`;

    await transporter.sendMail({
        to: email,
        subject: 'Password Reset',
        text: `Please reset your password by clicking the following link: ${resetLink}`
    });

    res.json({ message: 'Password reset link sent' });
});

// Endpoint to Reset Password
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await User.findOne({
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
});

module.exports = router;