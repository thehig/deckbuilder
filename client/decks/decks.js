Template.decks.helpers({
    decks: function(){
        return Decks.find({createdBy: Meteor.userId()}).map(function(deck){
            deck.age = moment(deck.created).fromNow();
            return deck;
        });
    },
    selectedDeck: function(){return Session.get('selectedDeck')}
});

Template.deck.helpers({
    selectedDeck: function(){return Session.get('selectedDeck')},
    mainboardDeck: function(){

        var creature = [];
        var instant = [];
        var land = [];
        var sorcery = [];
        var enchantment = [];
        var artifact = [];

        Session.get('selectedDeck').mainboard.forEach(function(card){
           if(card.category === 'creature') creature.push(card);
           if(card.category === 'instant') instant.push(card);
           if(card.category === 'land') land.push(card);
           if(card.category === 'sorcery') sorcery.push(card);
           if(card.category === 'enchantment') enchantment.push(card);
           if(card.category === 'artifact') artifact.push(card);
        });

        var reduceQuantity = function(prev, current){return prev + parseInt(current.quantity)};

        return {
            creature : creature,
            creatureCount: creature.reduce(reduceQuantity, 0),
            instant : instant,
            instantCount: instant.reduce(reduceQuantity, 0),
            land : land,
            landCount: land.reduce(reduceQuantity, 0),
            sorcery : sorcery,
            sorceryCount: sorcery.reduce(reduceQuantity, 0),
            enchantment : enchantment,
            enchantmentCount: enchantment.reduce(reduceQuantity, 0),
            artifact : artifact,
            artifactCount: artifact.reduce(reduceQuantity, 0),
            cardCount: Session.get('selectedDeck').mainboard.reduce(reduceQuantity, 0)
        };
    }
});

Template.decks.events({
    'click a': function(evt, template){
        //console.log(this);

        var completeCard = function(card){
            card.card = Cards.findOne({_id: card.card_id})
            return card;
        };

        this.mainboard.cards = this.mainboard.map(completeCard);
        this.sideboard.cards = this.sideboard.map(completeCard);

        Session.set('selectedDeck', this);
    }
});


