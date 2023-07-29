const mongoose = require("mongoose");

const audioSchema = new mongoose.Schema({
    audioUrl: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },{collection:'audios'});
  
  module.exports = mongoose.model('audio', audioSchema);