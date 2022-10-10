const mongoose = require('mongoose')
const {Schema} = mongoose

const recipientSchema = new Schema({
  email: String,
  responded: {type: Boolean, defaut: false}
})

module.exports = recipientSchema