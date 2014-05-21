var redis = require('redis'),
    client = redis.createClient();

var writeTTL = function (err, data) {
    console.log('Do końca świata jeszcze ' + data + 's');
};

var runSample = function () {

    client.set('mój klucz', 'mam się świetnie', redis.print);
    client.expire('mój klucz', 3);

    var myTimer = setInterval(function () {
        client.get('mój klucz', function (err, reply) {
            if (reply) {
                console.log('Żyję i ' + reply.toString());
                client.ttl('mój klucz', writeTTL);
            } else {
                clearTimeout(myTimer);
                console.log('No to już po mnie...');
                client.quit();
            }
        });
    }, 1000);
};

client.on('error', function (err) {
    console.log('Error ' + err);
});

client.on('connect', runSample);

