const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route.js');
const multer = require('multer')
const { default: mongoose } = require('mongoose');
const app = express();

app.use(bodyParser.json());
app.use(multer().any())
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect(
    'mongodb+srv://Saswath1403:S%40swath9476@cluster0.fjep0.mongodb.net/group66Database-DB',
    {
      useNewUrlParser: true,
    }
  )
  .then(() => console.log('MongoDb is connected'))
  .catch((err) => console.log(err));

app.use('/', route);

app.all('/**', (req, res) => {
  res.status(404).send({ status: false, message: 'Page Not Found!' });
});

app.listen(process.env.PORT || 3001, function () {
  console.log('Express app running on port ' + (process.env.PORT || 3001));
});
