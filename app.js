var express= require("express");
var http = require("http");
var io = require('socket.io');

var app = express();
var server = http.Server(app);
var socket = io(server);
var active_player = 0;
var client_list= [];
var pile = [];

app.use(express.static('.'));
var hand = [];
var cards = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png', '10.png', '11.png', '12.png', '13.png', '14.png', '15.png', '16.png', '17.png', '18.png', '19.png', '20.png', '21.png', '22.png', '23.png', '24.png', '25.png', '26.png', '27.png', '28.png', '29.png', '30.png', '31.png', '32.png', '33.png', '34.png', '35.png', '36.png', '37.png', '38.png', '39.png', '40.png', '41.png', '42.png', '43.png', '44.png', '45.png', '46.png', '47.png', '48.png', '49.png', '50.png', '51.png', '52.png'];

socket.on('connection', function(client) {
    console.log('someone connected');
    console.log(client_list.length);
    client_list.push(client);
    client.hand=[];

    client.on('register', function(data){
        client.player = data.player;

        var totalRegisters = client_list.length;
        if (totalRegisters<2 || totalRegisters>4) {
        socket.emit('announce', data.player + " has just registered!.  There is a total of "+totalRegisters+ " player(s). Please wait.");
        } else {
        socket.emit('announce', data.player + " has just registered!.  There is a total of "+totalRegisters + " player(s). You are in to play.");
        }

        var totalPlayers = totalRegisters>4?4:totalRegisters;
        var totalCards = cards.length;
        var totalCardPerHand = Math.floor(totalCards/totalPlayers);

        for (var i=0; i<totalPlayers; i++) {
            var sIdx=totalCardPerHand*i;
            var eIdx=totalCardPerHand*(i+1);
            client_list[i].hand = cards.slice(sIdx, eIdx);
        }

        var msg = {};
        var players = [];
        for (var i = 0; i < totalPlayers; i++) {
            msg[client_list[i].player] = client_list[i].hand.length;
            players.push(client_list[i].player);
            players.push(client_list[i].hand.length);
        }
        msg['players'] = players;
        msg['active'] = client_list[0].player;
        msg['pile'] = [];
        socket.emit('deal', msg);
    });

    client.on('disconnect', function () {
        console.log('someone left' );
        var idx = client_list.indexOf(client);
        if (idx != -1) {
            client_list.splice(idx, 1);
        }
        console.log(client_list.length);
    });

    client.on('play', function(data) {
        console.log(data+" clicked hit server.");
        var totalPlayers = client_list.length>4?4:client_list.length;
        for (var i = 0; i <totalPlayers ; i++) {
            if (data == client_list[i].player) {


                var card = client_list[i].hand.shift();
                if (card) {
                    socket.emit('announce', data+" just put a card.");
                    pile.push(card);
                    var msg = {};
                    var players = [];
                    for (var j = 0; j < client_list.length; j++) {
                        msg[client_list[j].player] = client_list[j].hand.length;
                        players.push(client_list[j].player);
                        players.push(client_list[j].hand.length);

                    }
                    msg['players'] = players;
                    msg['active'] = client_list[0].player;
                    msg['pile'] = pile;
                    socket.emit('deal', msg);
                } else {
                    console.log("no card found for "+data);
                }
            }
        }
    });




});
var port = Number(process.env.PORT || 3000);
server.listen(port, function () {
    console.log('listening...');
});






