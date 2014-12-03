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
        /*deleteGame: function(gameId){
         Games.remove({_id: gameId});
         },
         updateGame: function(game){
         game.lastActivity = new Date();
         Games.update({_id: game._id}, game);
         },*/
        createGame: function(otherPlayerId){
            console.log("Creating game");
            Games.insert(GameFactory.createGame([Meteor.userId(), otherPlayerId]));
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
            var res = utils.server.lookup(gameId);
            if(!res || !res.me || res.me.library.length <= 0) return;

            res.me.hand.push(res.me.library.pop());
            utils.server.update(res);
        },
        playerReady: function(gameId){
            var res = utils.server.lookup(gameId);
            if(!res.me) return;

            res.me.ready = !res.me.ready;
            utils.server.update(res);
        },
        chooseDeck: function(ids){
            if(ids.length !== 2) return;
            var gameId = ids[0],
                deckId = ids[1];

            var res = utils.server.lookup(gameId);
            if(!res.me) return;

            res.me.deckId = deckId;
            utils.server.update(res);
        }
    });
}