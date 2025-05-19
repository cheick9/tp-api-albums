import express from 'express';
import Album from '../models/Album.js';

const router = express.Router();

// ➕ POST /album : Créer un nouvel album
router.post('/album', async (req, res) => {
  try {
    const album = new Album(req.body);
    await album.save();
    res.status(201).json(album);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📄 GET /album/:id : Récupérer un album par ID
// eslint-disable-next-line consistent-return
router.get('/album/:id', async (req, res) => {
  try {
    const album = await Album.findById(req.params.id).populate('photos');
    if (!album) return res.status(404).json({ error: 'Album non trouvé' });
    res.json(album);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✏️ PUT /album/:id : Mettre à jour un album
// eslint-disable-next-line consistent-return
router.put('/album/:id', async (req, res) => {
  try {
    const album = await Album.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!album) return res.status(404).json({ error: 'Album non trouvé' });
    res.json(album);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ❌ DELETE /album/:id : Supprimer un album
// eslint-disable-next-line consistent-return
router.delete('/album/:id', async (req, res) => {
  try {
    const album = await Album.findByIdAndDelete(req.params.id);
    if (!album) return res.status(404).json({ error: 'Album non trouvé' });
    res.json({ message: 'Album supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📃 GET /albums?title=... : Récupérer tous les albums, avec filtre par titre
router.get('/albums', async (req, res) => {
  try {
    const filter = req.query.title ? { title: new RegExp(req.query.title, 'i') } : {};
    const albums = await Album.find(filter).populate('photos');
    res.json(albums);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
