const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const requireCredits = require('../middlewares/requireCredits');
const Mailer = require('../services/Mailer');
const surveyTemplate = require('../services/emailTemplates/surveyTemplate');

const Survey = mongoose.model('surveys');

module.exports = app => {
    app.get('/api/surveys/thanks', (req, res) => {
        res.send('Thank you for your feedback!');
    });

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