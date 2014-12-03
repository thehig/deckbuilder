Template.play.helpers({
   game: function(){
       console.log(this);
       return this;
   },
    me: function(){
        return this.playerId === Meteor.userId();
    }
});

Template.play.events({
   'click button': function(evt, template){
       //console.log("Draw Card");
       Meteor.call('drawCard', Session.get("currentGame")._id, function(error, result){
           //console.log(Session.get("currentGame"));
       });
   }
});

Template.play_hand.helpers({
    cardsInHand: function(){
        var player = _.find(this.players, function(player){ return player.playerId === Meteor.userId()});
        return player.hand.map(function(cardId){
            return {
                card: Cards.findOne({_id: cardId}),
                tapped: false
            };
        });
    }
});

Template.play_card.helpers({
});

Template.play_layout.helpers({
    state: function () {
        return {
            untap: true,
            upkeep: false,
            draw: false,
            main1: false,
            combat: false,
            attackers: false,
            blockers: false,
            damage: false,
            main2: false,
            end: false
        }
    },
    players: function () {
        return Session.get('currentGame').players;
    },
    activePlayer: function () {
        if (this.players) return _.findWhere(this.players, {playerId: Meteor.userId()});
    }
});

Template.play_player_status.helpers({
    username: function(){ return Meteor.users.findOne({_id: this.playerId}).username; }
});