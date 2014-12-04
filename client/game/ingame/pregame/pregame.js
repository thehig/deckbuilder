//<!-- Game destination with a valid game parameter -->

// Pregame
Template.pregame.helpers({
    allPlayersReady: function(){
        if(this && this.players && this.players.length > 0){
            return this.players.reduce(function(a, b){
                return (a.ready || a) && b.ready;
            }, true);
        }
    }
});
Template.pregame.events({
    'click .startGame': function(evt, template){
        var game = Session.get('currentGame');
        Meteor.call('startGame', game._id);
    }
});


// Individual Player Table-Data
Template.pregame_player_tabledata.helpers({
    mine: function(){return this.playerId === Meteor.userId();},
    username: function(){return utils.lookup.username(this.playerId);},
    deckname: function(){
        var deckname = utils.lookup.deckname(this.deckId);
        return deckname ? deckname : "Undecided";
    }
});
Template.pregame_player_tabledata.events({
    'click .btn-action-ready': function(evt, template){
        var game = Session.get('currentGame');
        Meteor.call('playerReady', game._id);
    },
    'click .action-browse-deck': function(evt, template){
        Router.go('/browseDeck/' + this.deckId);
    }
});


// Deck Selector dropdown list
Template.pregame_deckdropdown.helpers({
    decks: function(){ return Decks.find(); },
    deckname: function() {
        var deckname = utils.lookup.deckname(this.deckId);
        return deckname ? deckname : "Undecided";
    }
});
Template.pregame_deckdropdown.events({
    'click .game-dc-dropdown-item': function(evt, template){
        var clickedDeckName = $(evt.target).text();
        var deck = Decks.findOne({name: clickedDeckName});
        var game = Session.get('currentGame');
        Meteor.call('chooseDeck', [game._id, deck._id]);
    }
});