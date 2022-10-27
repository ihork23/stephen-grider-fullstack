const { Path } = require('path-parser')
const { URL } = require('url')
const uniqBy = require('lodash/uniqBy')
const mongoose = require('mongoose')
const requireLogin = require('../middlewares/requireLogin')
const requireCredits = require('../middlewares/requireCredits')
const Mailer = require('../services/Mailer')
const surveyTemplate = require('../services/emailTemplates/surveyTemplates')

const Survey = mongoose.model('surveys')

module.exports = app => {
  app.get('/api/surveys/:surveyId/:choice', (req, res) => res.send('Thanks for voting!'))

  app.post('/api/surveys/webhooks', (req, res) => {
    const p = new Path('/api/surveys/:surveyId/:choice')
    console.log('webhook')
    const events = req.body
      .map(({ url, email }) => {
        const match = p.test(new URL(url).pathname)

        if (match) {
          return {email, surveyId: match.surveyId, choice: match.choice}
        }
      })
      .filter(item => item !== undefined)
    const uniqueEvents = uniqBy(events, 'email', 'surveyId')

    uniqueEvents.forEach(({ surveyId, email, choice }) => {
      Survey.updateOne({
        _id: surveyId,
        recipients: {
          $elemMatch: {email: email, responded: false}
        }
      }, {
        $inc: { [choice]: 1 },
        $set: { 'recipients.$.responded': true },
        lastResponded: new Date()
      }).exec()
    })

    res.send({})
  })
  
  app.post('/api/surveys', requireLogin, requireCredits, async (req, res) => {
    const {title, body, subject, recipients} = req.body

    const survey = new Survey({
      title,
      subject,
      body,
      recipients: recipients.split(',').map(email => ({email: email.trim(), responded: false})),
      _user: req.user.id,
      dateSent: Date.now()
    })

    const mailer = new Mailer(survey, surveyTemplate(survey))

    try {
      await mailer.send()
      await survey.save()
      req.user.credits -= 1
      const user = await req.user.save()

      res.send(user)
    } catch (error) {
      res.status(422).send(error)
    }
  })
}