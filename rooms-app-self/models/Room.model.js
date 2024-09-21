const { Schema, model } = require('mongoose');

const roomSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }]
}, {
    timestamps: true
});

const Room = model('Room', roomSchema);
module.exports = Room;

