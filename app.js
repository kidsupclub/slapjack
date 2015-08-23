var express= require("express");
var http = require("http");
var io = require('socket.io');

var app = express();
var server = http.Server(app);
var socket = io(server);
var active_player = 0;
var client_list= [];


app.use(express.static('.'));
var hand = [];
var cards = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png', '10.png', '11.png', '12.png', '13.png', '14.png', '15.png', '16.png', '17.png', '18.png', '19.png', '20.png', '21.png', '22.png', '23.png', '24.png', '25.png', '26.png', '27.png', '28.png', '29.png', '30.png', '31.png', '32.png', '33.png', '34.png', '35.png', '36.png', '37.png', '38.png', '39.png', '40.png', '41.png', '42.png', '43.png', '44.png', '45.png', '46.png', '47.png', '48.png', '49.png', '50.png', '51.png', '52.png'];
socket.on('connection', function(client) {
    console.log('someone connected');
    console.log(client_list.length);
    client_list.push(client);
    client.hand=[];

client.on('register', function(data){
    if(client_list.length==2) {
        client_list[0].hand = cards.slice(0, cards.length / 2);
        client_list[1].hand = cards.slice(cards.length / 2, cards.length);
        /*socket.emit('deal', {client_list[0].player:client_list[0].hand.length});
         socket.emit('deal', {client_list[1].player:client_list[1].hand.length});*/
        var msg = {};
        var players = [];
        for (var i = 0; i < client_list.length; i++) {
            msg[client_list[i].player] = client_list[i].hand.length;
            players.push(client_list[i].player);
            players.push(client_list[i].hand.length);

            /*msg.push(client_list[i].player);
             msg.push(client_list[i].hand.length);*/
        }
        msg['players'] = players;
        msg['active'] = client_list[0].player;
        msg['pile'] = [];
        socket.emit('deal', msg);
        client.player = data.player;
        console.log(data.player);
        socket.emit('announce', data.player + " has just registered!");
    }
});
    client.on('disconnect', function () {
        console.log('someone left' );
        var idx = client_list.indexOf(client);
        if (idx != -1) {
            client_list.splice(idx, 1);
        }
        console.log(client_list.length);
    });




});
server.listen(8080, function () {
    console.log('listening...');
});






