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

app.listen(PORT, () => console.log('Server is running on port ', PORT));
