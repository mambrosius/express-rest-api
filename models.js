'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const sortAnswers = (a, b) => {
  // negative -> a before b
  // zero     -> no change 
  // positive -> b before a

  const voteDiff = b.votes - a.votes 
  return voteDiff === 0 ? b.updatedAt - a.updatedAt : voteDiff
}

const AnswerSchema = new Schema({
  text: String,
  createdAt: {type: Date, default: Date.now},
  updatedAt: {type: Date, default: Date.now},
  votes: {type: Number, default: 0}
})

AnswerSchema.method('update', function(updates, callback) {
  Object.assign(this, updates, {updatedAt: new Date()})
  this.parent().save(callback)
})

AnswerSchema.method('vote', function(vote, callback) {
  this.votes += vote === 'up' ? 1 : -1
  this.parent().save(callback)
})

const QuestionSchema = new Schema({
  text: String,
  createdAt: {type: Date, default: Date.now},
  answers: [AnswerSchema]
})

QuestionSchema.pre('save', function(next) {
  this.answers.sort(sortAnswers)
  next()
})

const Question = mongoose.model('Question', QuestionSchema)

module.exports.Question = Question
