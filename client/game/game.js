


// Player Status
Template.game_pregame_player_status.helpers({
    mine: function(){return this.playerId === Meteor.userId();},
    username: function(){return Meteor.users.findOne({_id: this.playerId}).username; },
    deckname: function(){
        var deck = Decks.findOne({_id: this.deckId});
        return deck ? deck.name : "Undecided";
    }
});

Template.game_pregame_player_status.events({
    'click .btn-action-ready': function(evt, template){
        console.log(this);

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



// Deck Selector
Template.game_dc_dropdown.helpers({
    decks: function(){ return Decks.find(); },
    deckname: function() {
        var deck = Decks.findOne({_id: this.deckId});
        if(deck)
            return deck.name;
        return "Undecided";
    }
});

Template.game_dc_dropdown.events({
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

































//<!-- Game destination without a parameter -->
Template.game.helpers({
    gamesInProgress: function(){ return Games.find()}, //{inProgress: true}
    usersOnline: function() { return Meteor.users.find({ "status.online": true , _id: { $not: Meteor.userId()} }); }
});

Template.game_row.helpers({
    players: function(){
        //Iterate through the players, look them up and return their usernames
        return this.players.map(function(player){
            return Meteor.users.findOne({_id: player.playerId}).username
        }).join(',');
    },
    lastActivity: function(){
        return moment(this.lastActivity).fromNow();
    }
});

Template.game_row.events({
    'click': function(evt, template){
        Router.go('/game/' + this._id);
    }
});

Template.game_player_row.events({
    'click button': function(evt, template){
        Meteor.call('createGame', template.data._id);
    }
});





//<!-- Game destination with a valid game parameter -->


// Pregame
Template.game_pregame.helpers({
    allPlayersReady: function(){
        if(this && this.players && this.players.length > 0){
            return this.players.reduce(function(a, b){
                return (a.ready || a) && b.ready;
            }, true);
        }
    }
});

Template.game_pregame.events({
    'click .startGame': function(evt, template){
        var game = Session.get('currentGame');
        Meteor.call('startGame', game._id);
    }
});



Template.game_deckselector_dropdown.events({
    'change': function(evt, template){
        //console.log(this);
        if(evt.target.selectedIndex > 0){
            var clickedDeckName = evt.target.selectedOptions[0].innerText;
            //console.log(clickedDeckName);
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
    }
});