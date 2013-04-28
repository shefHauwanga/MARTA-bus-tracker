var webServer = require("http");
var redis = require("redis");
var client = redis.createClient();
var listenPort = 8888;
var buses = [];

webServer.createServer(function(request, response) {
    var busObj = [];
    client.keys("*", function(error, replies) {
        replies.forEach(function(keyVal) {
            client.get(keyVal.toString(), function(err, reply) {
                //buses[keyVal.toString()] = JSON.parse(reply);
                buses.push(JSON.parse(reply));
            });
        });
    });
    busObj = buses;
    buses = [];
    var headers = {
        'Content-Type': 'text/plain',
        'Content-Length': JSON.stringify(busObj).length
    };
    response.writeHead(200, headers);
    response.write(JSON.stringify(busObj));
    response.end();
}).listen(listenPort);
