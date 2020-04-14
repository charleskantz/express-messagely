/** User class for message.ly */
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require('../config');
const moment = require("moment-timezone");
const db = require('../db')
const ExpressError = ("../expressError")


/** User of the site. */
class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */
  static async register( {username, password, first_name, last_name, phone} ) {
    const hashedPassword = await bcrypt.hash(
      password, BCRYPT_WORK_FACTOR);

    let join_at = moment().format();
    let last_login = moment.tz().format();

    const results = await db.query(
      `INSERT INTO users (
        username,
        password,
        first_name,
        last_name,
        phone,
        join_at,
        last_login_at
        )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone, join_at, last_login]
    );
    return results.rows[0];
  }

  /** Authenticate: is this username/password valid? Returns boolean. */
  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT password
      FROM users
      WHERE username = $1`,
      [username]
    );
    const user = result.rows[0];
    if (user) {
      return await bcrypt.compare(password, user.password) === true;
      
    } else {
      return false;
    }
  }

  /** Update last_login_at for user */
  static async updateLoginTimestamp(username) {
    const last_login = moment.tz().format();
    await db.query(
      `UPDATE users
       SET last_login_at = $2
       WHERE username = $1
      `,
      [username, last_login]
    );
  }


  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */
  static async all() {
    const result = await db.query(
    `SELECT 
      username, 
      first_name, 
      last_name, 
      phone
    FROM users`
    );
    if (result.rows.length > 0) {
      return result.rows;
    } else {
      throw new ExpressError('no users found', 404)
    }
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
    `SELECT 
      username, 
      first_name,  
      last_name,
      phone, 
      join_at, 
      last_login_at
    FROM users
    WHERE username = $1`, [username]
    );
    if (result.rows.length > 0) {
      return result.rows[0];
    } else {
      throw new ExpressError(`${username} does not exist`, 404)
    }
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { 
    const result = await db.query(
      `SELECT 
        messages.id,
        messages.to_username, 
        messages.body,
        messages.sent_at,
        messages.read_at,
        users.first_name, 
        users.last_name, 
        users.phone
      FROM messages
      JOIN users
      ON messages.to_username = users.username
      WHERE messages.from_username = $1`, [username]
    );

    /*{messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}*/

    let response = {};
    response.messages = [];
    for(let message of result.rows){
      response.messages.push({id: message.id,
                              body: message.body,
                              sent_at: message.sent_at,
                              read_at: message.read_at,
                              from_user: {username: message.username, 
                                          first_name: message.first_name, 
                                          last_name: message.last_name, 
                                          phone: message.phone}});
    }
    return response;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) { }
}

module.exports = User;