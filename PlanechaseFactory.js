
if(Meteor.isServer){
	/*var loadData = false;

	function parseFiles (err, files){
		files.forEach(function(filename){
			var lenOfTail = 7; // '.hq.jpg'
			var name = filename.substr(0, filename.length - lenOfTail);

			var plane = Planes.findOne({name: name});
			if(!plane || !plane._id)
			{ 
				Planes.insert({created: new Date(), name: name});
				console.log("Created " + name);
			}
		})
	}

	if(loadData){
		console.log("Loading Planechase Data")
		FS = Meteor.npmRequire('fs');

		var planes = process.env.PWD + "/public/images/planechase/";
		FS.readdir(planes, Meteor.bindEnvironment(parseFiles));
	}*/


	Meteor.methods({
		createPlanechaseGame: function (desiredCards){
			return PlaneGames.insert({
				startedBy: Meteor.userId(),
				startedAt: new Date(),
				planedeck: _.shuffle(desiredCards),
				planecurrent: undefined,
				planegraveyard: [],
				finished: false
			});
		},
		destroyPlanechaseGame: function(){
			PlaneGames.remove({startedBy: Meteor.userId()});
		},
		drawNextPlane: function(){
			var planegame = PlaneGames.findOne({startedBy: Meteor.userId()});
			if(!planegame) return;
			if(planegame.planecurrent) planegame.planegraveyard.push(planegame.planecurrent);
			planegame.planecurrent = planegame.planedeck.pop();
			PlaneGames.update({_id: planegame._id}, planegame);
		}
	})	
}
