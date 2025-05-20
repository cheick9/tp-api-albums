import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // Ajoute une ligne vide après

export default function verifyToken(req, res, next) {
  const token = req.headers.authorization; // dot notation

  if (!token) {
    return res.status(403).json({ message: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next(); // return pour éviter le warning "consistent-return"
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide' });
  }
}
