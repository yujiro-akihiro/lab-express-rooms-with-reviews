const express = require('express');
const router = express.Router();
const Review = require('../models/Review.model');
const Room = require('../models/Room.model');
const { ensureAuthenticated } = require('../config/auth');

// Post a review for a room
router.post('/rooms/:roomId/reviews', ensureAuthenticated, (req, res) => {
  const { comment } = req.body;
  const newReview = new Review({
    user: req.user._id,
    comment
  });

  newReview.save()
    .then(review => {
      return Room.findById(req.params.roomId);
    })
    .then(room => {
      room.reviews.push(newReview._id);
      return room.save();
    })
    .then(() => res.redirect(`/rooms/${req.params.roomId}`))
    .catch(err => console.error(err));
});

// Delete a review
router.post('/rooms/:roomId/reviews/:reviewId/delete', ensureAuthenticated, (req, res) => {
  Review.findById(req.params.reviewId)
    .then(review => {
      if (!review.user.equals(req.user._id)) return res.redirect(`/rooms/${req.params.roomId}`);
      return review.remove();
    })
    .then(() => res.redirect(`/rooms/${req.params.roomId}`))
    .catch(err => console.error(err));
});

module.exports = router;
