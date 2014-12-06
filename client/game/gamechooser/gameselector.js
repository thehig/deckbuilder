//<!-- Game destination without a parameter -->
Template.gameselector.helpers({
    gamesInProgress: function(){ return Games.find({finished: false})}, //{inProgress: true}
    usersOnline: function() { return Meteor.users.find({ "status.online": true , _id: { $not: Meteor.userId()} }); }
});

Template.gameselector_game_row.helpers({
    players: function(){
        //Iterate through the players, look them up and return their usernames
        return this.players.map(function(player){
            return utils.lookup.username(player.playerId);
        }).join(' vs ');
    },
    lastActivity: function(){
        return moment(this.lastActivity).fromNow();
    },
    playerInGame: function(){
        return _.findWhere(this.players, {playerId: Meteor.userId()});
    }
});

Template.gameselector_game_row.events({
    'click .action-join-game': function(evt, template){
        Router.go('/game/' + this._id);
    }
});


Template.gameselector_player_row.helpers({
    lastActivity: function(){
        console.log(this);
        return moment(this.status.lastLogin.date).fromNow();
    }
});

Template.gameselector_player_row.events({
    'click button': function(evt, template){
        Meteor.call('createGame', template.data._id);
    }
});