var redis = require("redis"),
    client = redis.createClient();

var runSample = function () {
    // zapis wartości
    client.set("mój klucz", "Ahoj przygodo!", function (err, reply) {
        console.log("log: "+reply.toString());
    });
    // odczyt wartości
    client.get("mój klucz", function (err, reply) {
        console.log("log: "+reply.toString());
        client.quit();
    });
};

client.on("error", function (err) {
    console.log("Error " + err);
});

client.on("connect", runSample);
