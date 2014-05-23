var express = require("express");
var app = express();
var Q = require('q');
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
passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	done(null, obj);
});

passport.use(new LocalStrategy(
	function(username, password, done) {
		console.log("Wysyłam: " + username + " " + password);

		redisGet(username, password).then(function(result) {
			console.log("THEN");
			console.log(result);

			if (result) {
				console.log("Udane logowanie...");
				return done(null, {
					username: username,
					password: password
				});
			} else {
				console.log("Nieudane logowanie...");
				return done(null, false);
			}

		});
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
io.sockets.on('connection', function(socket) {});

// STRONA LOGOWANIA
app.get('/login', function(req, res) {
	var loginPage = "public/login.html";
	res.sendfile(loginPage, {
		root: __dirname
	})
});

// STRONA REJESTRACJI
app.get('/signup', function(req, res) {
	var signupPage = "public/signup.html";
	res.sendfile(signupPage, {
		root: __dirname
	})
});

// LOGOWANIE
app.post('/login',
	passport.authenticate('local', {
		failureRedirect: '/login'
	}),
	function(req, res) {
		loggedIn = true;
		res.redirect('/');
	}
);
// REJESTRACJA
app.post('/signup', function(req, res) {
	redisSet(req.body.username, req.body.password);
	res.redirect('/');
});

// SPRAWDZ CZY TAKI USERNAME JEST W BAZIE
app.get('/checkIfUserExists/:username', function(req, res) {
 	var username = req.params.username;
 	console.log("username : ");
	console.log(username);

	redisGet(username).then(function(result) {
		res.json({exist: result});

	})

	
});

// WYLOGOWYWANIE
app.get('/logout', function(req, res) {
	console.log('Wylogowanie...')
	req.logout();
	loggedIn = false;
	res.redirect('/');
});

// SPRAWDZ CZY USER ZALOGOWANY
app.get('/loggedIn', function(req, res) {
	var sessionJSON = JSON.parse(sessionStore.sessions[req.sessionID]);
	
	res.json({username: sessionJSON.passport.user.username})
});
// FUNKCJA USTAWIAJACA WARTOSC DO BAZY REDISA
var redisSet = function(username, password) {
		console.log("Dodaje do bazy uzytkownika: " + username + " " + password);
		client.set(username, password, function(err, reply) {
			console.log("REPLY SET: " + reply.toString());
		});
	}
// FUNKCJA POBIERAJACA WARTOSC Z BAZY REDISA
var redisGet = function(username, password) {
	var deferred = Q.defer();
	client.get(username, function(err, reply) {
		if (reply) {
			console.log("REPLY GET: " + reply.toString());
			deferred.resolve(true);
		} else {
			console.log('no reply');
			deferred.resolve(false);
		}
	});
	return deferred.promise;
};

client.on("error", function(err) {
	console.log("Error " + err);
});

httpServer.listen(3000, function() {
	console.log('Serwer HTTP działa na pocie 3000');
});