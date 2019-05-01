var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var bodyParser = require('body-parser');
var withAuth = require('./middleware');

router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());

var User = require('../user/User');

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../config');

router.post('/register', (req, res) => {

    var hashedPassword = bcrypt.hashSync(req.body.password, 8);

    User.findByEmail(req.body.email).exec((err, users) => {
        if (users.length > 0) {
            return res.status(406).send({
                status: false,
                message: "Email has already been taken"
            });
        } else {
            User.create({
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword
            }, 
            (err, user) => {
                if (err) {
                    return res.status(500).send('There was a problem while registering a new user');
                }
        
                return res.status(200).send({
                    auth : true,
                    message: 'Congratulations! User is registered successfully.'
                });
            });
        }
    });
});

router.post('/login', (req, res) => {

    User.findOne({
        email: req.body.email
    }, 
    (err, user) => {
        var token = null;

        if (err) {
            return res.status(500).send({message:'There was problem while trying to login'});
        }

        if (user) {
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if (!result) {
                    return res.status(401).send({message:'Password is incorrect'});
                } else {
                    token = jwt.sign({id: user._id}, config.secret, {
                        expiresIn: '1h'
                    });
                    return res.cookie('token', token, { httpOnly: true }).status(200).send({
                        auth : true,
                        token: token,
                        message: "Congratulations, Login Successful!"
                    });
                }
            })
        } else {
            return res.status(401).send({message:'User is not registered'});
        }

    });
});

router.get('/me', withAuth, (request, response) => {
    var token = request.headers['x-access-token'];

    if (!token) {
        return response.status(401).send({
            auth: false,
            message: 'No token was provided'
        })
    } else {
        jwt.verify(token, config.secret, (err, decodedToken) => {
            if (err) {
                return response.status(500).send({
                    auth: false,
                    message: 'Authentication Failure'
                });
            } else {
                var user = User.findOne({ "_id" : mongoose.Types.ObjectId(decodedToken.id)}).lean().exec(function (err, user) {
                    return response.status(200).send(JSON.stringify(user));
                });
            }
        })
    }
});


router.get('/checkToken', withAuth, function(req, res) {
    res.sendStatus(200);
});

module.exports = router;