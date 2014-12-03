utils = {
    lookup:{
        username: function(userId){ return Meteor.users.findOne({_id: userId}).username; },
        deck: function(deckId){ return Decks.findOne({_id: deckId}); },
        deckname: function(deckId){
            var deck = utils.lookup.deck(deckId);
            return deck ? deck.name : undefined;
        }
    },
    game:{
        //Provided a game object, return my players object or undefined
        me: function(game){ return game ? _.findWhere(game.players, {playerId: Meteor.userId()}) : undefined; }
    }
};

if(Meteor.isServer){
    utils.server = {
        lookup: function(gameId){
            var game = Games.findOne({_id: gameId});
            return game ? {
                game: game,
                me: utils.game.me(game)
            } : undefined;
        },
        update: function(lookupObject){
            Games.update({_id: lookupObject.game._id}, lookupObject.game);
        }
    }
}

