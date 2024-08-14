require('dotenv').config();
const connectDB = require('./database');
const app = require('./app');


connectDB()
  .then(() => {
    const PORT = process.env.PORT || 8000;

    app.listen(PORT, () => {
      console.log(`Server is listening on Port: ${PORT}`);
    })
  }).catch((err) => {
    console.log('MongoDB connection Failed!!!', err);
  });