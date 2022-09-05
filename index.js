const express = require('express')
const mongoose = require('mongoose')
const authRoutes = require('./routes/authRoutes')
const keys = require('./config/keys')

require('./models/User')
require('./services/passport')

mongoose.connect(keys.mongoURI).then(() => console.log('success')).catch(e => console.log(e))

const app = express()

authRoutes(app)

const PORT = process.env.PORT || 5005
app.listen(PORT)
