import express from 'express';
import Album from '../models/Album.js';
// eslint-disable-next-line import/no-unresolved
import Photo from '../models/photo.js';

const router = express.Router();

// 📄 GET /album/:idalbum/photos : Toutes les photos d’un album
router.get('/album/:idalbum/photos', async (req, res) => {
  try {
    const photos = await Photo.find({ album: req.params.idalbum });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📷 GET /album/:idalbum/photo/:idphotos : Une photo spécifique
// eslint-disable-next-line consistent-return
router.get('/album/:idalbum/photo/:idphotos', async (req, res) => {
  try {
    const photo = await Photo.findOne({
      _id: req.params.idphotos,
      album: req.params.idalbum
    });

    if (!photo) return res.status(404).json({ error: 'Photo non trouvée' });
    res.json(photo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➕ POST /album/:idalbum/photo : Ajouter une photo à un album
// eslint-disable-next-line consistent-return
router.post('/album/:idalbum/photo', async (req, res) => {
  try {
    const album = await Album.findById(req.params.idalbum);
    if (!album) return res.status(404).json({ error: 'Album non trouvé' });

    const photo = new Photo({ ...req.body, album: album._id });
    await photo.save();

    // Ajout de la photo dans l’album
    album.photos.push(photo._id);
    await album.save();

    res.status(201).json(photo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✏️ PUT /album/:idalbum/photo/:idphotos : Modifier une photo
// eslint-disable-next-line consistent-return
router.put('/album/:idalbum/photo/:idphotos', async (req, res) => {
  try {
    const photo = await Photo.findOneAndUpdate(
      { _id: req.params.idphotos, album: req.params.idalbum },
      req.body,
      { new: true }
    );
    if (!photo) return res.status(404).json({ error: 'Photo non trouvée' });
    res.json(photo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ❌ DELETE /album/:idalbum/photo/:idphotos : Supprimer une photo
// eslint-disable-next-line consistent-return
router.delete('/album/:idalbum/photo/:idphotos', async (req, res) => {
  try {
    const photo = await Photo.findOneAndDelete({
      _id: req.params.idphotos,
      album: req.params.idalbum
    });

    if (!photo) return res.status(404).json({ error: 'Photo non trouvée' });

    // Retirer la photo de l’album
    await Album.findByIdAndUpdate(req.params.idalbum, {
      $pull: { photos: photo._id }
    });

    res.json({ message: 'Photo supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
