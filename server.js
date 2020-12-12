const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const passportLocal = require('passport-local').Strategy;
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const { deserializeUser } = require('passport');
const app = express();
const User = require('./user');


// DB CONNECTION
let mongoURI = "";

if (process.env.NODE_ENV === "production") {
  mongoURI = process.env.DB_URL;
} else {
  mongoURI = "mongodb://localhost/apassport";
}

mongoose.connect(
	mongoURI,
	{
		useNewUrlParser: true,
		useUnifiedTopology: true
	},
	() => {
		console.log('Mongoose is connected');
	}
);

// MIDDLEWARE

// Pass in the actual value of secret
app.use(cookieParser('this will be our secret code'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Need to set up CORS like this for auth to work
app.use(
	cors({
		// origins typically deployed react app and localhost
		origin: ['https://c-passport.herokuapp.com', 'http://localhost:3000'],
		credentials: true
	})
	);

app.use(
	session({
		// We will use secret in our cookie-parser
		secret: 'this will be our secret code',
		resave: false,
		saveUninitialized: true,
		cookie: {
			secure: true
		}
	})
);


app.use(passport.initialize())
app.use(passport.session())
require('./passportConfig')(passport)


// ROUTES
app.post('/login', (req, res, next) => {
  // use local strategy we defined
  passport.authenticate('local', (err, user, info) => {
    if (err) throw err;
    if (!user) res.send('No User Exists')
    else {
      req.login(user, err => {
        if (err) throw err
        res.send('Successfully Authenticated')
				console.log(req.user)
      })
    }
  })(req, res, next)
});

app.post('/register', (req, res, next) => {
	User.findOne({ username: req.body.username }, async (err, doc) => {
		if (err) throw err
		if (doc) res.send('User Already Exists');
		if (!doc) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
			const newUser = new User({
				username: req.body.username,
				password: hashedPassword
			});
			await newUser.save();
			// if successful automatically log in user
			passport.authenticate('local', (err,  user) => {
				req.login(user, err => {
					if (err) throw err
					res.send('User Created and Logged In')
				})
			})(req, res, next)
		}
	});
});

// req.user stores the user
// req object will not be a user object containing session data
// accessible throughout whole app
app.get('/user', (req, res) => {
	console.log('user', req.user)
	res.send(req.user)
});

// Logout
app.get('/logout', (req, res) => {
	req.logOut()
	req.session.destroy(err => {
		res.send('Logged out')
	})
})

app.set("port", process.env.PORT || 4000);

app.listen(app.get("port"), () => {
  console.log(`✅ PORT: ${app.get("port")} 🌟`);
});