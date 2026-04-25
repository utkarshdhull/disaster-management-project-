const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  need: {
    type: String,
    required: true
  },

  severity: {
    type: Number,
    required: true
  },

  urgency: {
    type: Number,
    default: 1
  },

  priority: {
    type: Number,
    default: 0
  },

  location: {
    lat: Number,
    lng: Number,
    accuracy: Number
  },

  status: {
    type: String,
    default: "pending"
  }
});

module.exports = mongoose.model("Request", requestSchema);
