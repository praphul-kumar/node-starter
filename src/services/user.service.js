const User = require('../models/user.model');

exports.findOne = async (filter = {}, projection = {}, options = {}) => {
  return await User.findOne(filter, projection, options)
}

exports.findById = async (id, withCredentials = false) => {
  let select = "-password -refreshToken";
  if (withCredentials) {
    select = "";
  }

  return await User.findById(id).select(select);
}

exports.findByIdAndUpdate = async (id, update, options = {}) => {
  return await User.findByIdAndUpdate(id, update, options);
}

exports.create = async (data) => {
  return await User.create(data);
}