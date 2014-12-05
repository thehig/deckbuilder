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
            console.log("Move Card");
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

            //console.log("Found card");
            //console.log(JSON.stringify(poppedCard));

            //Put the card in its new destination
            switch(cardDestination) {
                case 'stack':
                    res.game.gameState.stack.push(poppedCard);
                    break;
                case 'land':
                    res.me.field.land.push(poppedCard);
                    break;
                case 'battlefield':
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
        }
    });
}