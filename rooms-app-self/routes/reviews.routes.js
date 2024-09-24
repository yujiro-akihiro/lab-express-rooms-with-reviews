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
      // After saving the review, find the room and add the review ID to the room's reviews array
      return Room.findById(req.params.roomId);
    })
    .then(room => {
      room.reviews.push(newReview._id); // Push the new review ID into the room's reviews array
      return room.save(); // Save the updated room
    })
    .then(() => res.redirect(`/rooms/${req.params.roomId}`)) // Redirect back to the room's page
    .catch(err => {
      console.error(err); // Log the error to the console
      res.status(500).send('Error posting the review'); // Handle the error and notify the user
    });
});

// Delete a review
router.post('/rooms/:roomId/reviews/:reviewId/delete', ensureAuthenticated, (req, res) => {
  Review.findByIdAndDelete(req.params.reviewId)
    .then(() => {
      res.redirect(`/rooms/${req.params.roomId}`); // Review deletion successful, redirect to the room page
    })
    .catch(err => {
      console.error(err); // Log any error to the console
      res.status(500).send('Error deleting the review'); // Send a 500 status if an error occurs
    });
});

// Edit review form
router.get('/rooms/:roomId/reviews/:reviewId/edit', ensureAuthenticated, (req, res) => {
  Review.findById(req.params.reviewId)
    .then(review => {
      if (!review.user.equals(req.user._id)) return res.redirect(`/rooms/${req.params.roomId}`); // Ensure the user owns the review
      res.render('reviews/edit', { review, roomId: req.params.roomId });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error fetching review for edit');
    });
});

// Update review
router.post('/rooms/:roomId/reviews/:reviewId/edit', ensureAuthenticated, (req, res) => {
  Review.findById(req.params.reviewId)
    .then(review => {
      if (!review.user.equals(req.user._id)) return res.redirect(`/rooms/${req.params.roomId}`);
      review.comment = req.body.comment;
      return review.save();
    })
    .then(() => res.redirect(`/rooms/${req.params.roomId}`))
    .catch(err => {
      console.error(err);
      res.status(500).send('Error updating review');
    });
});

module.exports = router;
