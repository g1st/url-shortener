const express = require('express');
const mongodb = require('mongodb').MongoClient;

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname + '/'));

app.get('/', (req, res) =>
  res.render('index')
);

app.listen(PORT, () => console.log(`server listening on port ${PORT}`));
