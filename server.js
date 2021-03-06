const express = require('express');
const mongodb = require('mongodb').MongoClient;
const validUrl = require('valid-url');
const shortid = require('shortid');
const PORT = process.env.PORT || 3000;
const mongoUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/urls';

const app = express();

app.use(express.static(__dirname + '/'));

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
      const query = {
        original_url: {
          $eq: req.params.url
        }
      };

      cursor.find(query).toArray((err, results) => {
          if (err) throw err;

          if (results.length > 0) {
            // url already exists
            cursor.update({original_url: req.params.url}, {$push: {shortened_url: miniUrl}});
            res.send(`{"original_url": "${req.params.url}", "shortened_url": "https://short-url2.herokuapp.com/${miniUrl}"}`);

          } else {
            // need add to db
            cursor.insert({original_url: req.params.url, shortened_url: [miniUrl]});
            res.send(`{"original_url": "${req.params.url}", "shortened_url": "https://short-url2.herokuapp.com/${miniUrl}"}`);
          }
          db.close();
        });

    } else {
      res.send(`{"error": "Incorrect URL format.", "format": "${req.params.url}"}`);
    }
  });
});

app.get('/:url(*)', (req, res) => {
  mongodb.connect(mongoUrl, (err, db) => {
    if (err) throw err;
    const query = {
      shortened_url: {
        $elemMatch: {
          $eq: req.params.url
        }
      }
    };

    const cursor = db.collection('urls');
    cursor.find(query).toArray((err, results) => {
      if (err) throw err;

      if (results.length > 0) {
        res.redirect(results[0].original_url);
      }

      else {
        res.send({error: "No corresponding shortlink found in the database."});
      }
      db.close();
    });
  }
);
});

app.listen(PORT, () => console.log(`server listening on port ${PORT}`));
