const express = require("express");
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const createError = require('http-errors');
const dotenv = require('dotenv');

//var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');
var pagesRouter = require('./routes/pages');

app.set('maxmin/views', path.join(__dirname, 'maxmin/views'));
app.set('view engine', 'ejs');
console.log(path);
app.use(express.static(path.join(__dirname, '../public_maxmin/')));
app.use(express.static('maxmin/views'));

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

dotenv.config({path: './env/.env'})

//app.use('/', indexRouter);
app.use('/maxmin/', loginRouter);
app.use('/maxmin/', pagesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});
  
// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
//app.use('/practicas', practicasRouter);
/*app.get("/", function (req, res) {
    //res.sendFile(__dirname + "/views/login/login.ejs");
    //res.sendFile(__dirname + "/views/pages/captura.html");
    //res.sendFile(__dirname + "/views/pages/index.html");
});*/

app.set('trust proxy', true);
app.listen(3003, function () {
    console.log("Server is running on localhost:3002");
});
