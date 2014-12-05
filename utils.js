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
        createbattlefieldcard: function (card) {
            return {
                _id: card._id,
                cardId: card.cardId,
                owner: Meteor.userId(),
                tapped: false
            };
        }
    }
};

if(Meteor.isServer){
    utils.server = {
        /**
         * Lookup a game, and player by gameId
         * @param gameId
         * @returns {{game: any, me: *}}
         */
        lookup: function(gameId){
            var game = Games.findOne({_id: gameId});
            return game ? {
                game: game,
                me: utils.game.me(game)
            } : undefined;
        },
        /**
         * Update a game object
         * @param game
         */
        update: function(game){
            Games.update({_id: game._id}, game);
        },
        /**
         * Lookup a card with the given cardId, splice it and return it
         * @param cardUid
         * @param collection
         * @returns {T}
         */
        spliceCard:function(cardUid, collection){
            var card = _.findWhere(collection, {_id: cardUid, owner: Meteor.userId()});
            if(!card) return undefined;
            var spliced = collection.splice(collection.indexOf(card), 1)[0];
            return spliced ? spliced : undefined;
        },
        /**
         * Lookup a card with the given cardId in the players hand, land and nonland, splice it and return it
         * @param cardUid
         * @param player
         * @returns {*}
         */
        splicePlayer: function(cardUid, player){
            var card = utils.server.spliceCard(cardUid, player.hand);
            if(card) return card;

            card = utils.server.spliceCard(cardUid, player.field.land);
            if(card) return card;

            card = utils.server.spliceCard(cardUid, player.field.nonland);
            if(card) return card;

            card = utils.server.spliceCard(cardUid, player.graveyard);
            if(card) return card;

            card = utils.server.spliceCard(cardUid, player.exile);
            if(card) return card;
        }
    };
}
