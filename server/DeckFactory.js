//Virtual DOM manager
$ = Meteor.npmRequire('cheerio');

//Promise management
Future = Meteor.npmRequire('fibers/future');


/**
 * Look up a card by name with the mtgJsonDB API
 * @param cardName
 * @returns {*}
 */
function apiLookup(cardName) {
    if (!cardName) return {};

    var sanitizedCardName = encodeURIComponent(cardName.replace(':', ''));
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



Meteor.methods({
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
    createDeck: function(deck){

        var apiCards = deck.cards.map(function(card){

            var lookupCard = Cards.findOne({name: card.name});
            var cardId = -1;

            if(lookupCard) cardId = lookupCard._id;
            else{
                console.log("Creating card " + card.name);
                Cards.insert(apiLookup(card.name));
                cardId = Cards.findOne({name: card.name})._id;
            }

            return {
                card_id: cardId,
                quantity: card.quantity,
                board: card.board,
                category: card.category
            };
        });

        var mainboard = [];//_(apiCards, {board: 'main'});
        var sideboard = [];//_(apiCards, {board: 'side'});
        var other = {};

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
    }
});