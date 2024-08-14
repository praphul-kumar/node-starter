const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const { EXPRESS_LIMIT } = require('./config/constants');

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: process.env.CORS_ALLOWED_METHODS
}));

app.use(express.json({ limit: EXPRESS_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: EXPRESS_LIMIT }));
app.use(express.static("public"));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


module.exports = app;
