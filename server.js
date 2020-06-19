'use strict';

// import dotenv, express, cors
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Anything from .env file shows up here
const PORT = process.env.PORT;

// Get an instance of express as our app
const app = express();

app.use(cors());

app.get('/location', (request, response) => {
  let data = require('./data/location.json');
  let actualData = new Location(data[0]);
  response.status(200).json(actualData);
});




function Location(obj) {
  // this.search_query
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}



app.use('*', (request, response) => {
  response.status(404).send('Huh');
});

app.use((error, request, response, next) => {
  console.log(error);
  response.status(500).send('server is broken');
});

app.listen(PORT, () => console.log('Server is running on port ', PORT));

