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

		redisGetPass(username, password).then(function(result) {
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
io.sockets.on('connection', function(socket) {
	socket.on('addPlace', function (newPlace) {
		socket.broadcast.emit("addedPlace", newPlace);
	});
	socket.on('addEvent', function (newEvent) {
		socket.broadcast.emit("addedEvent", newEvent);
	});
	socket.on('signUp', function (username) {
		socket.broadcast.emit("signedUp", username);
	});
});



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

// STRONA DODAJ MIEJSCE
app.get('/addplace', function(req, res) {
	var loginPage = "public/addplace.html";
	res.sendfile(loginPage, {
		root: __dirname
	})
});

// STRONA DODAJ WYDARZENIE
app.get('/addevent', function(req, res) {
	var loginPage = "public/addevent.html";
	res.sendfile(loginPage, {
		root: __dirname
	})
});

// STRONA POKAZ MIEJSCA
app.get('/showplaces', function(req, res) {
	var loginPage = "public/showplaces.html";
	res.sendfile(loginPage, {
		root: __dirname
	})
});

// STRONA POKAZ WYDARZENIA
app.get('/showevents', function(req, res) {
	var page = "public/showevents.html";
	res.sendfile(page, {
		root: __dirname
	})
});

// STRONA JEDNEGO WYDARZENIA
app.get('/showevents/:event', function(req, res) {
	var page = "public/event.html";
	res.sendfile(page, {
		root: __dirname
	})
});


// STRONA JEDNEGO MIEJSCA
app.get('/showplaces/:place', function(req, res) {
	var page = "public/place.html";
	res.sendfile(page, {
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
	var passwd = req.body.password[0];
	console.log(passwd);

	redisSetUser(req.body.username, req.body.password[0]);
	res.redirect('/');
});

// DODAWANIE MIEJSCA
app.post('/addPlace', function(req, res) {
	var name = req.body.name;
	var city = req.body.city;
	var street = req.body.street;
	var number = req.body.number;

	redisSetPlace(name, city, street, number);
	res.redirect('/showplaces');
});

// ZAPISZ SIE NA WYDARZENIE
app.get('/signUpEvent/:event', function(req, res) {
	var eventName = req.params.event;
	var sessionJSON = JSON.parse(sessionStore.sessions[req.sessionID]);
	var username = sessionJSON.passport.user.username;
	console.log(eventName);

	redisSignUpUser(username, eventName);
	// redisSetPlace(name, city, street, number);
	res.json({pusto: ""});
});

// POBIERZ USEROW ZAPISANYCH NA WYDARZENIE
app.get('/getSignedUsers/:event', function(req, res) {
	var eventName = req.params.event;
	redisGetUsersFromEvent(eventName).then(function(users) {
		res.json({lista: users});
	});

});

// DODAWANIE WYDARZENIA
app.post('/addEvent', function(req, res) {
	var name = req.body.name;
	var place = req.body.place;
	var date = req.body.date;
	var time = req.body.time;

	redisGetPlacesByIndex("places",place).then(function(place) {
		place = place.toString();

		redisSetEvent(name, place, date, time);
		res.redirect('/showevents');
	});
});

// SPRAWDZ CZY TAKIE WYDARZENIE JEST W BAZIE
app.get('/checkIfEventExists/:name', function(req, res) {
 	var name = req.params.name;
 	console.log(name);
	redisGetPlace(name).then(function(result) {
		res.json({exist: result});
	})
});

// SPRAWDZ CZY TAKIE MIEJSCE JEST W BAZIE
app.get('/checkIfPlaceExists/:name', function(req, res) {
 	var name = req.params.name;
 	console.log(name);
	redisGetPlace(name).then(function(result) {
		res.json({exist: result});
	})
});

// SPRAWDZ CZY TAKI USERNAME JEST W BAZIE
app.get('/checkIfUserExists/:username', function(req, res) {
 	var username = req.params.username;
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




// POBIERZ WSZYSTKIE MIEJSCA
app.get('/getAllPlaces', function(req, res) {
	redisGetPlaces("places").then(function(places) {
		res.json({lista: places});

	});
});

// POBIERZ WSZYSTKIE WYDARZENIA
app.get('/getAllEvents', function(req, res) {
	redisGetEvents("events").then(function(events) {
		res.json({lista: events});
	});
});

app.get('/getSinglePlace/:place', function(req, res) {
	var place = req.params.place;
	redisGetSinglePlace(place).then(function(singlePlace) {
		res.json({place: singlePlace});
	});
});

app.get('/getSingleEvent/:event', function(req, res) {
	var event = req.params.event;
	redisGetSingleEvent(event).then(function(singleEvent) {
		res.json({event: singleEvent});
	});
});

// FUNKCJA ZAPISUJACA USERA NA WYDARZENIE
var redisSignUpUser = function(username, eventName) {
		console.log("Zapisuje usera: "+ username +" na wydarzenie: " + eventName);

		client.rpush(eventName+"-users", username, function(err, reply) {
			console.log("REPLY SET: " + reply.toString());
		});
}


// FUNKCJA USTAWIAJACA UZYTKOWNIKA DO BAZY REDISA
var redisSetUser = function(username, password) {
		console.log("Dodaje do bazy uzytkownika: " + username + " " + password);
		client.set(username, password, function(err, reply) {
			console.log("REPLY SET: " + reply.toString());
		});
	}
// FUNKCJA DODAJACA MIEJSCE DO BAZY REDISA
var redisSetPlace = function(name, city, street, number) {
		console.log("Dodaje do bazy miejsce: " + name + " " + city + " " + street + " " + number);
		var list = [name, city, street, number];

		var multi = client.multi();

		for (var i=0; i<list.length; i++) {
    		multi.rpush(name, list[i]);
		}

		multi.exec(function(errors, results) {
			console.log("REPLY SET: " + results.toString());
		});

		var multi1 = client.multi();

		client.rpush("places", name, function(err, reply) {
			console.log("REPLY SET: " + reply.toString());
		});
}

// FUNKCJA DODAJACA WYDARZENIE DO BAZY REDISA
var redisSetEvent = function(name, place, date, time) {
		console.log("Dodaje do bazy wydarzenie: " + name + " " + place + " " + date + " " + time);
		var list = [name, place, date, time];

		var multi = client.multi();

		for (var i=0; i<list.length; i++) {
    		multi.rpush(name, list[i]);
		}

		multi.exec(function(errors, results) {
			console.log("REPLY SET: " + results.toString());
		});

		var multi1 = client.multi();

		client.rpush("events", name, function(err, reply) {
			console.log("REPLY SET: " + reply.toString());
		});
}

// FUNKCJA POBIERAJACA MIEJSCE Z BAZY REDISA DO SPRAWDZENIA CZY TAKIE MIEJSCE JEST W BAZIE
var redisGetPlace = function(name) {
	var deferred = Q.defer();
	client.lrange(name, 0, 0, function(err, reply) {
		if (reply) {
			if(reply.toString() === name)
				deferred.resolve(true);
			else 
				deferred.resolve(false);
		} else {
			deferred.resolve(false);
		}
	});
	return deferred.promise;
};

// FUNKCJA POBIERAJACA MIEJSCE Z BAZY REDISA DO SPRAWDZENIA CZY TAKIE MIEJSCE JEST W BAZIE
var redisGetEvent = function(name) {
	var deferred = Q.defer();
	client.lrange(name, 0, 0, function(err, reply) {
		if (reply) {
			if(reply.toString() === name)
				deferred.resolve(true);
			else 
				deferred.resolve(false);
		} else {
			deferred.resolve(false);
		}
	});
	return deferred.promise;
};


// FUNKCJA POBIERAJACA JEDNO MIEJSCE <WARTOSC>
var redisGetSinglePlace = function(name) {
	var deferred = Q.defer();
	client.lrange(name, 0, 3, function(err, reply) {
		if (reply) {
			console.log(reply);
			deferred.resolve(reply);
			
		} else {
			deferred.resolve(false);
		}
	});
	return deferred.promise;
};

// FUNKCJA POBIERAJACA JEDNO WYDARZENIE <WARTOSC>
var redisGetSingleEvent = function(name) {
	var deferred = Q.defer();
	client.lrange(name, 0, 3, function(err, reply) {
		if (reply) {
			console.log(reply);
			deferred.resolve(reply);
			
		} else {
			deferred.resolve(false);
		}
	});
	return deferred.promise;
};

// FUNKCJA POBIERAJACA WARTOSC Z BAZY REDISA BEZ HASLA
var redisGet = function(data) {
	var deferred = Q.defer();
	client.get(data, function(err, reply) {
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
// FUNKCJA POBIERAJACA WARTOSC Z BAZY REDISA Z HASLEM
var redisGetPass = function(username, password) {
	var deferred = Q.defer();
	client.get(username, function(err, reply) {
		if (reply) {
			if (reply.toString() === password)
				deferred.resolve(true);
			else 
				deferred.resolve(false);
		} else {
			console.log('no reply');
			deferred.resolve(false);
		}
	});
	return deferred.promise;
};
// FUNKCJA POBIERAJACA WARTOSC Z BAZY REDISA
var redisGetPlaces = function(data) {
	var deferred = Q.defer();
	client.lrange(data, 0, 111, function(err, reply) {
		if (reply) {
			console.log("REPLY GET: " + reply.toString());
			deferred.resolve(reply);
		} else {
			console.log('no reply');
			deferred.resolve(false);
		}
	});
	return deferred.promise;
};

// FUNKCJA USEROW PRZYPISANYCH DO EVENTU
var redisGetUsersFromEvent = function(eventName) {
	var deferred = Q.defer();
	client.lrange(eventName+"-users", 0, 111, function(err, reply) {
		if (reply) {
			console.log("REPLY GET: " + reply.toString());
			deferred.resolve(reply);
		} else {
			console.log('no reply');
			deferred.resolve(false);
		}
	});
	return deferred.promise;
};

var redisGetEvents = function(data) {
	var deferred = Q.defer();
	client.lrange(data, 0, 111, function(err, reply) {
		if (reply) {
			console.log("REPLY GET: " + reply.toString());
			deferred.resolve(reply);
		} else {
			console.log('no reply');
			deferred.resolve(false);
		}
	});
	return deferred.promise;
};

// FUNKCJA POBIERAJACA WARTOSC Z BAZY REDISA PO INDEXIE
var redisGetPlacesByIndex = function(data, index) {
	var deferred = Q.defer();
	client.lrange(data, index, index, function(err, reply) {
		if (reply) {
			console.log("REPLY GET: " + reply.toString());
			deferred.resolve(reply);
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