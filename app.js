var express= require("express");
var http = require("http");
var io = require('socket.io');

var app = express();
var server = http.Server(app);
var socket = io(server);

var client_list = [];

/*app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});*/
app.use(express.static('.'));

var port = Number(process.env.PORT || 3000);

server.listen(port, function(){
    console.log('listening...');
});

var hands = [];
var cards = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png'];

socket.on('connection', function(client){
    console.log(client.handshake.address +" connected.");
    client_list.push(client);

    doDeal();

    //client.on('twee', function(data){
        //socket.emit('twee', data);
        //doDeal()

    //});

    client.on('disconnect', function(){

        console.log(client.handshake.address+' disconnected.');
    });

    client.on('play', function(data){
        if(hands[hands.length-1]==hands[hands.length-2]){
            socket.emit('winner', "You Win!");
        }
        else
            socket.emit('winner', "You Lose.");
    });

});

function doDeal(){
    deal();
    setInterval(deal, 1000);
}

function deal(){
    var idx =Math.floor(Math.random()*cards.length);
    var card = cards[idx];
    socket.emit('deal', {card:card});
    hands.push(card);

    //if(hands.length <5){
    //    setTimeout(deal, 4000);
    //}
    //else{
    if (hands.length >=5) {
        socket.emit('winner', "No winner. Lets play again.");
        hands = [];
    }
}









