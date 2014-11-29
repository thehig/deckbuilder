var reduceFunction = function(a, b){return a + parseInt(b.quantity);};

var where = function(array, cardtype){
    return _.where(array, {category: cardtype}).map(function(card){
        card.card = Cards.findOne({_id: card.card_id});
        return card;
    });
};

Template.browseDeck.helpers({
    age: function(){ return moment(this.created).fromNow()},
    creator: function(){
        var user = Meteor.users.findOne({_id: this.createdBy});
        if(user)return user.emails[0].address;
        return "Unknown";
    },
    mainboard_cardcount: function(){
        return this.mainboard ? this.mainboard.reduce(reduceFunction, 0) : 0;
    },
    creature:       function(){ return where(this.mainboard, 'creature');},
    land:           function(){ return where(this.mainboard, 'land');},
    instant:        function(){ return where(this.mainboard, 'instant');},
    sorcery:        function(){ return where(this.mainboard, 'sorcery');},
    enchantment:    function(){ return where(this.mainboard, 'enchantment');},
    artifact:       function(){ return where(this.mainboard, 'artifact');},

    creature_count:       function(){ return where(this.mainboard, 'creature').reduce(reduceFunction, 0);},
    land_count:           function(){ return where(this.mainboard, 'land').reduce(reduceFunction, 0);},
    instant_count:        function(){ return where(this.mainboard, 'instant').reduce(reduceFunction, 0);},
    sorcery_count:        function(){ return where(this.mainboard, 'sorcery').reduce(reduceFunction, 0);},
    enchantment_count:    function(){ return where(this.mainboard, 'enchantment').reduce(reduceFunction, 0);},
    artifact_count:       function(){ return where(this.mainboard, 'artifact').reduce(reduceFunction, 0);}
});
