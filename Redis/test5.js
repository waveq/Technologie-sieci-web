var redis = require("redis"),
    client1 = redis.createClient(),
    client2 = redis.createClient(),
    msg_count = 0;

client1.on("subscribe", function (channel, count) {
    client2.publish("mój kanał", "pierwsza");
    client2.publish("mój kanał", "druga");
    client2.publish("mój kanał", "trzecia");
    client2.publish("inny kanał", "czwarta");
});

client1.on("message", function (channel, message) {
    console.log("[client1] wiadomość na kanale '" + channel + "': " + message);
    msg_count += 1;
    if (msg_count === 3) {
        client1.unsubscribe();
        client1.quit();
        client2.quit();
        console.log('Papa!');
    }
});

client1.subscribe("mój kanał");
