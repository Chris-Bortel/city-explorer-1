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

app.get('/', (request, response) => {
  response.json('Hello World again. Initial route');
});



///////////  Location  ////////////////
app.get('/location', (request, response) => {
  const API = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${request.query.city}&format=json`;

  superagent
    .get(API)
    .then((data) => {
      let location = new Location(data.body[0], request.query.city);
      response.status(200).json(location);
    })
    .catch(() => {
      response.status(500).json('Something went wrong in Location Route');
    });
});

function Location(obj, city) {
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
  this.search_query = city;
}



//////////   Weather   ///////////////
app.get('/weather', (request, response) => {
  const API = `https://api.weatherbit.io/v2.0/forecast/daily?&lat=${request.query.latitude}&lon=${request.query.longitude}&key=${process.env.WEATHER_API_KEY}`;

  superagent
    .get(API)
    .then((data) => {
      let weatherDataArr = JSON.parse(data.text).data;
      let weatherForcast = weatherDataArr.map((day) => new Forecast(day));
      response.status(200).json(weatherForcast);
    })
    .catch(() => {
      response.status(500).json('Something went wrong in Weather Route');
    });
});

function Forecast(obj) {
  this.forecast = obj.weather.description;
  this.time = new Date(obj.datetime).toDateString();
}



//////////   Trails   ////////////////
app.get('/trails', (request, response) => {
  const API = `https://www.hikingproject.com/data/get-trails?lat=${request.query.latitude}&lon=${request.query.longitude}&key=${process.env.TRAIL_API_KEY}`;

  superagent
    .get(API)
    .then((data) => {
      let trailsDataArr = JSON.parse(data.text).trails;
      let trailsRefactored = trailsDataArr.map(trail => new Trails(trail));
      response.status(200).json(trailsRefactored);
    })
    .catch(() => {
      response.status(500).json('Something wrong with Trails Route');
    });
});

function Trails(obj) {
  this.name = obj.name;
  this.location = obj.location;
  this.length = obj.length;
  this.stars = obj.stars;
  this.star_votes = obj.starVotes;
  this.summary = obj.summary;
  this.trail_url = obj.url;
  this.conditions = obj.conditionDetails;
  this.condition_date = obj.conditionDate.slice(0, obj.conditionDate.indexOf(' '));
  this.condition_time = obj.conditionDate.slice(obj.conditionDate.indexOf(' '));
}


app.use('*', (request, response) => {
  let errorMsg = {
    status: 500,
    responseText: 'Sorry, something went wrong',
  };
  response.status(500).json(errorMsg);
});
