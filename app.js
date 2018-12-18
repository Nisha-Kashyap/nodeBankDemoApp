var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var userModel = require('./models/users');
var cookieParser = require('cookie-parser');
var path = require('path');
/******************************* */

// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

mongoose.connect('mongodb://localhost/bankingsytem', { useNewUrlParser: true });
var app = express();
var port = process.env.port || 3002;

app.use(cookieParser());
app.set('views', path.join(__dirname, 'public'));
app.set('view engine', 'ejs');

app.use(express.static('public'));

//Routers
var createCustomerRouter = express.Router();
createCustomerRouter.route('/register')
    .get(function (req, res) {
        res.render('registration', { title: 'Registration'} );
    })
    .post(urlencodedParser, function (req, res) {
        console.log("Customer created");

        var newCustomer = new userModel(req.body);
        console.log(req.body);
        newCustomer.save();
        res.redirect('/login');
       // res.send(newCustomer);
    })


var loginRouter = express.Router();
loginRouter.route('/login')
    .get(function (req, res) {
        //console.log('Login successful');
        //res.send('Login successful');
        res.render('login', { title: 'Login' });
    })
    .post(urlencodedParser, function (req, res) {
        /* console.log(response); */

        var email = req.body.emailid;
        var pass = req.body.password;
        var query = userModel.findOne({ 'email': email, 'password': pass });
        query.select('id fullname email password balance');
        query.exec(function (err, user) {
            // if (err) return handleError(err);
            if (err) return err;

            console.log('Email: %s, Password: %s', user.email, user.password);
            res.cookie('logged', user.id);
           // console.log('Cookies: ', req.cookies);
            console.log('logid: ', req.cookies.logged);           
            res.redirect('/member');

        });

    })

var userdata;
var memberRouter = express.Router();
memberRouter.route('/member')
    .get(function (req, res) {
        console.log('member accessed');
        //res.send("member accessed");
        console.log(req.cookies.logged);
        if (req.cookies.logged) {
            var uid = req.cookies.logged;
            //console.log(cid);
            var query = userModel.findOne({ '_id': uid });
            query.select('id fullname email balance');
            query.exec(function (err, user) {
                // if (err) return handleError(err);
                if (err) return err;
                userdata = user;
               //res.send("sdsd");
                console.log("query executed");
                res.render('member', { userdata: user, title: 'member', action: 'WELCOME' });
            });
        } else {
            res.redirect('/login');
        }

        memberRouter.route('/member/withdraw')
            .get(function (req, res, next) {
                res.render('member', { action: 'WITHDRAW', userdata: userdata, title: 'Withdraw' });
            });
        memberRouter.route('/member/deposit')
            .get(function (req, res, next) {
                res.render('member', { action: 'DEPOSIT', userdata: userdata, title: 'Deposit' });
            });
        memberRouter.route('/member/logout')
            .get(function (req, res, next) {
                res.clearCookie("logged");
                res.redirect('/login');
            });
        memberRouter.route('/member/transaction')
            .get(function (req, res, next) {
                res.redirect('/login');
            })
            .post(urlencodedParser, function (req, res, next) {
                var amount = req.body.amount;
                var userid = req.body.userid;
                var action = req.body.action;
                console.log(amount+' '+userid+' '+action);
                //res.send('sds');
                if(action=='DEPOSIT'){
                    var newAmount = (parseInt(amount) + parseInt(userdata.balance)).toString();
                    var deposit = userModel.updateOne(
                    { '_id' : userid },
                    { $set: { 'balance' : newAmount } }
                    );
                    deposit.exec(function (err, result) {
                    if (err) return err;
                      console.log(result);
                    });
                  };
                  //res.send(' deposit works');
                  if(action=='WITHDRAW'){
                    var newAmount = parseInt(userdata.balance) - parseInt(amount);
                    if(newAmount<0){res.redirect('/member'); return;}
                    var withdraw = userModel.updateOne(
                    { '_id' : userid },
                    { $set: { 'balance' : newAmount } }
                    );
                    withdraw.exec(function (err, result) {
                    if (err) return err;
                      console.log(result);
                    });
                  };
                //   res.send(' withdraw works');
                res.redirect('/member');
            })
    })

var listUsers = express.Router();
listUsers.route('/list-users')
    .get(function (req, res) {
        userModel.find(function (err, customers) {
            if (err) {
                // console.log('Something went wrong: '+ err)
                return err;
            }
            else {
                res.json(customers);
            }
        })
        console.log("Got a GET request for /list-users");
        // res.send('Users Listing');
    })

app.use('', loginRouter);
app.use('', listUsers);
app.use('', createCustomerRouter);
app.use('', memberRouter);

app.get('/', function (req, res) {
    res.render('index', {title: 'Bank App'})
    //res.send('Welcome to Node Banking system');
})
app.listen(port, function () {
    console.log('Server running at port: ' + port);
})
