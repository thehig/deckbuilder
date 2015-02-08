Template.plane.helpers({
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
			categories.push($(this).val());
		});


		console.log("Ready " + categories);
	}
})