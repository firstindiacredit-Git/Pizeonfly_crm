const mongoose = require('mongoose');

const officeDocsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  documentType: {
    type: String,
    required: true,
    enum: [
      'Contract',
      'Invoice',
      'Report',
      'Presentation',
      'Policy',
      'Manual',
      'Certificate',
      'Legal Document',
      'Financial Document',
      'HR Document',
      'Marketing Material',
      'Technical Document',
      'Other'
    ],
    default: 'Other'
  },
  uploadType: {
    type: String,
    required: true,
    enum: ['file', 'link'],
    default: 'file'
  },
  // For file uploads
  fileName: {
    type: String
  },
  filePath: {
    type: String
  },
  fileSize: {
    type: Number
  },
  mimeType: {
    type: String
  },
  // For link uploads
  documentLink: {
    type: String
  },
  // Common fields
  uploadedBy: {
    type: String,
    default: 'admin' // Simple string for admin uploads, no user reference needed
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  accessPermissions: [{
    userId: {
      type: String // Simple string for user identification
    },
    permission: {
      type: String,
      enum: ['read', 'write', 'admin'],
      default: 'read'
    }
  }],
  downloadCount: {
    type: Number,
    default: 0
  },
  lastAccessed: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for better search performance
officeDocsSchema.index({ title: 'text', description: 'text', tags: 'text' });
officeDocsSchema.index({ documentType: 1 });
officeDocsSchema.index({ uploadedBy: 1 });
officeDocsSchema.index({ createdAt: -1 });

// Virtual for file URL
officeDocsSchema.virtual('fileUrl').get(function() {
  if (this.uploadType === 'file' && this.fileName) {
    return `${process.env.BASE_URL || 'http://localhost:4001'}/office-docs/${this.fileName}`;
  }
  return null;
});

// Method to increment download count
officeDocsSchema.methods.incrementDownload = function() {
  this.downloadCount += 1;
  this.lastAccessed = new Date();
  return this.save();
};

module.exports = mongoose.model('OfficeDocs', officeDocsSchema);
