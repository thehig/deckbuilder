//DeckFactory = {};
//
//DeckFactory.scrapeFromTappedOut = function(url){
//    return Meteor.call('scrapeTappedOut', url);
//};
//


//function parseMtgDbResponse(mtgDbCardResult){
//    //console.log("\n\n\n\n\n");
//    //console.log(JSON.stringify(mtgDbCardResult));
//    //console.log(Object.keys(mtgDbCardResult));
//
//    //Object.keys(mtgDbCardResult).forEach(function(id){
//    //  var card = mtgDbCardResult[id];
//    //});
//
//
//    //
//    var mtgCard = [-1, null];
//
//    if(mtgDbCardResult instanceof Array)
//    {
//        //console.log("Parsing an array");
//        //Get the most recent printing of the card
//        mtgDbCardResult.forEach(function(cardPrinting){
//            if(cardPrinting.setNumber > mtgCard[0]){
//                mtgCard[0] = cardPrinting.setNumber;
//                mtgCard[1] = cardPrinting;
//            }
//        });
//
//        if(mtgCard[0] === -1){
//            return mtgDbCardResult[0];
//        }else{
//            return mtgCard[1];
//        }
//    }
//}


if(Meteor.isServer){

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

            console.log("Got " + cardsCollection.length + "cards");

            //cardsCollection.forEach(function(card){
            //  var safeCardname =  encodeURIComponent(card.name.replace(':', ''));
            //  var apiCard = lookupApiFunc(safeCardname);
            //  if(apiCard) card.apiCard = apiCard;
            //});

            return cardsCollection;
        },
        apiLookup: function(sanitizedCardName){

            var myFuture = new Future();

            if(!sanitizedCardName) return [];
            var safeurl = "http://api.mtgdb.info/cards/" + sanitizedCardName;
            Meteor.http.get(safeurl, function(error, result){
                if(error){
                    myFuture.throw(error);
                }

                var parsedResult = parseMtgDbResponse(JSON.parse(result.content));
                myFuture.return(parsedResult);
            });

            return myFuture.wait();
        }
    });
}