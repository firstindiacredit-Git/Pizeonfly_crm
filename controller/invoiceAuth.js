const express = require('express');
const router = express.Router();
const Invoice = require('../model/invoiceModel');
const { uploadInvoice } = require('../utils/multerConfig');

// Create a new invoice with logo upload
router.post('/invoices', uploadInvoice.single('logo'), async (req, res) => {
    try {
        // Parse the JSON data from the request
        const invoiceData = JSON.parse(req.body.data);

        // If a file was uploaded, add the file path
        if (req.file) {
            invoiceData.logo = req.file.path;
        }

        const newInvoice = new Invoice(invoiceData);
        const savedInvoice = await newInvoice.save();
        res.status(201).json(savedInvoice);
    } catch (error) {
        console.error('Error creating invoice:', error);
        res.status(400).json({ message: error.message });
    }
});

// Get all invoices
router.get('/invoices', async (req, res) => {
    try {
        const invoices = await Invoice.find().populate('clientDetail');
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get last invoice
router.get('/invoices/last', async (req, res) => {
    try {
        const invoice = await Invoice.findOne().sort({ _id: -1 });
        res.json(invoice.invoiceNumber);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single invoice by ID
router.get('/invoices/:id', async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (invoice) {
            res.json(invoice);
        } else {
            res.status(404).json({ message: 'Invoice not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update an existing invoice
router.put('/invoices/:id', async (req, res) => {
    try {
        const updatedInvoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (updatedInvoice) {
            res.json(updatedInvoice);
        } else {
            res.status(404).json({ message: 'Invoice not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete an existing invoice
router.delete('/invoices/:id', async (req, res) => {
    try {
        const deletedInvoice = await Invoice.findByIdAndDelete(req.params.id);
        if (deletedInvoice) {
            res.json({ message: 'Invoice deleted successfully' });
        } else {
            res.status(404).json({ message: 'Invoice not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get unique logos from all invoices
router.get('/invoice-logos', async (req, res) => {
    try {
        // Get unique logos from all invoices
        const logos = await Invoice.distinct('logo');
        // Filter out null/empty values and return as an array
        const validLogos = logos.filter(logo => logo != null && logo !== '');
        res.json(validLogos || []); // Ensure we always return an array
    } catch (error) {
        console.error('Error fetching logos:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

