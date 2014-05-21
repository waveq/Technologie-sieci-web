var express = require("express");
var app = express();

var httpServer = require("http").createServer(app);

var socketio = require("socket.io");
var io = socketio.listen(httpServer);

// REDIS
var redis = require("redis"),
    client = redis.createClient();

// PASSPORT
var connect = require('connect');
var sessionSecret = 'wielkiSekret44';
var sessionKey = 'connect.sid';

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var passportSocketIo = require('passport.socketio');
var sessionStore = new connect.session.MemoryStore();

// Konfiguracja passport.js
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

passport.use(new LocalStrategy(
    function (username, password, done) {
        if ((username === 'admin') && (password === 'tajne')) {
            console.log("Udane logowanie...");
            return done(null, {
                username: username,
                password: password
            });
        } else {
            return done(null, false);
        }
    }
));

app.use(express.cookieParser());
app.use(express.urlencoded());
app.use(express.session({
    store: sessionStore,
    key: sessionKey,
    secret: sessionSecret
}));
app.use(passport.initialize());
app.use(passport.session());

var loggedIn = false;

app.use(express.static("public"));
app.use(express.static("bower_components"));


// SOCKET
io.sockets.on('connection', function (socket) {
});

// STRONA LOGOWANIA
app.get('/login', function (req, res) {
	var loginPage = "public/login.html";
	res.sendfile(loginPage, {root: __dirname })
});

// LOGOWANIE
app.post('/login',
    passport.authenticate('local', {
        failureRedirect: '/login'
    }),
    function (req, res) {
    	redisSet();
    	loggedIn = true;
        res.redirect('/');
    }
);

// WYLOGOWYWANIE
app.get('/logout', function (req, res) {
    console.log('Wylogowanie...')
    req.logout();
    loggedIn = false;
    res.redirect('/');
});

// SPRAWDZ CZY USER ZALOGOWANY
app.get('/loggedIn', function (req, res) {
	redisGet();
    res.json({ user: loggedIn })

});

// FUNKCJA USTAWIAJACA WARTOSC DO BAZY REDISA
var redisSet = function () {
    client.set("mój klucz", "Ahoj przygodo!", function (err, reply) {
        console.log("REPLY SET: "+reply.toString());
    });
}
// FUNKCJA POBIERAJACA WARTOSC Z BAZY REDISA
var redisGet = function () {
    client.get("mój klucz", function (err, reply) {
        if (reply) {
	        console.log("REPLY GET: "+reply.toString());
	     
	    } else {
        	console.log('no reply');
      
        }
    });
};

client.on("error", function (err) {
    console.log("Error " + err);
});

httpServer.listen(3000, function () {
    console.log('Serwer HTTP działa na pocie 3000');
});
