
Session.set('loadingCards', false);

Template.cardList.helpers({
    cards: function(){return Session.get('cards');}
});

Template.loadDeck.helpers({
    cards: function(){return Session.get('cards');},
    loadingCards: function(){return Session.get('loadingCards');}
});

Template.loadDeck.events({
    'click #load': function(evt, template){
        evt.preventDefault();

        Session.set('loadingCards', true);
        Session.set('cards', null);
        var tappedOutUrl = template.find('#ld-tappedouturl').value;

        Meteor.call('scrapeFromTappedOut', tappedOutUrl, function(error, result){
            console.log(JSON.stringify(result));

            Session.set('loadingCards', false);
            Session.set('cards', result);
        });

    },
    'click #save': function(evt, template){
        evt.preventDefault();

        var cards = Session.get('cards');
        var deck = {
            name: template.find('#deck-name').value || 'New Deck',
            cards: cards
        };

        Meteor.call('createDeck', deck);
    }
});