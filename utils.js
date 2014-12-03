utils = {
    lookup: {
        username: function (userId) {
            return Meteor.users.findOne({_id: userId}).username;
        },
        deck: function (deckId) {
            return Decks.findOne({_id: deckId});
        },
        deckname: function (deckId) {
            var deck = utils.lookup.deck(deckId);
            return deck ? deck.name : undefined;
        }
    },
    game: {
        //Provided a game object, return my players object or undefined
        me: function (game) {
            return game ? _.findWhere(game.players, {playerId: Meteor.userId()}) : undefined;
        }
    },
    datastructures: {
        creategame: function (playerIds) {
            return {
                created: new Date(),
                lastActivity: new Date(),
                inProgress: false,
                finished: false,
                players: playerIds.map(function (id) {
                    return utils.datastructures.createplayer(id)
                }),
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
        },
        createplayer: function (playerId) {
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
        },
        createcard: function (cardId) {
            return {
                cardId: cardId,
                tapped: false
            };
        }
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
        update: function(game){
            Games.update({_id: game._id}, game);
        }
    };
}
