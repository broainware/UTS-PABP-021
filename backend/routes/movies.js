const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

let movies = [];

// GET semua film
router.get('/', (req, res) => {
  const userMovies = movies.filter(m => m.userId === req.user.id);
  res.json(userMovies);
});

// POST tambah film
router.post('/', (req, res) => {
  const { title, genre, director, year, status } = req.body;
  if (!title || !genre || !director || !year || !status)
    return res.status(400).json({ message: 'Semua field wajib diisi' });

  const movie = {
    id: Date.now(),
    userId: req.user.id,
    title, genre, director, year, status
  };
  movies.push(movie);
  res.status(201).json(movie);
});

// GET film by ID
router.get('/:id', (req, res) => {
  const movie = movies.find(m => m.id == req.params.id && m.userId === req.user.id);
  if (!movie) return res.status(404).json({ message: 'Film tidak ditemukan' });
  res.json(movie);
});

// PUT update film
router.put('/:id', (req, res) => {
  const index = movies.findIndex(m => m.id == req.params.id && m.userId === req.user.id);
  if (index === -1) return res.status(404).json({ message: 'Film tidak ditemukan' });

  movies[index] = { ...movies[index], ...req.body };
  res.json(movies[index]);
});

// DELETE film
router.delete('/:id', (req, res) => {
  const index = movies.findIndex(m => m.id == req.params.id && m.userId === req.user.id);
  if (index === -1) return res.status(404).json({ message: 'Film tidak ditemukan' });

  movies.splice(index, 1);
  res.json({ message: 'Film berhasil dihapus' });
});

module.exports = router;