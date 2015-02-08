Template.plane.helpers({
	gameInProgress: function(){
		var game = PlaneGames.findOne({startedBy: Meteor.userId()});
		if(game){
			game.cards = game.cards.map(function(card){
				return Planes.findOne({_id: card});
			});
		}
		console.log(game);
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
			console.log(data);
		});
	}
})