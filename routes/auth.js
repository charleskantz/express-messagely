const express = require('express');
const User = require("../models/user")
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require('../config')

const router = new express.Router();

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post('/login', async function(req, res, next) {
  try {
    const { username, password } = req.body;
    const result = await User.authenticate(username, password)
    if (result) {
      User.updateLoginTimestamp(username);
      let token = jwt.sign({username}, SECRET_KEY);
      return res.json( {token} )
    }
  } catch (err) {
    return next(err);
  }
})



/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post('/register', async function (req, res, next) {
  try {
    let newUser = await User.register( req.body );

    let token = jwt.sign({newUser}, SECRET_KEY);
    return res.json({ token });
  } catch (err) {
    return next(err);
  }

});

module.exports = router;