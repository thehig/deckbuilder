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
            var game = GameFactory.createGame([Meteor.userId(), otherPlayerId]);
            Games.insert(game);
        },
        deleteGame: function(gameId){
            Games.remove({_id: gameId});
        },
        updateGame: function(game){
            //console.log(JSON.stringify(game));
            game.lastActivity = new Date();
            Games.update({_id: game._id}, game);
        }
    });
}