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
    hand: function(){
        console.log(this);
        var hand = this.hand;
        return hand.map(function(card){
            return Cards.findOne({_id: card});
        });
    }
});

Template.play_card.helpers({
    card: function(){
        console.log(this);
    }
});

Template.play_layout.helpers({
  state: function(){
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
      end: false,
    }
  }
});