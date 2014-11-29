Template.play.helpers({
    gamesInProgress: function(){
        return Games.find();
    }
});

Template.player.helpers({
    username: function(){
        console.log(this);
        //return Meteor.users.findOne({_id: this._id});
    }
});