const express = require('express');
const mongodb = require('mongodb').MongoClient;
const validUrl = require('valid-url');
const shortid = require('shortid');
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.static(__dirname + '/'));

const mongoUrl = 'mongodb://localhost:27017/urls';

app.get('/', (req, res) =>
  res.render('index')
);

app.get('/new/:url(*)', (req, res) => {
  mongodb.connect(mongoUrl, (err, db) => {
    if (err) throw err;
    console.log("Connected correctly to server");

    if (validUrl.isUri(req.params.url)) {
      const cursor = db.collection('urls');
      const miniUrl = shortid.generate();

      cursor.insertOne({original_url: req.params.url, shortened_url: miniUrl})
      res.send(`${req.params.url} is a valid uri and its miniUrl is ${miniUrl}`)

    } else {
      res.send(`${req.params.url} not a URI`);
    }
    db.close();
  });
});

app.listen(PORT, () => console.log(`server listening on port ${PORT}`));
