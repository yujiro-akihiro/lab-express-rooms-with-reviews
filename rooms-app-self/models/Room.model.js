const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
  name: String,
  description: String,
  imageUrl: String,
  owner: { type: Schema.Types.ObjectId, ref: 'User' }
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
