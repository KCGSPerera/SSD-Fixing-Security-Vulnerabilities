import { model, Schema } from "mongoose";

const UserSchema = new Schema(
  {
    id: {
      type: Schema.Types.ObjectId,
    },
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function() {
        return !this.googleId; // Password is required only if not using Google OAuth
      },
    },
    dateOfBirth: {
      type: Date,
      required: function() {
        return !this.googleId; // Date of birth is required only if not using Google OAuth
      },
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows null values to be non-unique
    },
    profilePicture: {
      type: String,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
  },
  { timestamps: true }
);

export default model("User", UserSchema);
