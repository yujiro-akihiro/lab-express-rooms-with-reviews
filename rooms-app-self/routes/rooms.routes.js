const express = require('express');
const router = express.Router();
const Room = require('../models/Room.model');
const Review = require('../models/Review.model');
const { ensureAuthenticated } = require('../config/auth');

// Create a new room form
router.get('/rooms/new', ensureAuthenticated, (req, res) => {
  res.render('rooms/new'); // Display the form to create a new room
});

// List all rooms
router.get('/rooms', (req, res) => {
  Room.find().populate('owner')
    .then(rooms => res.render('rooms/index', { rooms }))
    .catch(err => {
      console.error(err);
      res.status(500).send('Error fetching rooms');
    });
});

// Show details of a room (with reviews)
router.get('/rooms/:id', (req, res) => {
  Room.findById(req.params.id)
    .populate('owner')
    .populate({
      path: 'reviews',
      populate: { path: 'user', select: 'fullName' }  // Populate the 'user' field within each review
    })
    .then(room => {
      if (!room) return res.status(404).send('Room not found');
      res.render('rooms/show', { room, user: req.user });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error fetching room details');
    });
});

// Create a new room
router.post('/rooms', ensureAuthenticated, (req, res) => {
  const { name, description, imageUrl } = req.body;
  const newRoom = new Room({
    name,
    description,
    imageUrl,
    owner: req.user._id
  });
  newRoom.save()
    .then(() => res.redirect('/rooms'))
    .catch(err => {
      console.error(err);
      res.status(500).send('Error creating room');
    });
});

// Edit room form
router.get('/rooms/:id/edit', ensureAuthenticated, (req, res) => {
  Room.findById(req.params.id)
    .then(room => {
      if (!room.owner.equals(req.user._id)) return res.redirect('/rooms');
      res.render('rooms/edit', { room });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error fetching room for edit');
    });
});

// Update a room
router.post('/rooms/:id', ensureAuthenticated, (req, res) => {
  Room.findByIdAndUpdate(req.params.id, req.body)
    .then(() => res.redirect('/rooms'))
    .catch(err => {
      console.error(err);
      res.status(500).send('Error updating room');
    });
});

// Delete a room
router.post('/rooms/:id/delete', ensureAuthenticated, (req, res) => {
  Room.findById(req.params.id)
    .then(room => {
      if (!room.owner.equals(req.user._id)) return res.redirect('/rooms');
      return room.remove();
    })
    .then(() => res.redirect('/rooms'))
    .catch(err => {
      console.error(err);
      res.status(500).send('Error deleting room');
    });
});

// Add a review to a room
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
      room.reviews.push(newReview._id); // Add review to the room
      return room.save();
    })
    .then(() => res.redirect(`/rooms/${req.params.roomId}`))
    .catch(err => {
      console.error(err);
      res.status(500).send('Error posting the review');
    });
});

// Edit review form
router.get('/rooms/:roomId/reviews/:reviewId/edit', ensureAuthenticated, (req, res) => {
  Review.findById(req.params.reviewId)
    .then(review => {
      if (!review.user.equals(req.user._id)) {
        return res.redirect(`/rooms/${req.params.roomId}`);
      }
      res.render('reviews/edit', { review, roomId: req.params.roomId });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error fetching the review');
    });
});

// Update a review
router.post('/rooms/:roomId/reviews/:reviewId/edit', ensureAuthenticated, (req, res) => {
  const { comment } = req.body;

  Review.findById(req.params.reviewId)
    .then(review => {
      if (!review.user.equals(req.user._id)) {
        return res.redirect(`/rooms/${req.params.roomId}`);
      }
      review.comment = comment;
      return review.save();
    })
    .then(() => res.redirect(`/rooms/${req.params.roomId}`))
    .catch(err => {
      console.error(err);
      res.status(500).send('Error updating the review');
    });
});

// Delete a review
router.post('/rooms/:roomId/reviews/:reviewId/delete', ensureAuthenticated, (req, res) => {
  Review.findByIdAndDelete(req.params.reviewId)
    .then(() => {
      res.redirect(`/rooms/${req.params.roomId}`);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error deleting the review');
    });
});

module.exports = router;
