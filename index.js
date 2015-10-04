var express = require('express');
var http = require('http');
var io = require('socket.io');

var app = express();
var server = http.Server(app);
var socket = io(server);
var pile = [];
var client_list = [];
var slap_enable = 0;

var cards = [
	"0CU","0DU","0HU","0SU","2CU","2DU","2HU","2SU","3CU","3DU","3HU","3SU",
	"4CU","4DU","4HU","4SU","5CU","5DU","5HU","5SU","6CU","6DU","6HU","6SU",
	"7CU","7DU","7HU","7SU","8CU","8DU","8HU","8SU","9CU","9DU","9HU","9SU",
	"ACU","ADU","AHU","ASU","JCU","JDU","JHU","JSU","QCU","QDU","QHU","QSU",
	"KCU","KDU","KHU","KSU"];

socket.on('connection', function(client){

	client.on('register', function(data){

		client_list.push(client);
		client.player = data.player;
		client.hand = [];
		socket.emit('announce', data.player + " has joined.");


		if(client_list.length == 2) {
			var msg = {};
			pile = [];
			var temp = cards.slice(0);
			while(temp.length > 0) {
				var r1;

				r1 = Math.floor(Math.random()*temp.length);
				client_list[0].hand.push(temp[r1]);
				temp.splice(r1, 1);

				r1 = Math.floor(Math.random()*temp.length);
				client_list[1].hand.push(temp[r1]);
				temp.splice(r1, 1);

			}

			//client_list[0].hand = cards.slice(0, cards.length/2);
			//client_list[1].hand = cards.slice(cards.length/2, cards.length);


			var players = [];
			for(var i = 0; i < client_list.length; i++){
				msg[client_list[i].player] = client_list[i].hand.length;
				players.push(client_list[i].player);
				players.push(client_list[i].hand.length);
			}

			msg['players'] = players;
			msg['active_player'] = client_list[0].player;
			msg['pile'] = [];
			msg['slap_enable'] = slap_enable;
			socket.emit('deal', msg);

		}

	});

	client.on('disconnect', function(){

		var index = client_list.indexOf(client);
		if(index != -1){

			client_list.splice(index, 1);

		}

		console.log(client_list.length);
		socket.emit('announce', client.player + " has left.");

	});

	client.on('play', function(data){

		var msg = {};
			if(slap_enable == 1 && pile.length>0){
				var card1 = pile[pile.length-1];
				var card2 = pile[pile.length-2];
				if(card1[0] == card2[0]){
					for(var m = 0; m<pile.length; m++){
						client.hand.unshift(pile[m]);
					}
					pile=[];
					slap_enable=0
				}
				socket.emit('announce', client.player + " won the slap!");
				var players = [];
				for(var j = 0; j < client_list.length; j++){

					msg[client_list[j].player] = client_list[j].hand.length;
					players.push(client_list[j].player);
					players.push(client_list[j].hand.length);

				}



				msg['players'] = players;
				msg['active_player'] = client.player;
				msg['pile'] = pile;
				msg['slap_enable'] = slap_enable;
				socket.emit('deal', msg);
				return;
			}
		for(var i = 0; i < client_list.length; i++) {
			if(data == client_list[i].player) {
				var card = client_list[i].hand.shift();
				pile.push(card);
				if(pile.length>=2){
					var card1 = pile[pile.length-1];
					var card2 = pile[pile.length-2];
					if(card1[0] == card2[0]){
						slap_enable = 1;
					}
				}

				var msg = {};
				var players = [];
				for(var j = 0; j < client_list.length; j++){

					msg[client_list[j].player] = client_list[j].hand.length;
					players.push(client_list[j].player);
					players.push(client_list[j].hand.length);

				}

				var k = i + 1;

				if(k == client_list.length) {

					k = 0;

				}
				msg['players'] = players;
				msg['active_player'] = client_list[k].player;
				msg['pile'] = pile;
				msg['slap_enable'] = slap_enable;
				socket.emit('deal', msg);

			}

		}

	});

});

app.use(express.static('.'));

var port = Number(process.env.PORT || 8080);

server.listen(port, function(){

	console.log('Listening...');

});

//end
