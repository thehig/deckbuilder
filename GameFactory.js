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
            Games.insert(utils.datastructures.creategame([Meteor.userId(), otherPlayerId]));
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
                           cards.push({
                               _id: new Meteor.Collection.ObjectID()._str,
                               cardId: card.card_id,
                               owner: player.playerId
                           });
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
            utils.server.update(res.game);
        },
        playerReady: function(gameId){
            var res = utils.server.lookup(gameId);
            if(!res.me || !res.me.deckId) return;

            res.me.ready = !res.me.ready;
            utils.server.update(res.game);
        },
        chooseDeck: function(ids){
            if(ids.length !== 2) return;
            var gameId = ids[0],
                deckId = ids[1];

            var res = utils.server.lookup(gameId);
            if(!res.me) return;

            res.me.deckId = deckId;
            utils.server.update(res.game);
        },
        addLife: function(gameId){
            var res = utils.server.lookup(gameId);
            if(!res.me) return;

            res.me.life++;
            utils.server.update(res.game);
        },
        subtractLife: function(gameId){
            var res = utils.server.lookup(gameId);
            if(!res.me) return;

            res.me.life--;
            utils.server.update(res.game);
        },
        moveCard: function(moveInformation){
            //console.log("Move Card");
            //Check our parameters
            if(!moveInformation) return;
            var cardDestination = moveInformation.destination;
            var cardUid = moveInformation.cardUid;
            var gameId = moveInformation.gameId;
            if(!cardDestination || !cardUid || !gameId) return;

            //console.log("Got all parameters");

            //Lookup the game;
            var res = utils.server.lookup(gameId);
            if(!res || !res.game || !res.me) return;

            //console.log("Found game, and player");
            //Look for the card in the players hand, field, graveyard and exile
            var poppedCard = utils.server.splicePlayer(cardUid, res.me);

            //Only other place a card can be is the stack
            poppedCard = poppedCard ? poppedCard : utils.server.spliceCard(cardUid, res.game.gameState.stack);
            //console.log("No Popped Card");
            if(!poppedCard) return;

            // console.log("Found card");
            // console.log(JSON.stringify(poppedCard));

            // If the card is going to land or nonland, leave its' tapped state intact. Otherwise remove it
            if(cardDestination.indexOf('land') < 0) delete poppedCard.tapped;

            //Put the card in its new destination
            switch(cardDestination) {
                case 'stack':
                    res.game.gameState.stack.push(poppedCard);
                    break;
                case 'land':
                    res.me.field.land.push(poppedCard);
                    break;
                case 'nonland':
                    res.me.field.nonland.push(poppedCard);
                    break;
                case 'graveyard':
                    res.me.graveyard.push(poppedCard);
                    break;
                case 'exile':
                    res.me.exile.push(poppedCard);
                    break;
                case 'hand':
                    res.me.hand.push(poppedCard);
                    break;
                case 'library':
                    res.me.library.push(poppedCard);
                    break;
            }

            //Save
            utils.server.update(res.game);
        },
        tapCard: function(ids){
            var gameId = ids.gameId;
            var cardId = ids.cardId;

            // Missing Parameter -> GTFO
            if(!gameId || !cardId) return;
            
            // Missing Game or Player not in game -> GTFO
            var res = utils.server.lookup(gameId);
            if(!res || !res.game || !res.me) return;

            // Card not found owned by player -> GTFO
            var card = utils.server.findFromPlayer(cardId, res.me);
            if(!card) return;

            // console.log("Tapping card: " + JSON.stringify(card));

            // Card was somewhere other than the battlefield -> GTFO
            if (['nonland', 'land'].indexOf(card.location) < 0) return;

            var actualCard = card.card;
            if(actualCard.tapped === true)
                actualCard.tapped = false;
            else if(actualCard.tapped === false)
                actualCard.tapped = true;
            else
                actualCard.tapped = true;

            utils.server.update(res.game);
        },
        chat: function(messageObject){

            // Lookup the game
            var game = Games.findOne({_id: messageObject.id});
            if(!game) return;

            // Create a chat datastructure and to the game
            game.misc.chat.push(
                utils.datastructures.createchatmessage(messageObject.message)
            );

            utils.server.update(game);
        }
    });
}