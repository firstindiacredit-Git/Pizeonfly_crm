const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const QRCodeModel = require('../model/qrModel');

router.post('/qr/generate', async (req, res) => {
    try {
        const { title, content, userId } = req.body;
        
        // Generate QR code
        const qrCodeDataUrl = await QRCode.toDataURL(content);
        
        // Save to database with userId and title
        const newQRCode = new QRCodeModel({ 
            title,
            content,
            userId 
        });
        await newQRCode.save();
        
        res.json({ success: true, qrCode: qrCodeDataUrl });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add new route to get user's QR codes
router.get('/qr/user/:userId', async (req, res) => {
    try {
        const userQRCodes = await QRCodeModel.find({ userId: req.params.userId });
        res.json({ success: true, qrCodes: userQRCodes });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add delete route
router.delete('/qr/:id', async (req, res) => {
    try {
        const qrCode = await QRCodeModel.findByIdAndDelete(req.params.id);
        if (!qrCode) {
            return res.status(404).json({ success: false, error: 'QR code not found' });
        }
        res.json({ success: true, message: 'QR code deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
