var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var cookieSession = require('cookie-session');
var session = require('express-session');
var flash = require('connect-flash');
var routes = require('./routes/index');
var users = require('./routes/users');
var cases = require('./routes/cases');
var patients = require('./routes/patients');
var search = require('./routes/search');
var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;
var User = require('./model/collections').getCollection('users');
var logger = require('./logger');
var compression = require('compression');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use('/', express.static(__dirname + '/node_modules/'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use(express.cookieParser('keyboard cat'));
app.use(session({
    secret: 'mouse dog',
    cookie: { maxAge: 6000000 },
    resave: true,
    saveUninitialized: true
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

function checkAuth(req, res, next){
    "use strict";
    if (req.user || req.path==='/login') {
        next();
    } else {
        if (req.headers.accept.indexOf("application/json") >= 0){
            res.writeHead(401, {'Content-Type': 'application/json;charset=UTF-8'});
            res.end('请重新登录', 'utf8');
        }
        else{
            res.redirect("/login?" + `redirect=${req.path}`);
        }
    }
}
app.use(checkAuth);
app.use(function(req, res, next){
    "use strict";
    var api_str = "/api";
    if (req.headers.accept.indexOf("application/json") >= 0){
        req.isAjax = true;
        //req.path = req.path.substr(api_str.length);
    }
    next();
});
//app.use(compression);

app.use('/', routes);
app.use('/users', users);
//app.use('/api/users', users);
app.use('/cases', cases);
//app.use('/api/cases', cases);
app.use('/patients', patients);
app.use('/search', search);
//app.use('/api/search', search);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    logger.info("Run in development mode");
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        if (req.isAjax){
            res.end(JSON.stringify({
                message: err.message,
                error: err
            }), 'utf8');
        }
        else {
            res.render('error', {
                message: err.message,
                error: err
            });
        }
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    logger.err(err);
    res.status(err.status || 500);
    if (req.isAjax){
        res.end(JSON.stringify({
            message: err.message,
            error: {}
        }), 'utf8');
    }
    else {
        res.render('error', {
            message: err.message,
            error: {}
        });
    }
});


passport.serializeUser(function(user, done) {
  done(null, user._id.toString());
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
passport.use(new LocalStrategy({
    passReqToCallback : true
},
    function(req, username, password, done) {
        User.findOne({ username: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
              return done(null, false, { message: 'Incorrect username.' });
            }
            if (user.password != password) {
              return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        });
    }
));

module.exports = app;
