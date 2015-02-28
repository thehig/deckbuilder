Template.plane.helpers({
	gameInProgress: function(){
		var game = PlaneGames.findOne({startedBy: Meteor.userId()});
		/*if(game){
			game.cards = game.cards.map(function(card){
				return Planes.findOne({_id: card});
			});
		}
		console.log(game);*/
		return game;
	},
	planes: function (){
		console.log("Planes");
		return Planes.find({});
	}
})

Template.plane.events({
	'click #startplanechase': function (evt, template){
		evt.preventDefault();
		var categories = [];
		$('input[name=planechoice]:checked').each(function() {
			categories.push(Blaze.getData(this)._id);
		});

		Meteor.call('createPlanechaseGame', categories, function(err, data){
			// console.log(data);
		});
	},
	'click .action-next-plane': function(evt, template){
		evt.preventDefault();

		$('.plane-img').addClass('hidden');

		Meteor.call('drawNextPlane', function(err, data){

		});
	},
	'click .action-end-plane': function(evt, template){
		evt.preventDefault();
		Meteor.call('destroyPlanechaseGame', function(err, data){

		});
	}
});

Template.vplanecontrols.helpers({
	count: function(){
		// this: planeGame
		return this.planedeck.length;
	}
});

Template.vplanegraveyard.helpers({
	yard: function() {
		return [].concat(this.planegraveyard);
	}
});


Template.vplanedeck.helpers({
	count: function(){
		// this: planeGame
		return this.planedeck.length;
	}
});

Template.vplanecard.helpers({
	me: function(){
		var id = "" + this;
		return Planes.findOne({_id: id});
	}
});

Template.vplanecardimg.helpers({
	me: function(){
		var id = "" + this;
		return Planes.findOne({_id: id});
	}
});

Template.vplanecardimg.events({
	'load img': function(evt, template){
		$('.plane-img').removeClass('hidden');
	}
});