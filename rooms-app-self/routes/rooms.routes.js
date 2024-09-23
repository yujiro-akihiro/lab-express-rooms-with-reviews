const express = require('express');
const router = express.Router();
const Room = require('../models/Room.model');
const { ensureAuthenticated } = require('../config/auth');

// Create a new room form
router.get('/rooms/new', ensureAuthenticated, (req, res) => {
  res.render('rooms/new'); // 部屋作成用のフォームを表示
});

// List all rooms
router.get('/rooms', (req, res) => {
  Room.find().populate('owner')
    .then(rooms => res.render('rooms/index', { rooms }))
    .catch(err => console.error(err));
});

// Show details of a room (with reviews)
router.get('/rooms/:id', (req, res) => {
  Room.findById(req.params.id)
    .populate('owner')
    .populate({
      path: 'reviews',
      populate: { path: 'user' }  // レビューの投稿者も含めてポピュレート
    })
    .then(room => {
      res.render('rooms/show', { room });
    })
    .catch(err => console.error(err));
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
    .catch(err => console.error(err));
});

// Edit room form
router.get('/rooms/:id/edit', ensureAuthenticated, (req, res) => {
  Room.findById(req.params.id)
    .then(room => {
      if (!room.owner.equals(req.user._id)) return res.redirect('/rooms');
      res.render('rooms/edit', { room });
    })
    .catch(err => console.error(err));
});

// Update a room
router.post('/rooms/:id', ensureAuthenticated, (req, res) => {
  Room.findByIdAndUpdate(req.params.id, req.body)
    .then(() => res.redirect('/rooms'))
    .catch(err => console.error(err));
});

// Delete a room
router.post('/rooms/:id/delete', ensureAuthenticated, (req, res) => {
  Room.findById(req.params.id)
    .then(room => {
      if (!room.owner.equals(req.user._id)) return res.redirect('/rooms');
      return room.remove();
    })
    .then(() => res.redirect('/rooms'))
    .catch(err => console.error(err));
});

module.exports = router;
