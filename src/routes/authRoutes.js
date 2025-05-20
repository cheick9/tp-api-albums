import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// 🔐 Route de login fictive
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === 'password') {
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });
  }

  return res.status(401).json({ message: 'Identifiants invalides' });
});

export default router;
