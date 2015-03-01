//Virtual DOM manager
$ = Meteor.npmRequire('cheerio');

//Promise management
Future = Meteor.npmRequire('fibers/future');





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
            if(this.attribs['data-name'])
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
    createDeck: function(deck){

        var apiCards = deck.cards.map(function(card){

            var lookupCard = Cards.findOne({name: card.name}),
                cardId = -1;

            if(lookupCard) cardId = lookupCard._id;
            else{
                //todo: Better error handling here
                console.log("Creating card " + card.name);
                var apiResult = apiLookup(card.name);
                if(apiResult) Cards.insert(apiResult);
                //String replace for (Turn / Burn) => (Turn // Burn)
                var lookupResult = Cards.findOne({name: card.name.replace('/', '//')});

                cardId = lookupResult ? lookupResult._id : -1;
            }

            //Cards that can't be looked up will just be ignored for the moment
            //Current issue card: 'Wear' from 'Wear // Tear' not having an individual mtgDbApi entry
            if(cardId){
                return {
                    card_id: cardId,
                    quantity: card.quantity,
                    board: card.board,
                    category: card.category
                };
            }
        });

        var mainboard = [],
            sideboard = [],
            other = {};

        apiCards.forEach(function(apiCard){
            if(apiCard.board === 'main') mainboard.push(apiCard);
            else if(apiCard.board === 'side') sideboard.push(apiCard);
            else {
                if(other[apiCard.board]) other[apiCard.board].push(apiCard);
                else other[apiCard.board] = [apiCard];
            }
        });


        console.log("Creating deck " + deck.name);
        Decks.insert({
            created: new Date(),
            createdBy: Meteor.userId(),
            origin: deck.origin,
            name: deck.name,
            mainboard: mainboard,
            sideboard: sideboard,
            other: other
        });
    },
    deleteDeck: function(deckId){
        Decks.remove({_id: deckId, createdBy: Meteor.userId()});
    }
});


/**
 * Given a card name, look it up in the MtgDB API
 * @param  {String} cardName The plain-string name of the card
 * @return {Object}          The JSON detailed version of the card
 */
function apiLookup(cardName) {
    if (!cardName) return {};

    var sanitizedCardName = sanitizeCardName(cardName);

    //TODO Remove Future in favor of Bluebird
    var myFuture = new Future();

    var safeurl = "http://api.mtgdb.info/cards/" + sanitizedCardName;
    Meteor.http.get(safeurl, function (error, result) {
        if (error) {
            myFuture.throw(error);
        }

        var parsedResult = parseMtgDbResponse(JSON.parse(result.content));
        myFuture.return(parsedResult);
    });

    return myFuture.wait();
}

/**
 * @param cardName
 * @returns {string}
 */

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