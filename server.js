const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const formSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String
});

const Form = mongoose.model('Form', formSchema);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: 'aarnavsingh836@gmail.com',
    clientId: '48943514345-v17ndqndiceubaeb51ln45ib9vhjhr95.apps.googleusercontent.com',
    clientSecret: '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',
    refreshToken: '1//04H54HFubVE08CgYIARAAGAQSNwF-L9Irv_nopkkuvnwjeAdardMjnSe55jyeK1B-EtGzb8kwUwXmnGh2W5P1QDzxGkXCEts7Y2A',
    accessToken: process.env.ACCESS_TOKEN
  }
});

app.post('/submit', async (req, res) => {
  const { name, email, message } = req.body;

  const newFormEntry = new Form({ name, email, message });

  try {
    await newFormEntry.save();

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Form Submission Confirmation',
      text: `Thank you for your submission, ${name}! We have received your message: "${message}".`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).send(error.toString());
      }
      res.status(200).send('Form submitted successfully and email sent!');
    });
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});