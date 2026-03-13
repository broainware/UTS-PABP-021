const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Database sementara 
const users = [];
const refreshTokens = [];

// REGISTER
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: 'Username dan password wajib diisi' });

  const exists = users.find(u => u.username === username);
  if (exists) return res.status(400).json({ message: 'Username sudah dipakai' });

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ id: Date.now(), username, password: hashedPassword });

  res.status(201).json({ message: 'Registrasi berhasil' });
});

// LOGIN
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).json({ message: 'User tidak ditemukan' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: 'Password salah' });

  const accessToken = jwt.sign({ id: user.id, username }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user.id, username }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  refreshTokens.push(refreshToken);

  res.json({ accessToken, refreshToken });
});

// REFRESH
router.post('/refresh', (req, res) => {
  const { token } = req.body;
  if (!token || !refreshTokens.includes(token))
    return res.status(403).json({ message: 'Refresh token tidak valid' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const accessToken = jwt.sign({ id: decoded.id, username: decoded.username }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.json({ accessToken });
  } catch {
    res.status(403).json({ message: 'Token expired' });
  }
});

// LOGOUT
router.post('/logout', (req, res) => {
  const { token } = req.body;
  const index = refreshTokens.indexOf(token);
  if (index > -1) refreshTokens.splice(index, 1);
  res.json({ message: 'Logout berhasil' });
});

module.exports = router;