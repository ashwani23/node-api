var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: [true, 'Email is mandatory']
  },
  password: String
});

UserSchema.statics.findByEmail = function (email, cbFunction) {
  return this.find({ email: email }, cbFunction);
}

module.exports = mongoose.model('User', UserSchema);