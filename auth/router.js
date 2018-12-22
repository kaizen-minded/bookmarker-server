'use strict';
const express = require('express');
const passport = require('passport');

const router = express.Router();

const localAuth = passport.authenticate('local', {session: true});


router.post('/login',localAuth, (req, res) => {
  res.send({success: true, id: req.user._id});
});


module.exports = router;
