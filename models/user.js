/** User class for message.ly */
const bcrypt = require("bcrypt");

const BCRYPT_WORK_FACTOR = 5;


/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */
  static async register( {username, password, first_name, last_name, phone} ) {
    try {
      const hashedPassword = await bcrypt.hash(
        password, BCRYPT_WORK_FACTOR);
  
      const results = await db.query(
        `INSERT INTO users (username, password, first_name, last_name, phone)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING username, password, first_name, last_name, phone`,
        [username, hashedPassword, first_name, last_name, phone]
      );
      return results.rows[0];
    } catch (err) {
      return next(err);
    }
  }

  /** Authenticate: is this username/password valid? Returns boolean. */
  static async authenticate(username, password) {
    try {
      const result = await db.query(
        `SELECT password
        FROM users
        WHERE username = $1`,
        [username]
      );
      const user = result.rows[0]
      if (user) {
        return await bcrypt.compare(password, user.password) === true;
      }
      throw new ExpressError("Invalid user/password", 400);
    } catch (err) {
      return next(err);
    }
  }

  /** Update last_login_at for user */
  static async updateLoginTimestamp(username) {

  }


  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */
  static async all() {

  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) { }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { }

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