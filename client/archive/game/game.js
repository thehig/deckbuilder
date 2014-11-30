//Template.game.helpers({
//    selectedDeck: function(){return Session.get('selectedDeck');},
//    opponents: function(){
//        var myId = Meteor.userId(),
//            cantPlayAgainst = [myId];
//
//        //Games.find({inProgress: true}).forEach(function(game){
//        //    cantPlayAgainst.push(otherId(game));
//        //});
//
//        //MongoDB query
//        return Meteor.users.find({ _id: { $not: { $in: cantPlayAgainst}}});
//    }
//});
//
//Template.gameOpponent.helpers({
//    username: function(){
//        return this.emails[0].address;
//    }
//});
//
//Template.gameOpponent.events({'click button': function(evt, template){
//    var game = GameFactory.createGame([Meteor.userId(), this._id]);
//    Meteor.call('createGame', game);
//}});
