const Invoice = require('../model/invoiceModel');

// Create a new invoice
exports.createInvoice = async (req, res) => {
    try {
        // console.log(req.body);
        const newInvoice = new Invoice(req.body);
        // console.log(newInvoice,"ni");
        const savedInvoice = await newInvoice.save();
        // console.log(savedInvoice);
        res.status(201).json(savedInvoice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all invoices
exports.getAllInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find().populate('clientDetail');
        // console.log(invoices);
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Get last invoices
exports.getLastInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findOne().sort({ _id: -1 });
        res.json(invoice.invoiceNumber);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// Get a single invoice by ID
exports.getInvoiceById = async (req, res) => {
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
};

// Update an existing invoice
exports.updateInvoice = async (req, res) => {
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
};

// Delete an existing invoice
exports.deleteInvoice = async (req, res) => {
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
};
