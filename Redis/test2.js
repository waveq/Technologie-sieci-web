var redis = require('redis'),
    client = redis.createClient();

client.on('error', function (err) {
    console.log('Error ' + err);
});

var runSample = function () {
    // zapis wartości
    client.set('mój klucz', 'Ahoj przygodo');
    // dodajemy "termin przydatności"
    client.expire('mój klucz', 3);

    // odczyt wartości (co sekundę) aż do "przeterminowania"
    var myTimer = setInterval(function () {
        client.get('mój klucz', function (err, reply) {
            if (reply) {
                console.log('jestem: ' + reply.toString());
            } else {
                clearTimeout(myTimer);
                console.log('już po mnie...');
                client.quit();
            }
        });
    }, 1000);
};

client.on('connect', runSample);

