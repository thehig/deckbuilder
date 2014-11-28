Decks = new Meteor.Collection('decks');
Cards = new Meteor.Collection('cards');

if(Meteor.isServer) {
    //Server side publishing of Decks
    Meteor.publish('decks', function () {
        return Decks.find();
    });//Server side publishing of Decks
    Meteor.publish('cards', function () {
        return Cards.find();
    });
    Meteor.publish('users', function () {
        return Meteor.users.find();
    });
}

if(Meteor.isClient){
    //Client side subscription
    Meteor.subscribe('decks');
    Meteor.subscribe('users');
    Meteor.subscribe('cards');
}
