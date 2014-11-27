//if (Meteor.isClient) {
//  // counter starts at 0
//  Session.setDefault("counter", 0);
//
//  Template.hello.helpers({
//    counter: function () {
//      return Session.get("counter");
//    }
//  });
//
//  Template.hello.events({
//    'click button': function () {
//      // increment the counter when button is clicked
//      Session.set("counter", Session.get("counter") + 1);
//    }
//  });
//}
//
//if (Meteor.isServer) {
//  Meteor.startup(function () {
//    // code to run on server at startup
//  });
//}

if(Meteor.isClient){
  Session.set('loadingCards', false);

  function reduceQ(collection){
    var sum = 0;
    var cards = Session.get(collection);
    if(cards){
      cards.forEach(function(card){
        sum += parseInt(card.quantity);
      });
    }
    return sum;
  }

  Template.cardList.helpers({
    cards: function(){return Session.get('cards');},
    other: function(){return Session.get('other');},
    creatures: function(){return Session.get('creatures');},
    lands: function(){return Session.get('lands');},
    instants: function(){return Session.get('instants');},
    sorceries: function(){return Session.get('sorceries');},

    cardscount: function(){return reduceQ('cards')},
    creaturescount: function(){return reduceQ('creatures')},
    landscount: function(){return reduceQ('lands')},
    instantscount: function(){return reduceQ('instants')},
    sorceriescount: function(){return reduceQ('sorceries')}
  });



  // ======= Load Deck  Template ======
  Template.loadDeck.helpers({
    cards: function(){return Session.get('cards');},
    loadingCards: function(){return Session.get('loadingCards');}
  });


  Template.loadDeck.events({
    'click button': function(evt, template){
      evt.preventDefault();

      //console.log("Template data: " + JSON.stringify(template.data));

      Session.set('loadingCards', true);
      Session.set('cards', null);
      Session.set('other', null);
      Session.set('creatures', null);
      Session.set('lands', null);
      Session.set('instants', null);
      Session.set('sorceries', null);

      var tappedOutUrl = template.find('#ld-tappedouturl').value;

      Meteor.call('scrapeTappedout', tappedOutUrl, function(error, result){

        var creatures = [],
            lands = [],
            instants = [],
            sorceries = []
        ;
        result.maindeck.forEach(function(uniqueCard){
          var cardType = "" + uniqueCard["type"];
          var lowertype = cardType.toLowerCase();


          if(lowertype.indexOf('land') > -1) lands.push(uniqueCard);
          if(lowertype.indexOf('creature') > -1) creatures.push(uniqueCard);
          if(lowertype.indexOf('instant') > -1) instants.push(uniqueCard);
          if(lowertype.indexOf('sorcery') > -1) sorceries.push(uniqueCard);
        });

        Session.set('creatures', creatures);
        Session.set('lands', lands);
        Session.set('instants', instants);
        Session.set('sorceries', sorceries);
        Session.set('cards', result.maindeck);
        Session.set('other', result.other);
        Session.set('loadingCards', false);
      });
    }
  });
}

if(Meteor.isServer){
  $ = Meteor.npmRequire('cheerio');
  Future = Meteor.npmRequire('fibers/future');

  function lookupApiFunc (sanitizedCardName){

    var myFuture = new Future();

    if(!sanitizedCardName) return [];
    var safeurl = "http://api.mtgdb.info/cards/" + sanitizedCardName;
    //console.log("Getting " + safeurl);

    Meteor.http.get(safeurl, function(error, result){
      //console.log("Got " + safeurl);

      if(error){
        myFuture.throw(error);
        //console.log("Error getting " + safeurl);
        //console.log(" ----- Error: " + JSON.stringify(error));
        //console.log(" ----- Result: " + JSON.stringify(result));
      }

      var parsedResult = parseMtgDbResponse(JSON.parse(result.content));
      myFuture.return(parsedResult);
    });

    return myFuture.wait();
  }

  function parseMtgDbResponse(mtgDbCardResult){
    //console.log("\n\n\n\n\n");
    //console.log(JSON.stringify(mtgDbCardResult));
    //console.log(Object.keys(mtgDbCardResult));

    //Object.keys(mtgDbCardResult).forEach(function(id){
    //  var card = mtgDbCardResult[id];
    //});


    //
    var mtgCard = [-1, null];

    if(mtgDbCardResult instanceof Array)
    {
      //console.log("Parsing an array");
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
    lookupApi: lookupApiFunc,

    scrapeTappedout: function(url) {
      if(!url) return [];
      console.log("Getting " + url);

      var page = $.load(Meteor.http.get(url).content);

      //var boardContainer = $.load(page('.board-container'));
      //boardContainer('h3').each(function(key, value){
      //  var h3 = $.load(this);
      //  console.log(h3.text());
      //});
      console.log("Parsing");
      var sideboardHit = false;
      var cardsCollection = {
        maindeck: [],
        other: []
      };

      var pageLists = page('.board-container h3').each(function(i, el){
        var collection = $.load(el);

        var heading = collection('h3').text();
        if(heading.toLowerCase().indexOf('sorcery') > -1){
          sideboardHit = true;
        }

        var boardlist = collection('h3').next().hasClass('.boardlist');
        ($.load(boardlist))('.member').each(function(i, el){
          console.log("\n\n\n");
          console.log(i);
        });

        //boardlist('.member').each(function(i, el){
        //  console.log(i);
        //});

        //collection('h3').next().('.boardlist .member').each(function(i, el){
        //  console.log(i);
        //  //var member = $.load(el);
        //  //var card = {};
        //  //member('a').each(function(j, element){
        //  //  var a = $.load(element);
        //  //  card[j] = a('a').text();
        //  //});
        //  //
        //  //if(!sideboardHit)
        //  //  cardsCollection.maindeck.push(card);
        //  //else
        //  //  cardsCollection.other.push(card);
        //});

      });

      console.log("Got " + cardsCollection.maindeck.length + " maindeck and " + cardsCollection.other.length + " other");

      var apiParsedCards = {
        maindeck: [],
        other: []
      };

      //todo refactor this
      cardsCollection.maindeck.forEach(function(card){
        var safeCardname =  encodeURIComponent(card[1].replace(':', ''));
        //console.log("Getting API object " + card[1]);
        var apiCard = lookupApiFunc(safeCardname);
        //console.log("Got API object " + card[1] + " : " + apiCard);
        if(apiCard){
          //console.log("Got API card");
          apiCard.quantity = card[0].toLowerCase().replace('x', '');
          apiParsedCards.maindeck.push(apiCard);
        }
      });

      cardsCollection.other.forEach(function(card){
        var safeCardname =  encodeURIComponent(card[1].replace(':', ''));
        //console.log("Getting API object " + card[1]);
        var apiCard = lookupApiFunc(safeCardname);
        //console.log("Got API object " + card[1] + " : " + apiCard);
        if(apiCard){
          //console.log("Got API card");
          apiCard.quantity = card[0].toLowerCase().replace('x', '');
          apiParsedCards.other.push(apiCard);
        }
      });

      console.log("Returning " + (apiParsedCards.maindeck.length + apiParsedCards.other.length) + " cards");
      return apiParsedCards;
    }
  });
}