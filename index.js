const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cookieSession = require('cookie-session')
const passport = require('passport')
const authRoutes = require('./routes/authRoutes')
const billingRoutes = require('./routes/billingRoutes')
const keys = require('./config/keys')

require('./models/User')
require('./services/passport')

mongoose.connect(keys.mongoURI).then(() => console.log('success')).catch(e => console.log(e))

const app = express()

app.use(bodyParser.json())
app.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: [keys.cookieKey]
  })
)
app.use(passport.initialize())
app.use(passport.session())

authRoutes(app)
billingRoutes(app)

const PORT = process.env.PORT || 5005
app.listen(PORT)
