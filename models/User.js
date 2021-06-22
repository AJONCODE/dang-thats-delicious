const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Invalid E-mail Address'],
    required: 'Please apply an E-mail address',
  },
  name: {
    type: String,
    trim: true,
    required: 'Please supply a name',
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  hearts: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Store',
    },
  ],
});

// virtual field
userSchema.virtual('gravatar').get(function() {
  const hash = md5(this.email);

  return `https://gravatar.com/avatar/${hash}?s=200`;
});

// will take care of adding password to the schema
userSchema.plugin(passportLocalMongoose, {
  usernameField: 'email',
});

// will handle ugly error messages e.g., duplicate email
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);