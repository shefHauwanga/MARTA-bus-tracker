var async = require("async");
var webServer = require("http");
var redis = require("redis");
var url = require('url');
var client = redis.createClient();
var listenPort = 8888;

webServer.createServer(function(request, response) {
    if(request.url !== "/favicon.ico"){
        var buses = [];
        var queryData = url.parse(request.url, true).query;    

        if (queryData.bus) {
            busNum = queryData.bus;
        } else {
            busNum = "*";
        }

        client.keys(busNum, function(error, replies) {
            async.forEach(replies, function(keyVal, callback) {
                client.get(keyVal.toString(), function(err, reply) {
                    buses.push(JSON.parse(reply));

                    callback();
                });
            }, function(err){
                var headers = {
                    'Content-Type': 'text/plain',
                    'Content-Length': JSON.stringify(buses).length
                };

                response.writeHead(200, headers);
                response.write(JSON.stringify(buses));
                response.end();
           });
        });
    }
}).listen(listenPort);
