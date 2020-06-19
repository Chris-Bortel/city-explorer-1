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

});




app.use('*', (request, response) => {
  response.status(404).send('Huh')
})