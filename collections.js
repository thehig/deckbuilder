Decks = new Meteor.Collection('decks');
Cards = new Meteor.Collection('cards');
Games = new Meteor.Collection('games');
Planes = new Meteor.Collection('planes');

if(Meteor.isServer) {
    //Server side publishing of Decks
    Meteor.publish('decks', function () {
        return Decks.find();
    });//Server side publishing of Decks
    Meteor.publish('cards', function () {
        return Cards.find();
    });
    Meteor.publish('games', function () {
        return Games.find();
    });
    Meteor.publish('planes', function () {
        return Planes.find();
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
    Meteor.subscribe('games');
    Meteor.subscribe('planes');

    // Set the automatic login prompts to request usernames only for brevity
    Accounts.ui.config({
        passwordSignupFields: "USERNAME_ONLY"
    });
}

