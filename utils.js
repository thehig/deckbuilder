utils = {
    lookup: {
        /**
         * Get a users Name by ID
         * @param  {String} userId MongoDB ID for User
         * @return {String}        Plaintext name for User
         */
        username: function (userId) {
            return Meteor.users.findOne({_id: userId}).username;
        },
        /**
         * Gets a Deck by ID
         * @param  {String} deckId MongoDB ID for Deck
         * @return {Object}        Deck object from Database
         */
        deck: function (deckId) {
            return Decks.findOne({_id: deckId});
        },
        /**
         * Gets a Deck Name by ID
         * @param  {String} deckId MongoDB ID for Deck
         * @return {String}        Deck name from Database or undefined if not found
         */
        deckname: function (deckId) {
            var deck = utils.lookup.deck(deckId);
            return deck ? deck.name : undefined;
        }
    },
    game: {
        /**
         * Look through a games players and determine if you are an active player
         * @param  {Object} game Game object
         * @return {Boolean}     True if you are a player in the game
         */
        me: function (game) {
            return game ? _.findWhere(game.players, {playerId: Meteor.userId()}) : undefined;
        }
    },
    datastructures: {
        /**
         * Given a list of player IDs create a game for them
         * @param  {[String]} playerIds Collection of MongoDB User IDs
         * @return {Object}             JSON object representing a game
         */
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
        /**
         * Given a player ID, create a player Game Object
         * @param  {String} playerId MongoDB Player ID
         * @return {Object}          JSON object representing a single player in an ongoing game
         */
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
        /**
         * Given a card, copy it and give it a unique ID for the database
         * @param  {Object} card Original Card object with API data
         * @return {Object}      JSON object representing the ID of the original card, and its state
         */
        createbattlefieldcard: function (card) {
            return {
                _id: card._id,
                cardId: card.cardId,
                owner: Meteor.userId(),
                tapped: false
            };
        },
        /**
         * Take in a message, sanatize it and return it
         * @param  {String} chatmessage Users message to send
         * @return {Object}             JSON object of the chat message and metadata
         */
        createchatmessage: function(chatmessage){
            // This substring is also done client side, but just in case...
            if(chatmessage.length > 140) chatmessage = chatmessage.substring(0, 140);

            // Meteor is auto-sanitizing input, so no need to do this
            /*chatmessage = chatmessage.replace(/&/g, '&amp;')
                          .replace(/</g, '&lt;')
                          .replace(/>/g, '&gt;')
                          .replace(/\"/g, '&quot;')
                          .replace(/\'/g, '&#39;');*/

            return {
                timestamp: new Date(),
                creator: Meteor.userId(),
                message: chatmessage
            }
        },
        /**
         * Take in a message and create the history equivalent
         * @param  {String} historymessage Message to be added to history
         */
        createhistorymessage: function(historymessage, params){
            return {
                timestamp: new Date(),
                creator: Meteor.userId(),
                message: historymessage,
                params: params
            }
        }
    }
};

if(Meteor.isServer){
    utils.server = {
        /**
         * Server side lookup of a game
         * @param  {String} gameId MongoDB game ID
         * @return {Object}        JSON object with the game and you in the game, if you are part of the game
         */
        lookup: function(gameId){
            var game = Games.findOne({_id: gameId});
            return game ? {
                game: game,
                me: utils.game.me(game)
            } : undefined;
        },
        /**
         * Server side shortcut for upating a game
         * @param  {Object} game        JSON object representing a game
         * @return {WriteResult}        Status of the MongoDB operation
         */
        update: function(game){
            Games.update({_id: game._id}, game);
        },
        /**
         * Given a collection of cards, find the first one with the given card ID, owned by this player
         * @param  {String} cardUid         MongoDB Card ID
         * @param  {[Object]} collection    Array of Card Objects
         * @return {Object}                 First card found, or null if not found
         */
        findCard:function(cardUid, collection){
            return _.findWhere(collection, {_id: cardUid, owner: Meteor.userId()});
        },
        /**
         * Given a player find a given cards location
         * @param  {String} cardUid MongoDB Card ID
         * @param  {Object} player  JSON Player Object
         * @return {Object}         An object with the Card Object, and the location where it was found, or undefined if not found
         */
        findFromPlayer: function(cardUid, player){
            var card = utils.server.findCard(cardUid, player.hand);
            if(card) return {card: card, location: 'hand'};

            card = utils.server.findCard(cardUid, player.field.land);
            if(card) return {card: card, location: 'land'};

            card = utils.server.findCard(cardUid, player.field.nonland);
            if(card) return {card: card, location: 'nonland'};

            card = utils.server.findCard(cardUid, player.graveyard);
            if(card) return {card: card, location: 'graveyard'};

            card = utils.server.findCard(cardUid, player.exile);
            if(card) return {card: card, location: 'exile'};

            return undefined;
        },
        /**
         * Given a cardUid and a collection, remove the card from the collection and return it if owned by the invoking player
         * @param  {String} cardUid         MongoDB ID for Card in Game (Not the original card ID)
         * @param  {[Object]} collection    Array of Card Objects
         * @return {Object}                 Card Object if found, or undefined
         */
        spliceCard:function(cardUid, collection){
            var card = _.findWhere(collection, {_id: cardUid, owner: Meteor.userId()});
            if(!card) return undefined;
            var spliced = collection.splice(collection.indexOf(card), 1)[0];
            return spliced ? spliced : undefined;
        },        
        /**
         * Given a player, search their hand, battlefield, graveyard and exile and get the specified card
         * @param  {String} cardUid MongoDB ID for Card in Game (Not the original card ID)
         * @param  {Object} player  JSON Player Object
         * @return {Object}         Card Object, or Undefined if not found
         */
        splicePlayer: function(cardUid, player){
            var lookup = utils.server.findFromPlayer(cardUid, player);
            if(!lookup) return;

            switch(lookup.location){
                case 'hand':        return utils.server.spliceCard(cardUid, player.hand);
                case 'land':        return utils.server.spliceCard(cardUid, player.field.land);
                case 'nonland':     return utils.server.spliceCard(cardUid, player.field.nonland);
                case 'graveyard':   return utils.server.spliceCard(cardUid, player.graveyard);
                case 'exile':       return utils.server.spliceCard(cardUid, player.exile);
                default:            return undefined;
            }
        }
    };
}
