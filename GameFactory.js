GameFactory = {};

GameFactory.createGame = function(playerIds){
    //Initial game structure and placeholders

    return {
        created: new Date(),
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
    var player = {
        playerId: playerId,
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
            var game = GameFactory.createGame([Meteor.userId(), otherPlayerId]);
            Games.insert(game);
        }
    });
}