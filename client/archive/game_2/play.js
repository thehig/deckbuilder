/*
Template.play.helpers({
    activePlayer: function(){
        if(this.players) return _.findWhere(this.players, {playerId: Meteor.userId()});
    },
    decks: function(){return Decks.find();},
    selectedDeck: function(){return Session.get('Selected_deck');}
});

Template.player_ready_indicator.events({
    'click button': function(evt, template){
        if(template.data.playerId === Meteor.userId()){
            //console.log(template.data);
            console.log(template.data.ready);// = true;
        }
    }
});

Template.play_player_details.helpers({
    username: function(){ return Meteor.users.findOne(this.playerId).username; }
});



Template.deck_listitem.helpers({
    age: function(){return moment(this.created).fromNow()},
    isOwner: function(){return this.createdBy === Meteor.userId()}
});

Template.deck_listitem.events({
   'click button': function(evt, template){
       Session.set('Selected_deck', template.data)
   }
});*/
