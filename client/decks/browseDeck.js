/**
 * Reduce an array of cards to a single quantity value by adding the quantities together
 * @param prev
 * @param current
 * @returns {*}
 */
var toQuantity = function(prev, current){return prev + parseInt(current.quantity);};

/**
 * Return only cards from the array that have the corresponding cardtype
 * @param array
 * @param cardtype
 * @returns {Array|any}
 */
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
        if(user) return user.username;
        return "Unknown";
    },



    creature:             function(){ return where(this.mainboard, 'creature');},
    land:                 function(){ return where(this.mainboard, 'land');},
    instant:              function(){ return where(this.mainboard, 'instant');},
    sorcery:              function(){ return where(this.mainboard, 'sorcery');},
    enchantment:          function(){ return where(this.mainboard, 'enchantment');},
    artifact:             function(){ return where(this.mainboard, 'artifact');},

    mainboard_count:      function(){ return this.mainboard ? this.mainboard.reduce(toQuantity, 0) : 0;},
    creature_count:       function(){ return where(this.mainboard, 'creature').reduce(toQuantity, 0);},
    land_count:           function(){ return where(this.mainboard, 'land').reduce(toQuantity, 0);},
    instant_count:        function(){ return where(this.mainboard, 'instant').reduce(toQuantity, 0);},
    sorcery_count:        function(){ return where(this.mainboard, 'sorcery').reduce(toQuantity, 0);},
    enchantment_count:    function(){ return where(this.mainboard, 'enchantment').reduce(toQuantity, 0);},
    artifact_count:       function(){ return where(this.mainboard, 'artifact').reduce(toQuantity, 0);}
});
