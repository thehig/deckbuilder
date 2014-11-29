//Template.decks.helpers({
//    decks: function(){
//        return Decks.find({createdBy: Meteor.userId()}).map(function(deck){
//            deck.age = moment(deck.created).fromNow();
//            return deck;
//        });
//    },
//    selectedDeck: function(){return Session.get('selectedDeck')}
//});
//
//Template.deck.helpers({
//    selectedDeck: function(){return Session.get('selectedDeck')},
//    mainboardDeck: function(){
//
//        var creature = [];
//        var instant = [];
//        var land = [];
//        var sorcery = [];
//        var enchantment = [];
//        var artifact = [];
//
//        Session.get('selectedDeck').mainboard.forEach(function(card){
//           if(card.category === 'creature') creature.push(card);
//           if(card.category === 'instant') instant.push(card);
//           if(card.category === 'land') land.push(card);
//           if(card.category === 'sorcery') sorcery.push(card);
//           if(card.category === 'enchantment') enchantment.push(card);
//           if(card.category === 'artifact') artifact.push(card);
//        });
//
//        var reduceQuantity = function(prev, current){return prev + parseInt(current.quantity)};
//
//        return {
//            creature : creature,
//            creatureCount: creature.reduce(reduceQuantity, 0),
//            instant : instant,
//            instantCount: instant.reduce(reduceQuantity, 0),
//            land : land,
//            landCount: land.reduce(reduceQuantity, 0),
//            sorcery : sorcery,
//            sorceryCount: sorcery.reduce(reduceQuantity, 0),
//            enchantment : enchantment,
//            enchantmentCount: enchantment.reduce(reduceQuantity, 0),
//            artifact : artifact,
//            artifactCount: artifact.reduce(reduceQuantity, 0),
//            cardCount: Session.get('selectedDeck').mainboard.reduce(reduceQuantity, 0)
//        };
//    }
//});
//
//Template.decks.events({
//    'click a': function(evt, template){
//        //console.log(this);
//
//        var completeCard = function(card){
//            if(!card.card) card.card = Cards.findOne({_id: card.card_id})
//            return card;
//        };
//
//        this.mainboard.cards = this.mainboard.map(completeCard);
//        this.sideboard.cards = this.sideboard.map(completeCard);
//
//        Session.set('selectedDeck', this);
//    }
//});
//
//
//



Template.decks_mydecks.helpers({
    mydecks: function(){return Decks.find();}
});

Template.decks_decklist_item.helpers({
    age: function(){return moment(this.created).fromNow()}
});







Template.decks_deckscraper.events({
    'click #load': function(evt, template){
        evt.preventDefault();

        Session.set('decks_loadingCards', true);
        Session.set('decks_cards', null);

        var tappedOutUrl = template.find('#ld-tappedouturl').value;
        Session.set('decks_deckOriginUrl', tappedOutUrl);

        Meteor.call('scrapeFromTappedOut', tappedOutUrl, function(error, result){
            console.log(JSON.stringify(result));

            Session.set('decks_loadingCards', false);
            Session.set('decks_cards', result);
        });
    },
    'click #save': function(evt, template){
        evt.preventDefault();

        var cards = Session.get('decks_cards');
        var deck = {
            name: template.find('#deck-name').value || 'New Deck',
            cards: cards,
            origin: Session.get('decks_deckOriginUrl')
        };

        Meteor.call('createDeck', deck);

        Session.set('decks_cards', null);
    }
});

Template.decks_deckscraper.helpers({
   loadingCards: function(){return Session.get('decks_loadingCards');},
   cards: function(){return Session.get('decks_cards');}
});