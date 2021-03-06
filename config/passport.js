const LocalStrategy = require("passport-local").Strategy; 
const User = require("../model/user");
var bcrypt = require("bcryptjs");

// set module for passport localStrategy
module.exports = function(passport) {
  passport.use(
    new LocalStrategy( 
      function(username, password, done) {
        User.findOne({ username: username }, function(err, user) {
          if (err) {
            return done(err);
          }
          if (!user) {
            return done(null, false, { message: "No user found." });
          }
          // use bcrypt to decrypt
          bcrypt.compare(password, user.password, function(err, isMatch) {
            if (err) {
              return done(err);
            }
            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, { message: "Incorrect password." });
            }
          });
        });
      }
    )
  );

  // session: serializing the user ID, and finding the user by ID when deserializing
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};
