// === decks_mydecks ===
Template.decks_mydecks.helpers({
    mydecks: function(){return Decks.find();}
});

// == decks_decklist_item ===
Template.decks_decklist_item.helpers({
    age: function(){return moment(this.created).fromNow()},
    owner: function() {return utils.lookup.username(this.createdBy);},
    isOwner: function(){return this.createdBy === Meteor.userId()}
});
Template.decks_decklist_item.events({
    'click .action-delete-deck': function(){
        Meteor.call('deleteDeck', this._id);
    },
    'click .action-browse-deck ': function(){
        Router.go('/browseDeck/' + this._id);
    }
});

// == decks_deckscraper ===
Template.decks_deckscraper.helpers({
   loadingCards: function(){return Session.get('decks_loadingCards');},
   cards: function(){return Session.get('decks_cards');}
});
Template.decks_deckscraper.events({
    'click #load': function(evt, template){
        evt.preventDefault();

        Session.set('decks_loadingCards', true);
        Session.set('decks_cards', null);

        var tappedOutUrl = template.find('#ld-tappedouturl').value;
        Session.set('decks_deckOriginUrl', tappedOutUrl);

        Meteor.call('scrapeFromTappedOut', tappedOutUrl, function(error, result){
            //todo: Do something with the error
            Session.set('decks_loadingCards', false);
            Session.set('decks_cards', result);
        });
    },
    'click #save': function(evt, template){
        evt.preventDefault();

        Meteor.call('createDeckAsync', {
            name: template.find('#deck-name').value || 'New Deck',
            cards: Session.get('decks_cards'),
            origin: Session.get('decks_deckOriginUrl')
        });

        Session.set('decks_cards', null);
    }
});