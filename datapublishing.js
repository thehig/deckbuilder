Decks = new Meteor.Collection('decks');

if(Meteor.isServer) {
    //Server side publishing of Decks
    Meteor.publish('decks', function () {
        return Decks.find();
    });
    Meteor.publish('users', function () {
        return Meteor.users.find();
    });
}

if(Meteor.isClient){
    //Client side subscription
    Meteor.subscribe('decks');
    Meteor.subscribe('users');
}
