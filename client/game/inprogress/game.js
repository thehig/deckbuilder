Template.game_inprogress.helpers({
   game: function(){
       console.log(this);
       return this;
   },
    me: function(){
        return this.playerId === Meteor.userId();
    }
});

Template.game_inprogress.events({
   'click button': function(evt, template){
       //console.log("Draw Card");
       Meteor.call('drawCard', Session.get("currentGame")._id, function(error, result){
           //console.log(Session.get("currentGame"));
       });
   }
});

Template.meTemplate.helpers({
    hand: function(){
        console.log(this);
        var hand = this.hand;
        return hand.map(function(card){
            return Cards.findOne({_id: card})
        });
    }
});

Template.play_card.helpers({
    card: function(){
        console.log(this);
    }
});

