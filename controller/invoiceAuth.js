const express = require('express');
const router = express.Router();
const Invoice = require('../model/invoiceModel');

// Create a new invoice
router.post('/invoices', async (req, res) => {
    try {
        const newInvoice = new Invoice(req.body);
        const savedInvoice = await newInvoice.save();
        res.status(201).json(savedInvoice);
    } catch (error) {
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

module.exports = router;

