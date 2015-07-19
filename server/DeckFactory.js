//Virtual DOM manager
$ = Meteor.npmRequire('cheerio');





Meteor.methods({
    /**
     * Given a URL, go get the cards from tappedOut
     * @param  {String} url     TappedOut URL
     * @return {[Object]}       Array of Card Objects with name, quantity, board and category
     */
    scrapeFromTappedOut: function(url) {
        if(!url) return [];
        console.log("Getting " + url);

        var tappedOutPageContents = $.load(Meteor.http.get(url).content),
            cardsCollection = [];

        tappedOutPageContents('.member a').each(function(index, element){
            if(this.attribs['data-name'] && this.attribs['data-quantity'])
            {
                var card = {
                    name: this.attribs['data-name'],
                    quantity: this.attribs['data-quantity'],
                    board: this.attribs['data-board'],
                    category: this.attribs['data-category']
                };

                cardsCollection.push(card);
            }
        });

        return cardsCollection;
    },
    createDeckAsync: function(deck){
        console.log("Create Deck async");

        var apiCards = [],
            insertionPromises = [],
            missingCards = [];

        deck.cards.forEach(function(card){
            var existingCard = Cards.findOne({name: card.name});
            if(existingCard) return;

            apiCards.push(new Promise(function(resolve, reject){
                Meteor.http.get("http://api.mtgdb.info/cards/" + sanitizeCardName(card.name), function(error, result){
                    if(result && result.content){
                        var data = JSON.parse(result.content);
                        resolve(data);
                    }
                    else{
                        resolve();
                    }
                });
            }));
        });

        console.log("Waiting for apiCards");
        Promise.all(apiCards).then(Meteor.bindEnvironment(function(results) {

            results.forEach(function (result) {
                var promise = Meteor.bindEnvironment(new Promise(function (resolve, reject) {
                    var card = parseMtgDbResponse(result);
                    if (card) {
                        console.log("\tInserting card " + card.name);
                        Cards.insert(card);
                        resolve();
                    } else {
                        resolve();
                    }
                }));
                insertionPromises.push(promise);
            });

            console.log("Waiting for insertions");
            Promise.all(insertionPromises).then(Meteor.bindEnvironment(function () {
                console.log("Assembling Deck");
                var secondaryLookups = [],
                    mainboard = [],
                    sideboard = [],
                    other = {};

                deck.cards.forEach(Meteor.bindEnvironment(function (card) {
                    var promise = Meteor.bindEnvironment(new Promise(function (resolve, reject) {

                        var lookupCard = Cards.findOne({name: card.name});
                        //This should only fail when a card can't be looked up, i.e. there was no API value for that card
                        if (!lookupCard) {
                            missingCards.push(card.name);
                            resolve();
                        }

                        var dbCard = {
                            card_id: lookupCard._id,
                            quantity: card.quantity,
                            board: card.board,
                            category: card.category
                        };

                        switch (card.board) {
                            case 'main':
                                mainboard.push(dbCard);
                                break;
                            case 'side':
                                sideboard.push(dbCard);
                                break;
                            default:
                                if (other[card.board]) other[card.board].push(dbCard);
                                else other[card.board] = [dbCard];
                                break;
                        }

                        resolve();
                    }));
                    secondaryLookups.push(promise);
                }));

                console.log("Waiting for secondary lookups");
                Promise.all(secondaryLookups).then(Meteor.bindEnvironment(function(){
                    console.log("Inserting deck " + deck.name);

                    Decks.insert({
                        created: new Date(),
                        createdBy: Meteor.userId(),
                        origin: deck.origin,
                        name: deck.name,
                        mainboard: mainboard,
                        sideboard: sideboard,
                        other: other,
                        missing: missingCards
                    });
                }));
            }));
        }));
    },
    deleteDeck: function(deckId){
        Decks.remove({_id: deckId, createdBy: Meteor.userId()});
    }
});

/**
 * Clean up a name for api safe lookup
 * Remove ':' symbol (Circle of protection: Red)
 * Remove '/' symbol (Turn / Burn)
 * @param  {String} cardName Card Name to safely encode
 * @return {String}          Encoded card name
 */
function sanitizeCardName(cardName){
    return encodeURIComponent(cardName.replace(':', '').replace(' / ', ''));
}

/**
 * When multiple cards (printings) are returned, always store the latest printing (highest set)
 * @param {Object} mtgDbCardResult  Result of a request to MtgDB
 * @returns {Object}                Most recent printing of a card
 */
function parseMtgDbResponse(mtgDbCardResult){
    var mtgCard = [-1, null];

    if(mtgDbCardResult instanceof Array)
    {
        //Get the most recent printing of the card
        mtgDbCardResult.forEach(function(cardPrinting){
            if(cardPrinting.setNumber > mtgCard[0]){
                mtgCard[0] = cardPrinting.setNumber;
                mtgCard[1] = cardPrinting;
            }
        });

        if(mtgCard[0] === -1){
            return mtgDbCardResult[0];
        }else{
            return mtgCard[1];
        }
    }
}