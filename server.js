'use strict';

// Bring in npm libraries
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

// Bring in dotenv package to let us talk to our .env file
require('dotenv').config();

// Grab port number from .env file
const PORT = process.env.PORT || 3000;

// Get an instance of express as our app
const app = express();

// Enable Cors
app.use(cors());

// Initialize
app.listen(PORT, () => console.log('Server is running on port ', PORT));

//  Location
app.get('/location', (request, response) => {
  let data = require('./data/location.json');
  let actualData = new Location(data[0], request.query.city);
  response.status(200).json(actualData);
});

function Location(obj, city) {
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
  this.search_query = city;
}

// Weather
app.get('/weather', (request, response) => {
  let weatherData = require('./data/weather.json');
  let weekPrediction = weatherData.data.map((day) => {
    return new Forecast(day);
  });
  response.status(200).json(weekPrediction);
});

function Forecast(obj) {
  this.forecast = obj.weather.description;
  this.time = new Date(obj.datetime).toDateString();
}

app.use('*', (request, response) => {
  let errorMsg = {
    status: 500,
    responseText: 'Sorry, something went wrong',
  };
  response.status(500).json(errorMsg);
});

// app.use((error, request, response, next) => {
//   console.log(error);
//   let errorMsg = {
//     status: 500,
//     responseText: 'Sorry, something went wrong'
//   };
//   response.status(500).json(errorMsg);
// });
