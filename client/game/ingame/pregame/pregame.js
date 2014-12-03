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
    username: function(){return Meteor.users.findOne({_id: this.playerId}).username; },
    deckname: function(){
        var deck = Decks.findOne({_id: this.deckId});
        return deck ? deck.name : "Undecided";
    }
});
Template.pregame_player_tabledata.events({
    'click .btn-action-ready': function(evt, template){
        var game = Session.get('currentGame');
        //var player = game.players.findOne({playerId: Meteor.userId()});
        game.players.forEach(function(player){
            if(player.playerId === Meteor.userId()){
                player.ready = !player.ready;
                Meteor.call('updateGame', game);
                return;
            }
        });
    }
});


// Deck Selector dropdown list
Template.pregame_deckdropdown.helpers({
    decks: function(){ return Decks.find(); },
    deckname: function() {
        var deck = Decks.findOne({_id: this.deckId});
        if(deck)
            return deck.name;
        return "Undecided";
    }
});
Template.pregame_deckdropdown.events({
    'click .game-dc-dropdown-item': function(evt, template){
        var clickedDeckName = evt.target.innerText;
        var deck = Decks.findOne({name: clickedDeckName});
        //console.log(deck._id);
        //Meteor.call('chooseDeck', deck._id);

        var game = Session.get('currentGame');
        //var player = game.players.findOne({playerId: Meteor.userId()});
        game.players.forEach(function(player){
            if(player.playerId === Meteor.userId()){
                player.deckId = deck._id;
                Meteor.call('updateGame', game);
                return;
            }
        });
    }
});