var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var mongo = require('mongodb');
var mongoose = require('mongoose');

var multer  = require('multer');

var routes = require('./routes/index');
var main = require('./routes/main');
var achvmnts = require('./routes/achvmnt');
var psprtConf = require('./routes/psprtFacebook');
var psprtHlpr = require('./helpers/psprtHlpr');
var logout = require('./routes/logout');

var User = require('./models/User');

var psprt = require('passport');

var FacebookStrategy = require('passport-facebook').Strategy;

var FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
var FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;

var app = express();

var db = mongoose.connect('mongodb://localhost:27017/main');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// db engine setup
app.use(function (req, res, next) {
    req.db = db;
    next();
});

app.use(multer({dest:'./uploads/'}).single('image'));

psprt.serializeUser(function (user, done) {
    done(null, user.id);
});

psprt.deserializeUser(function (id, done) {
    User.findOne({'id': id}, function(err, user) {
        done(err, user);
    });
});

psprt.use(new FacebookStrategy({
        clientID: FACEBOOK_APP_ID,
        clientSecret: FACEBOOK_APP_SECRET,
        callbackURL: 'http://localhost:3000/auth/facebook/callback',
        enableProof: false,
        profileFields: ['id', 'displayName', 'picture.type(large)']
    },
    function (accessToken, refreshToken, profile, done) {
        User.findOne({'id': profile.id}, function (err, user) {
            if (user === null) {
                user = new User({
                    'id': profile.id,
                    'displayName': profile.displayName,
                    'picture': profile.photos.pop().value
                });
                user.save(function (err) {
                    if (err) {
                        done(err, null);
                    }
                });
            }
            return done(null, user);
        });
    }
));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
    secret: 'qwedfsv;fmdbpq23vw-r0ag4TQ#GH%REBAR$TQ#%YW^UE&*RKIYmunrht46wu5ejynorvw[ec',
    saveUninitialized: true,
    resave: true
}));
app.use(psprt.initialize());
app.use(psprt.session());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/main',psprtHlpr.ensureAuthenticated, main);

app.use('/auth/facebook', psprtConf);
app.use('/logout',psprtHlpr.ensureAuthenticated, logout);

app.use('/achvmnts',psprtHlpr.ensureAuthenticated, achvmnts);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
