Template.plane.helpers({
	planes: function (){
		console.log("Planes");
		return Planes.find({});
	}
})