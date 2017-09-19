const _ = require('lodash');
const Path = require('path-parser');
const { URL } = require('url');
const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const requireCredits = require('../middlewares/requireCredits');
const Mailer = require('../services/Mailer');
const surveyTemplate = require('../services/emailTemplates/surveyTemplate');

const Survey = mongoose.model('surveys');

module.exports = app => {
    app.get('/api/surveys/:surveyId/:choice', (req, res) => {
        res.send('Thank you for your feedback!');
    });

    app.get('/api/surveys', requireLogin, async (req, res) => {
        const surveys = await Survey.find({ _user: req.user.id })
            .select({ recipients: false });

        res.send(surveys);
    });

    app.post('/api/surveys/webhooks', (req, res) => {
        const p = new Path('/api/surveys/:surveyId/:choice');

        _.chain(req.body)
         .map(req.body, ({ email, url }) => {
            const match = p.test(new URL(url).pathname);
            if (match) {
                return { email, surveyId: match.surveyId, choice: match.choice };
            }
        }).compact()
        .uniqBy('email', 'surveyId')
        .each(({ email, surveyId, choice}) => {
            Survey.updateOne({
                _id: surveyId,
                recipients: {
                    $elemMatch: {
                        email: email, 
                        responded: false
                    }
                }
            }, {
                $inc: { [choice]: 1 },
                $set: { 'recipients.$.responded': true },
                lastResponded: new Date()
            }).exec();
        })
        .value();

        res.send({});
    })

    app.post('/api/surveys', requireLogin, requireCredits, async (req, res) => {
       const {title, subject, body, recipients } = req.body;

       const survey = new Survey ({
        title,
        subject,
        body,
        recipients: recipients.split(',').map(email => ({ email: email.trim() })),
        _user: req.user.id,
        dateSent: Date.now()
       });

       // create a new instance of the mailer object
       const mailer = new Mailer(survey, surveyTemplate(survey));
       try {
            // wait for mailer request to return
            await mailer.send();
            // wait for survey to save to DB
            await survey.save();
            // once both have finished, subtract credits from user
            req.user.credits -= 1;
            // save user and assign to new variable
            const user = await req.user.save();
            // send back user model with updated credits
            res.send(user);
       } catch(err) {
            res.status(422);
       }
       
    });
}