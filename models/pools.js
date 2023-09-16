const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const PoolScema = new Schema({
    score: String,
    time: {type: String, default:""},
    time2:  {type: String, default:""},
    fullname: String,
    abbreviation: String,
    date: String,
    picture: String,
    score2: String,
    picture2: String,
    week: {type: String, default: "REG1"},
    year: {type: String, default: "2022"},
    fullname2: String,
    abbreviation2: String,
  });
  
  const Pool = mongoose.model('pool', PoolScema);

  module.exports = Pool;