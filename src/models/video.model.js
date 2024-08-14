const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

const videoSchema = new mongoose.Schema({
  videoFile: {
    type: String, // Cloudinary url
    required: true
  },
  thumbnail: {
    type: String, // Cloudinary Url
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

videoSchema.plugin(mongooseAggregatePaginate);

module.exports = mongoose.model('Video', videoSchema);