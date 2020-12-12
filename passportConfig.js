const User = require('./user')
const bcrypt = require('bcryptjs')
const localStrategy = require('passport-local').Strategy

module.exports = function(passport) {
  // we are getting a param passed when we call it, going to be the passport library to use the same instance of passport throughout entire app
  passport.use(
    // defining local strategy for passport everytime we use local strategy its going to run the local strategy we are going to define
    new localStrategy((username, password, done) => {
      // username and password are from our req.body
      // done is callback function that works like .then()
      User.findOne({username: username}, (err, user) => {
        if (err) throw err
        // if no user return null and no user
        if (!user) return done(null, false)
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) throw err
          if (result === true) {
            return done(null, user)
          } else {
            return done(null, false)
          }
        })
      })
    })
  )


  // passport requires serialize and deserialize User
  // serialize stores cookie inside browser
  // take user from local strategy we created and create cookie with the user id

  passport.serializeUser((user, cb) => {
    cb(null, user.id)
  })

  // deserialize takes the cookie and unravels it and returns a user from it
  // find user from database that matches cookie id
  passport.deserializeUser((id, cb) => {
    User.findOne({ _id: id}, (err, user) => {
      const userInfo = {
        username: user.username
      }
      cb(err, userInfo)
    })
  })
}

//https://www.youtube.com/watch?v=IUw_TgRhTBE