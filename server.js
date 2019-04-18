var app = require('./app');
var port = process.env.PORT || 4000;
var mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

// Connect to DB
mongoose.connect('mongodb://localhost/node-api')
 .then(() => console.log('MongoDB connected…'))
 .catch(err => console.log(err))

var server = app.listen(port, function() {
  console.log('Express server listening on port ' + port);
});

app.use(cookieParser());