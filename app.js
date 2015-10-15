var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compress = require('compression');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compress());


//allow using of src folder when in dev mode
if (process.env.NODE_ENV === 'development') {
    console.log('environment is development');
    app.use(express.static(path.join(__dirname, 'src')));
    app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
} else {
    console.log('environment is production');
}

app.use(express.static(path.join(__dirname, 'public')));


//index
app.get('/', function(req, res) {
  res.render('index', {
    'title': '' ,
    'env': process.env.NODE_ENV,
    'ga-account': process.env.GA_ACCOUNT || null
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    var stackTrace = process.env.NODE_ENV === 'development' ? err : {};

    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: stackTrace
    });
});


module.exports = app;
