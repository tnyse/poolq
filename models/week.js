const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const WeekScema = new Schema({
    name: {type: String, default: "REG1"},
    year: {type: String, default: "2022"},
    mode: {type: String, default: "PRE"}
  });
  
  const Week = mongoose.model('week', WeekScema);

  module.exports = Week;