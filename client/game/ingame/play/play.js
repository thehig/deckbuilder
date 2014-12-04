Template.play.helpers({
   game: function(){
       console.log(this);
       return this;
   },
    me: function(){
        return this.playerId === Meteor.userId();
    }
});


Template.play_hand.helpers({
    cardsInHand: function(){
        var player = utils.game.me(this);

        return player.hand.map(function(card){
            card.apicard = Cards.findOne({_id: card.cardId});
            return card;
        });
    }
});

Template.play_card.helpers({
    //Helper for cards like (Turn // Burn)
    imagename: function(){ return this.apicard ? this.apicard.name.replace(' // ', '_') : undefined; }
});
Template.play_card.events({
    'click img': function(evt, template){
        Meteor.call('playCard', [Session.get('currentGame')._id, {
            _id: this._id,
            cardId: this.cardId
        }]);
    },
    'mouseover img': function(evt, template){
        Session.set('selectedCard', this);
    }
});

Template.play_layout.helpers({
    state: function () {
        var turnstate = Session.get('turnstate');
        if(!turnstate) Session.set('turnstate', {
            untap: true,
            upkeep: false,
            draw: false,
            main1: false,
            combat: false,
            attackers: false,
            blockers: false,
            damage: false,
            main2: false,
            end: false
        });

        return turnstate;
    },
    players: function () {
        return Session.get('currentGame').players;
    },
    activePlayer: function () {
        return utils.game.me(this);
    },
    selectedCard: function(){return Session.get('selectedCard');}
});

Template.play_layout.events({
    'click .btn-turnstate-action': function(evt, template){

        var turnstate = Session.get('turnstate');

        if(turnstate){

            if(turnstate.untap) {
                turnstate.untap = false;
                turnstate.upkeep = true;
            }else if(turnstate.upkeep){
                turnstate.upkeep = false;
                turnstate.draw = true;
            }else if(turnstate.draw){
                turnstate.draw = false;
                turnstate.main1 = true;
            }else if(turnstate.main1){
                turnstate.main1 = false;
                turnstate.combat = true;
            }else if(turnstate.combat){
                turnstate.combat = false;
                turnstate.attackers = true;
            }else if(turnstate.attackers){
                turnstate.attackers = false;
                turnstate.blockers = true;
            }else if(turnstate.blockers){
                turnstate.blockers = false;
                turnstate.damage = true;
            }else if(turnstate.damage){
                turnstate.damage = false;
                turnstate.main2 = true;
            }else if(turnstate.main2){
                turnstate.main2 = false;
                turnstate.end = true;
            }else if(turnstate.end){
                turnstate.end = false;
                turnstate.untap = true;
            }

            Session.set('turnstate', turnstate);
        }
    }
});

Template.play_player_status.helpers({
    username: function(){ return utils.lookup.username(this.playerId); },
    mine: function() {return this.playerId === Meteor.userId();}
});

Template.play_player_status.events({
    'click .btn-add-life-action': function(evt, template){
        Meteor.call('addLife', Session.get("currentGame")._id);
    },
    'click .btn-subtract-life-action': function(evt, template){
        Meteor.call('subtractLife', Session.get("currentGame")._id);
    },
    'click .btn-draw-card-action': function(evt, template){
        Meteor.call('drawCard', Session.get("currentGame")._id);
    }
});

Template.play_stack.helpers({
   stack: function() {
       return Session.get('currentGame').gameState.stack.map(function(card){
           card.apicard = Cards.findOne({_id: card.cardId});
           return card;
       });
   }
});