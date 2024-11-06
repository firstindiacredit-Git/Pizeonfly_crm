// urlRoutes.js

const express = require('express');
const router = express.Router();
const Url = require('../model/urlModel');
const shortid = require('shortid');
const QRCode = require('qrcode');

// Get URLs for logged-in user
router.get('/url', async (req, res) => {
  try {
    const userId = req.headers['user-id']; // Get userId from request header
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const urls = await Url.find({ userId }).sort({ created_at: -1 });
    res.json(urls);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching URLs' });
  }
});

// Create shortened URL with QR code
router.post('/shorten', async (req, res) => {
  try {
    const { title, original_url } = req.body;
    const userId = req.headers['user-id'];

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const short_code = shortid.generate();
    const short_url = short_code;
    const qr = await QRCode.toDataURL(original_url, {
      width: 1000,
      margin: 2,
      errorCorrectionLevel: 'H'
    });

    const url = new Url({
      title,
      original_url,
      short_url: short_url,
      qr,
      userId
    });

    await url.save();
    res.json(url);
  } catch (error) {
    res.status(500).json({ error: 'Error creating shortened URL' });
  }
});

// Redirect route with `r/:shortCode` to handle server-side redirection
router.get('/r/:shortCode', async (req, res) => {
  try {
    const url = await Url.findOne({ short_url: req.params.shortCode });

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }
    res.redirect(url.original_url);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


// Delete URL by short code
router.delete('/:shortCode', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const url = await Url.findOneAndDelete({ 
      short_url: req.params.shortCode,
      userId
    });

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }
    res.json({ message: 'URL deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting URL' });
  }
});

module.exports = router;
