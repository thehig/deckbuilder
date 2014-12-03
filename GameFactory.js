GameFactory = {};

GameFactory.createGame = function(playerIds){
    //Initial game structure and placeholders

    return {
        created: new Date(),
        lastActivity: new Date(),
        inProgress: false,
        finished: false,
        players: playerIds.map(function(id){return GameFactory.createPlayer(id)}),
        gameState: {
            turn: playerIds,
            phase: 'untap',
            stack: []
        },
        misc: {
            chat: [],
            history: []
        }
    };
};

GameFactory.createPlayer = function (playerId){
    return {
        playerId: playerId,
        ready: false,
        deckId: undefined,
        dead: false,
        life: 20,
        hand: [],
        library: [],
        graveyard: [],
        exile: [],
        field: {
            land: [],
            nonland: []
        }
    }
};

if(Meteor.isServer){
    Meteor.methods({
        createGame: function(otherPlayerId){
            console.log("Creating game");
            Games.insert(GameFactory.createGame([Meteor.userId(), otherPlayerId]));
        },
        deleteGame: function(gameId){
            Games.remove({_id: gameId});
        },
        updateGame: function(game){
            game.lastActivity = new Date();
            Games.update({_id: game._id}, game);
        },
        startGame: function(gameId){
            var game = Games.findOne({_id: gameId});
            if(game){
                game.players.forEach(function(player){
                    var deck = Decks.findOne({_id: player.deckId});
                    if(!deck){ return; }

                    var cards = [];
                    deck.mainboard.forEach(function(card){
                       for(var i = 0; i < card.quantity; i++){
                           cards.push(card.card_id);
                       }
                    });

                    player.library = _.shuffle(cards);
                });
                game.inProgress = true;
                Games.update({_id: game._id}, game);
            }
        },
        drawCard: function(gameId){
            var game = Games.findOne({_id: gameId});
            if(game) {
                var updated = false;
                game.players.forEach(function(player){
                    if(player.playerId === Meteor.userId()){
                        if(player.library.length > 0){
                            var card = player.library.pop();
                            player.hand.push(card);
                            updated = true;
                        }
                    }
                });
                if(updated) Games.update({_id: game._id}, game);
            }
        }
    });
}