/*
Template.games_in_progress.helpers({
   game_in_progress: function() {return Games.find({'inProgress': true}); }
});

Template.game_status.helpers({
   playerA: function() {
       if(this.players)
        return Meteor.users.findOne({_id: this.players[0].playerId});
   },
   playerB: function() {
       if(this.players)
        return Meteor.users.findOne({_id: this.players[1].playerId});
   },
   last_activity: function() {
        return moment(this.lastActivity).fromNow();
   }
});

//Template.game_status.events({
//    'click': function(evt, template){
//        Meteor.call('deleteGame', template.data._id);
//    }
//});








// === User List ===
Template.game_userlist.helpers({
    online_users: function(){ return Meteor.users.find({ "status.online": true , _id: { $not: Meteor.userId()} }); },
    idle_users: function(){ return Meteor.users.find({ "status.idle": true }); }
});


Template.game_user.events({
    'click button': function(evt, template){
        //Challenge opponent
        Meteor.call('createGame', template.data._id);
    }
});
*/
