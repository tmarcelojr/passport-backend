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

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  // deserialize takes the cookie and unravels it and returns a user from it
  // find user from database that matches cookie id
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      console.log('user!!!!', user)
      // done(err, user)
      // IMPORTANT STEP THAT WE MISSED. WE NEED TO SEND INFO BACK
      const userInfo = {
        username: user.username,
        message: "In here you only want to return the username :)"
      }
      console.log('this is our user', userInfo)
      cb(err, userInfo)
    })
  })
}

//https://www.youtube.com/watch?v=IUw_TgRhTBE