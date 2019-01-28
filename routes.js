'use strict'

const express = require('express')
const Question = require('./models').Question

const router = express.Router()

router.param('qID', (req, res, next, id) => {
  Question.findById(id, (err, doc) => {
    if (err) return next(err)
    if (!doc) {
      err = new Error('Not Found')
      err.status = 404
      return next(err)
    }
    req.question = doc
    return next()
  }) 
})

router.param('aID', (req, res, next, id) => {
  req.answer = req.question.answers.id(id)
  return req.answer ? next() : next(newError('Not Found', 404))
})

// GET /questions
// Return all questions
router.get('/', (req, res, next) => {
  Question
    .find({})
    .sort({createdAt: -1})
    .exec((err, questions) => err ? next(err) : res.json(questions))
})

// POST /questions
// Route for creating a question
router.post('/', (req, res, next) => {
  var question = new Question(req.body)
  question.save((err, question) => {
    if (err) return next(err)
    res.status(201)
    res.json(question)
  })
})

// GET /questions/:qID
// Return all questions
router.get('/:qID', (req, res, next) => res.json(req.question))

// POST /questions/:qID/answers
// Route for creating an answer 
router.post('/:qID/answers', (req, res, next) => {
  req.question.answers.push(req.body)
  req.question.save((err, question) => {
    if (err) return next(err)
    res.status(201)
    res.json(question)
  })
})

// PUT /questions/:qID/answers/:aID
// Edit a specific answer 
router.put('/:qID/answers/:aID', (req, res) => {
  req.answer.update(req.body, (err, result) => err ? next(err) : res.json(result))
})

// POST /questions/:qID/answers/:aID/vote-:dir
// Vote on a specific answer (dir = direction)
router.post('/:qID/answers/:aID/vote-:dir', (req, res, next) => {
  if (req.params.dir.search(/^(up|down)$/) === -1) {
    return next(newError('Not Found', 404))
  } else {
    req.vote = req.params.dir
    return next()
  }
}, (req, res, next) => {
  req.answer.vote(req.vote, (err, question) => err ? next(err) : res.json(question))
})

// DELETE /questions/:qID/answers/:aID
// Delete a specific answer 
router.delete('/:qID/answers/:aID', (req, res) => {
  req.answer.remove(err => {
    req.question.save((err, question) => err ? next(err) : res.json(question))
  })
})

// Error 
function newError(message, status) {
  let error = new Error(message)
  error.status = status
  return error
}

// Exports
module.exports = router
