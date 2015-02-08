var loadData = false;

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
}


