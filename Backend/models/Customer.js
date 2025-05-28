const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  
  customer_email: {
    type: String,
    required: true,
  },
  customer_name: {
    type: String,
    
  },
  template_name: {
    type: String,
    
  },
  status: {
    type: String,
    
  },
  uploadedby: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  isEmailOpened: {
  type: Boolean,
  default: false
}

});


const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);

module.exports = Customer;
