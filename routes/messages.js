const express = require('express');
const Message = require("../models/message");
const ExpressError = require('../expressError')
const { ensureLoggedIn } = require('../middleware/auth')

const router = new express.Router();

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id', ensureLoggedIn, async function(req, res, next) {
  try {
    const result = await Message.get(req.params.id)

    if (result.from_user.username === req.user.username || 
      result.to_user.username === req.user.username) {
        return res.json({message: result});
    }
    else {
      throw new ExpressError(`Unauthorized.`, 401)
    }
  }
  catch (err) {
    return next(err)
  }
} )

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/', ensureLoggedIn, async function(req, res, next) {
  try {
    const result = await Message.create({
      from_username: req.user.username,
      to_username: req.body.to_username,
      body: req.body.body
    });
    return res.json({message: result});
  } catch (err) {
    return next(err);
  }
})

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient (to_user) can mark as read.
 *
 **/
router.post('/:id/read', ensureLoggedIn, async function(req, res, next) {
  try {
    const message = await Message.get(req.params.id);
    console.log('message:', message)
    console.log('token user:', req.user.username)
    if (message.to_user.username === req.user.username) {
      const result = await Message.markRead(req.params.id)
      return res.json({message: {
        id: result.id,
        read_at: result.read_at
      }});
    }
    else {
      throw new ExpressError(`Unauthorized.`, 401);
    }
  } catch (err) {
    return next(err);
  }
});


module.exports = router;