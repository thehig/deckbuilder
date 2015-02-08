FS = Meteor.npmRequire('fs');

var planes = process.env.PWD + "/public/images/planechase/";
FS.readdir(planes, function (err, files){
	console.log(files);
})
console.log("Planechase...")