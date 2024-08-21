const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const errorHandler = require('./middlewares/errorHandler.middleware');

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

// Router Import
const userRouter = require('./routes/user.routes');


// Routes Declaration
app.use('/api/v1/users', userRouter);



// Using Error Handler middleware for centralized error handling
app.use(errorHandler);

module.exports = app;
