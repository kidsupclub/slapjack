var express = require('express');
var http = require('http');
var io = require('socket.io');

require('waitfor')

var app = express();
var server = http.Server(app);
var socket = io(server);

var pile = [];
var client_list = [];
var slap_enable = 0;
var active_player = 0;

var akqj_player = null;
var akqj_count = 0;

var cards = [
	"0CU","0DU","0HU","0SU","2CU","2DU","2HU","2SU","3CU","3DU","3HU","3SU",
	"4CU","4DU","4HU","4SU","5CU","5DU","5HU","5SU","6CU","6DU","6HU","6SU",
	"7CU","7DU","7HU","7SU","8CU","8DU","8HU","8SU","9CU","9DU","9HU","9SU",
	"ACU","ADU","AHU","ASU","JCU","JDU","JHU","JSU","QCU","QDU","QHU","QSU",
	"KCU","KDU","KHU","KSU"
];

socket.on('connection', function(client) {
	client.hand = [];

	socket.to(client.id).emit('announce', "Welcome to SlapJack! Please register to play.");

	client.on('register', function(data) {
		
		client_list.push(client);
		client.player = data.player;

		socket.emit('announce', data.player + " has joined.");
		
		if(client_list.length == 1) {

			socket.to(client.id).emit('announce', "You are the first player to join. Please wait.");

		}
		
		else if(client_list.length == 2) {
			
			deal();
			pile = [];
			slap_enable = 0;
			active_player = Math.floor(Math.random() * client_list.length);
			update();
			socket.emit('announce', "Let's start the game! ");
			socket.emit('announce', client_list[active_player].player + " to play first.");
		}
			
	});

	client.on('disconnect', function() {
			
		var index = client_list.indexOf(client);
		if(index != -1) {
			while(client_list[index].hand.length > 0) {
				
				var c = client_list[index].hand.pop();
				pile.unshift(c);
				
			}
			
			find_client();
			client_list.splice(index, 1);
			update();
		}
			
		socket.emit('announce', client.player + " has left.");
			
	});
	
	client.on('play', function(data) {
		
		if(client_list.indexOf(client) == -1) return;

		if(slap_enable == 1) {
			
			for(var i = 0; i < pile.length; i++) {
				
				client.hand.unshift(pile[i]);
				
			}

			pile = [];
			slap_enable = 0;
			active_player = client_list.indexOf(client);
			

			console.log("slapped by", client.player)



			if(client.hand.length == 52) {
				
				client.hand = [];
				deal();
				socket.emit('announce', client.player + " IS THE WINNER!!!!!!");
				socket.emit('game_win', client.player);
				
			} else {
				
				socket.emit('announce', client.player + " won the slap.");
				socket.emit('slap_win', client.player);
				
			}
			
			akqj_player = null;
			akqj_count = 0;

console.log(client.player + "won the slap")

		}

		else {

			var card = client.hand.pop();
			pile.push(card);
			
			var card0, card1, card2;

			if(pile.length >= 3) {
				
				card1 = pile[pile.length - 1];
				card2 = pile[pile.length - 3];
				
				if(card1[0] == card2[0]){
					
					console.log("sandwich")

					slap_enable = 1;
					
				}
			}

			if(pile.length >= 2) {
				
				card0 = pile[0]
				card1 = pile[pile.length - 1];
				card2 = pile[pile.length - 2];
				
				if(card1[0] == card2[0] || card0[0] == card1[0]){
					
					console.log("top two or top-bottom")

					slap_enable = 1;
					
				}
			}
			
			if(slap_enable == 0) {

console.log(client.player + " played " + card);

				if(check_akqj(card) > 0) {

					if(akqj_player != null) {

console.log(client.player + " overtook " + akqj_player.player);

						akqj_player = client;
						akqj_count = check_akqj(card);
						
						find_client();
					}
					else {

console.log(client.player + " played honor card " + card);
						
						akqj_player = client;
						akqj_count = check_akqj(card);
						
						find_client();
					}

				}
				else {

					if(akqj_player != null) {

console.log(akqj_player.player + " was the akqj_player");
					
						akqj_count = akqj_count - 1;

						if(akqj_count == 0) {

console.log(akqj_player.player + " to win the pile");

							//update();
							//wait.milliseconds(1000);

console.log(akqj_player.player + " wins the pile");
					
							for(var i = 0; i < pile.length; i++) {
							
								client.hand.unshift(pile[i]);
								
							}
							
							pile = [];
							slap_enable = 0;
							active_player = client_list.indexOf(akqj_player);
							
							akqj_player = null;
							akqj_count = 0;
							
						}
						else {

							
console.log(client_list[active_player].player + " still to play " + akqj_count + " times");
							
						}
						
					}
					else {

console.log("no akqj_player");					
						
						find_client();

						
					}
					
				}
			
			}
			else {

				
				//akgj_player = null;
				//akgj_count = 0;
				
			}
		}		

if(slap_enable) {
	console.log("slap enabled, everyone can play");
}
else {
	console.log(client_list[active_player].player + " to play");
}

		update();
	});

	function deal() {
		
		var temp = cards.slice(0);
		var r;
		var i = 0;
		
		while(temp.length > 0) {
			
				
			r = Math.floor(Math.random() * temp.length);
			client_list[i].hand.push(temp[r]);
			temp.splice(r, 1);
			
			i++;
			
			if(i == client_list.length) {
				
				i = 0;
				
			}
			
		} 
	}

	function update() {
		var player_list = {};
		var msg = {};

		for(var i = 0; i < client_list.length; i++) {

			player_list[client_list[i].player] = client_list[i].hand.length;

		}
		
		msg['player_list'] = player_list;
		msg['pile'] = pile;
		msg['active_player'] = client_list[active_player].player;
		msg['slap_enable'] = slap_enable;
		
		socket.emit('deal', msg);
	}

	function find_client() {
		if(client_list.length == 0) {
			
			return;
			
		}	
		
		while(1) {

			active_player++;

			if(active_player == client_list.length) {
				
				active_player = 0;
				
			}

			if( client_list[active_player].hand.length == 0) {

				continue;

			}
			else {

				break;

			}

		}
	
	}
	
	function check_akqj(card) {
		
		if(card[0] == "A") {
			
			return(4);
			
		}
		
		else if(card[0] == "K") {
			
			return(3);
			
		}
		
		else if(card[0] == "Q") {
			
			return(2);
			
		}
		
		else if(card[0] == "J") {
			
			return(1);
			
		}
		
		else {
			
			return(0);
			
		}
		
	}

});

app.use(express.static('.'));

var port = Number(process.env.PORT || 8080);
server.listen(port, function(){
	
	console.log('Listening...');
	
});