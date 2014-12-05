Template.play_battlefield_table.helpers({
    notme: function (){
        var players = [];
        this.players.forEach(function(player){
           if (player.playerId !== Meteor.userId()){
               players.push(player);
           }
        });
        return players;
    },
    me: function (){
        return utils.game.me(this);
    }
});

Template.play_player_battlefield.helpers({
    mine: function(){ return this.playerId === Meteor.userId(); }
});

Template.play_field_cards.helpers({
    apicards: function(){
        return this.map(function(card){
            card.apicard = Cards.findOne({_id: card.cardId});
            return card;
        });
    }
});

Template.play_field_card.events({
    'dblclick img': function(){
        Meteor.call('tapCard', {
            gameId: Session.get('currentGame')._id,
            cardId: this._id
        });
    }
});

Template.play_apicard.helpers({
    mine: function(){ return this.owner === Meteor.userId(); },
    imagename: function(){ return this.apicard ? this.apicard.name.replace(' // ', '_') : undefined; }
});





















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
    imagename: function(){ return this.apicard ? this.apicard.name.replace(' // ', '_') : undefined; },
    mine: function() { return this.owner === Meteor.userId(); }
});
Template.play_card.events({
    'click img': function(evt, template){
        //console.log(this);
        //console.log(template.data);
        //Meteor.call('playCard', [Session.get('currentGame')._id, {
        //    _id: this._id,
        //    cardId: this.cardId
        //}]);
    },
    'mouseover img': function(evt, template){
        Session.set('selectedCard', this);
    }
});




/*

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
*/






Template.play_player_status.helpers({
    username: function(){ return utils.lookup.username(this.playerId); },
    mine: function() {return this.playerId === Meteor.userId();}
});

Template.play_player_status.events({
    'click .action-add-life': function(evt, template){
        Meteor.call('addLife', Session.get("currentGame")._id);
    },
    'click .action-subtract-life': function(evt, template){
        Meteor.call('subtractLife', Session.get("currentGame")._id);
    },
    'click .action-draw-card': function(evt, template){
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


//interact('.my-exile').dropzone({
//    accept: '.draggable',
//    ondrop: function (event) {
//        var data = Blaze.getData(event.relatedTarget);
//    }
//});


/*
// target elements with the "draggable" class
interact('.draggable')
    .draggable({
        // allow dragging of multple elements at the same time
        max: Infinity,

        // call this function on every dragmove event
        onmove: function (event) {
            var target = event.target,
            // keep the dragged position in the data-x/data-y attributes
                x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
                y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

            // translate the element
            target.style.webkitTransform =
                target.style.transform =
                    'translate(' + x + 'px, ' + y + 'px)';

            // update the posiion attributes
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
        },
        // call this function on every dragend event
        onend: function (event) {
            //console.log(event);
            //console.log(Blaze.getData(event.target));
            //console.log(event.target.$);

            //var textEl = event.target.querySelector('p');
            //
            //textEl && (textEl.textContent =
            //    'moved a distance of '
            //    + (Math.sqrt(event.dx * event.dx +
            //    event.dy * event.dy)|0) + 'px');
        }
    })
    // enable inertial throwing
    .inertia(true);
    // keep the element within the area of it's parent
    //.restrict({
    //    drag: 'parent',
    //    endOnly: true,
    //    elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
    //});

// allow more than one interaction at a time
interact.maxInteractions(1);

interact('.stack').dropzone({
    accept: '.draggable',
    ondropactivate: function (event) {
        // add active dropzone feedback
        event.target.classList.add('drop-active');
    },
    ondragenter: function (event) {
        var draggableElement = event.relatedTarget,
            dropzoneElement = event.target;

        // feedback the possibility of a drop
        dropzoneElement.classList.add('drop-target');
        draggableElement.classList.add('can-drop');
        draggableElement.textContent = 'Dragged in';
    },
    ondragleave: function (event) {
        // remove the drop feedback style
        event.target.classList.remove('drop-target');
        event.relatedTarget.classList.remove('can-drop');
        event.relatedTarget.textContent = 'Dragged out';
    },
    ondrop: function (event) {
        event.relatedTarget.textContent = 'Dropped';
        console.log("drop");
        console.log(Blaze.getData(event.relatedTarget));
    },
    ondropdeactivate: function (event) {
        // remove active dropzone feedback
        event.target.classList.remove('drop-active');
        event.target.classList.remove('drop-target');
    }
});*/
