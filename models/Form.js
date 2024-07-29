const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  phoneNumber: String,
  email: String,
  message: String
});

module.exports = mongoose.model('Form', formSchema);