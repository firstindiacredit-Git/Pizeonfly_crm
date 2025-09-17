const express = require('express');
const router = express.Router();
const { uploadOfficeDocs } = require('../utils/multerConfig');
const {
  uploadDocument,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  downloadDocument,
  getDocumentStats,
  manageAccess
} = require('../controller/ofiiceDocs');

// Upload document (file or link) - No authentication required for admin access
router.post('/upload', uploadOfficeDocs.single('document'), uploadDocument);

// Get all documents with filtering and pagination
router.get('/', getAllDocuments);

// Get document statistics
router.get('/stats', getDocumentStats);

// Get single document by ID
router.get('/:id', getDocumentById);

// Update document
router.put('/:id', updateDocument);

// Delete document (soft delete by default, permanent with ?permanent=true)
router.delete('/:id', deleteDocument);

// Download document
router.get('/:id/download', downloadDocument);

// Manage access permissions
router.post('/:id/access', manageAccess);

module.exports = router;
