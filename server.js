const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const formSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  phoneNumber: String,
  email: String,
  department: String,
  message: String
});

const Form = mongoose.model('Form', formSchema);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
    accessToken: process.env.ACCESS_TOKEN
  }
});

app.post('/submit', async (req, res) => {
  const { firstName, lastName, phoneNumber, email, department, message } = req.body;

  const newFormEntry = new Form({ firstName, lastName, phoneNumber, email, department, message });

  try {
    await newFormEntry.save();

    // Confirmation email to the sender
    const confirmationMailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Form Submission Confirmation',
      text: `Thank you for your submission, ${firstName}! We have received your message: "${message}".`
    };

    // Notification email to the assigned email address
    const notificationMailOptions = {
      from: process.env.EMAIL,
      to: process.env.NOTIFICATION_EMAIL,
      subject: 'New Form Submission',
      text: `New form submission received:
      First Name: ${firstName}
      Last Name: ${lastName}
      Phone Number: ${phoneNumber}
      Email: ${email}
      Department: ${department}
      Message: ${message}`
    };

    // Send confirmation email to the sender
    transporter.sendMail(confirmationMailOptions, (error, info) => {
      if (error) {
        return res.status(500).send(error.toString());
      }

      // Send notification email to the assigned email address
      transporter.sendMail(notificationMailOptions, (error, info) => {
        if (error) {
          return res.status(500).send(error.toString());
        }
        res.status(200).send('Form submitted successfully and emails sent!');
      });
    });
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});