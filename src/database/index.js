const mongoose = require('mongoose');
const { DB_NAME } = require('../config/constants');

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

    console.log(`MongoDB conected!! DB HOST: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log("MongoDB connection Failed!!", error);
    process.exit(1);
  }
}

module.exports = connectDB;