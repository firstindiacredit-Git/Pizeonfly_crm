const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clientSchema = new Schema({
  clientName: {
    type: String,
    // required: true,
  },

  businessName: {
    type: String,
    required: true,
  },

  clientImage: { 
    type: String
  },

  clientEmail: {
    type: String,
    required: true,
    unique: true
  },

  clientPassword: { // Ensure this field name matches the request body
    type: String,
    required: true,
  },

  clientPhone: {
    type: String,
    // required: true,
  },

  clientAddress: {
    type: String,
    // required: true,
  },
  
  clientGst: {
    type: String,
    // required: true,
  }
}, {
  timestamps: true
});

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;
