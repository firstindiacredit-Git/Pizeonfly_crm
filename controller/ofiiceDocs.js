const OfficeDocs = require('../model/officeDocsModel');
const fs = require('fs');
const path = require('path');

// Upload office document (file or link)
const uploadDocument = async (req, res) => {
  try {
    const { title, description, documentType, uploadType, documentLink, tags, isPublic } = req.body;
    
    // Validate required fields
    if (!title || !documentType || !uploadType) {
      return res.status(400).json({
        success: false,
        message: 'Title, document type, and upload type are required'
      });
    }

    // Validate upload type specific requirements
    if (uploadType === 'file' && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'File is required for file upload type'
      });
    }

    if (uploadType === 'link' && !documentLink) {
      return res.status(400).json({
        success: false,
        message: 'Document link is required for link upload type'
      });
    }

    const documentData = {
      title,
      description,
      documentType,
      uploadType,
      uploadedBy: 'admin', // Default admin user - no authentication required
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      isPublic: isPublic === 'true'
    };

    // Handle file upload
    if (uploadType === 'file' && req.file) {
      documentData.fileName = req.file.filename;
      documentData.originalFileName = req.file.originalname;
      documentData.filePath = req.file.path;
      documentData.fileSize = req.file.size;
      documentData.mimeType = req.file.mimetype;
    }

    // Handle link upload
    if (uploadType === 'link') {
      documentData.documentLink = documentLink;
    }

    const document = new OfficeDocs(documentData);
    await document.save();

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });

  } catch (error) {
    console.error('Error uploading document:', error);
    console.error('Error stack:', error.stack);
    
    // Clean up uploaded file if there's an error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get all documents with filtering and pagination
const getAllDocuments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      documentType,
      uploadType,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isPublic
    } = req.query;

    const skip = (page - 1) * limit;
    const query = { status: 'active' };

    // Apply filters
    if (documentType && documentType !== 'all') {
      query.documentType = documentType;
    }

    if (uploadType && uploadType !== 'all') {
      query.uploadType = uploadType;
    }

    if (isPublic !== undefined) {
      query.isPublic = isPublic === 'true';
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // No authentication required - all documents visible to admin

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const documents = await OfficeDocs.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await OfficeDocs.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        documents,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalDocuments: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get single document by ID
const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await OfficeDocs.findById(id);

    if (!document || document.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // No authentication required - admin access

    res.status(200).json({
      success: true,
      data: document
    });

  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update document
const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, documentType, tags, isPublic } = req.body;

    const document = await OfficeDocs.findById(id);

    if (!document || document.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // No authentication required - admin can edit all documents

    // Update fields
    if (title) document.title = title;
    if (description !== undefined) document.description = description;
    if (documentType) document.documentType = documentType;
    if (tags !== undefined) {
      document.tags = tags ? tags.split(',').map(tag => tag.trim()) : [];
    }
    if (isPublic !== undefined) document.isPublic = isPublic === 'true';

    await document.save();

    res.status(200).json({
      success: true,
      message: 'Document updated successfully',
      data: document
    });

  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete document
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.query;

    const document = await OfficeDocs.findById(id);

    if (!document || document.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // No authentication required - admin can delete all documents

    if (permanent === 'true') {
      // Permanent deletion
      if (document.uploadType === 'file' && document.filePath) {
        try {
          fs.unlinkSync(document.filePath);
        } catch (fileError) {
          console.error('Error deleting file:', fileError);
        }
      }
      await OfficeDocs.findByIdAndDelete(id);
    } else {
      // Soft deletion
      document.status = 'deleted';
      await document.save();
    }

    res.status(200).json({
      success: true,
      message: `Document ${permanent === 'true' ? 'permanently deleted' : 'moved to trash'} successfully`
    });

  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Download document
const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await OfficeDocs.findById(id);

    if (!document || document.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    if (document.uploadType !== 'file') {
      return res.status(400).json({
        success: false,
        message: 'This document is a link, not a downloadable file'
      });
    }

    // No authentication required - admin can download all documents

    const filePath = path.resolve(document.filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Increment download count
    await document.incrementDownload();

    // Use original filename if available, otherwise extract from stored filename
    let originalFileName = document.originalFileName || document.fileName;
    if (!document.originalFileName && document.fileName && document.fileName.startsWith('doc-')) {
      // Fallback: Remove 'doc-' prefix and timestamp to get original filename
      const parts = document.fileName.split('-');
      if (parts.length >= 3) {
        originalFileName = parts.slice(2).join('-');
      }
    }

    // Set appropriate headers with original filename
    res.setHeader('Content-Disposition', `attachment; filename="${originalFileName}"`);
    res.setHeader('Content-Type', document.mimeType || 'application/octet-stream');

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get document statistics
const getDocumentStats = async (req, res) => {
  try {
    // No authentication required - show all documents stats for admin
    const baseQuery = {}; // Show all documents

    const stats = await Promise.all([
      OfficeDocs.countDocuments({ ...baseQuery, status: 'active' }),
      OfficeDocs.countDocuments({ ...baseQuery, status: 'active', uploadType: 'file' }),
      OfficeDocs.countDocuments({ ...baseQuery, status: 'active', uploadType: 'link' }),
      OfficeDocs.countDocuments({ ...baseQuery, status: 'archived' }),
      OfficeDocs.aggregate([
        { $match: { ...baseQuery, status: 'active' } },
        { $group: { _id: '$documentType', count: { $sum: 1 } } }
      ]),
      OfficeDocs.aggregate([
        { $match: { ...baseQuery, status: 'active', uploadType: 'file' } },
        { $group: { _id: null, totalSize: { $sum: '$fileSize' } } }
      ])
    ]);

    const [totalDocs, fileDocs, linkDocs, archivedDocs, typeStats, sizeStats] = stats;

    res.status(200).json({
      success: true,
      data: {
        totalDocuments: totalDocs,
        fileDocuments: fileDocs,
        linkDocuments: linkDocs,
        archivedDocuments: archivedDocs,
        totalStorageUsed: sizeStats[0]?.totalSize || 0,
        documentsByType: typeStats,
        storageUsedMB: Math.round((sizeStats[0]?.totalSize || 0) / (1024 * 1024))
      }
    });

  } catch (error) {
    console.error('Error fetching document stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Manage access permissions
const manageAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, permission, action } = req.body; // action: 'add' or 'remove'

    const document = await OfficeDocs.findById(id);

    if (!document || document.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // No authentication required - admin can manage all access permissions

    if (action === 'add') {
      // Remove existing permission for this user if exists
      document.accessPermissions = document.accessPermissions.filter(
        perm => perm.userId.toString() !== userId
      );
      
      // Add new permission
      document.accessPermissions.push({ userId, permission });
    } else if (action === 'remove') {
      document.accessPermissions = document.accessPermissions.filter(
        perm => perm.userId.toString() !== userId
      );
    }

    await document.save();

    res.status(200).json({
      success: true,
      message: 'Access permissions updated successfully',
      data: document
    });

  } catch (error) {
    console.error('Error managing access:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  uploadDocument,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  downloadDocument,
  getDocumentStats,
  manageAccess
};
