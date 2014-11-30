Template.play.helpers({
    activePlayer: function(){
        if(this.players) return _.findWhere(this.players, {playerId: Meteor.userId()});
    }
});

Template.play_player_details.helpers({
    username: function(){ return Meteor.users.findOne(this.playerId).emails[0].address; }
});