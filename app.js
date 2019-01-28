'use strict'

const express = require('express')
const routes = require('./routes')

const jsonParser = require('body-parser').json
const logger = require('morgan')

const app = express() 
const port = process.env.PORT || 3000

const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/qa')
const db = mongoose.connection

// Database
db.once('open', () => console.log('db connection successful'))
db.on('error', err => console.log(`connection error: ${err}`))
 
// Middleware 
app.use(jsonParser())
app.use(logger('dev'))

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'PUT, POST, DELETE')
      return res.status(200).json({})
    }
    next()
})

app.use("/questions", routes)

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// Error handler
app.use((err, req, res, nezt) => {
  res.status(err.status || 500)
  res.json({
    error: {
      message: err.message
    }
  })
})

// Port listener 
app.listen(port, () => console.log(`Express server is listening on port ${port}`))
