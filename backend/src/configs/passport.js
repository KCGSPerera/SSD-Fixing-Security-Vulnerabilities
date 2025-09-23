import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../api/models/User.model.js';
import vaultService from '../api/services/Vault.service.js';
import bcrypt from 'bcryptjs';

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Google ID
    let existingUser = await User.findOne({ googleId: profile.id });
    
    if (existingUser) {
      return done(null, existingUser);
    }

    // Check if user exists with the same email
    existingUser = await User.findOne({ email: profile.emails[0].value });
    
    if (existingUser) {
      // Link Google account to existing user
      existingUser.googleId = profile.id;
      existingUser.profilePicture = profile.photos[0]?.value;
      existingUser.authProvider = 'google';
      await existingUser.save();
      return done(null, existingUser);
    }

    // Generate userId for Google OAuth user (similar to your existing user creation logic)
    const lastUser = await User.findOne().sort({ _id: -1 });
    let newUserId;
    if (lastUser) {
      const lastUserId = lastUser.userId;
      const lastUserIdNumber = parseInt(lastUserId.substring(4));
      const newUserIdNumber = lastUserIdNumber + 1;
      newUserId = "USER" + newUserIdNumber;
    } else {
      newUserId = "USER1000000001";
    }

    // Create new user
    const newUser = new User({
      userId: newUserId,
      googleId: profile.id,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      email: profile.emails[0].value,
      profilePicture: profile.photos[0]?.value,
      authProvider: 'google',
      // Note: password and dateOfBirth are not required for Google users
    });

    const savedUser = await newUser.save();

    // Create a vault for the new user
    const salt = await bcrypt.genSalt(64);
    const vaultObj = {
      userId: savedUser._id,
      vault: "",
      salt: salt,
    };
    await vaultService.createVault(vaultObj);

    done(null, savedUser);
  } catch (error) {
    done(error, null);
  }
}));

export default passport;