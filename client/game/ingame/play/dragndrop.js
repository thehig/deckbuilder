
interact('.draggable').draggable({
    onmove: function (event) {
        var target = event.target,
        // keep the dragged position in the data-x/data-y attributes
            x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
            y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;


        // translate the element
        target.style.webkitTransform =
            target.style.transform =
                'translate(' + x + 'px, ' + y + 'px)';

        // update the position attributes
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
    }
}).restrict({
    drag: 'parent',
    endOnly: true,
    elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
});

interact('.dropzone-stack').dropzone({
    accept: '.draggable',
    ondrop: function (event) {
        var data = Blaze.getData(event.relatedTarget);

        var moveInformation = {
            destination: 'stack',
            cardUid: data._id,
            gameId: Session.get('currentGame')._id
        };

        //console.log(moveInformation);
        Meteor.call('moveCard', moveInformation);
    }
});

interact('.dropzone-graveyard').dropzone({
    accept: '.draggable',
    ondrop: function (event) {
        var data = Blaze.getData(event.relatedTarget);


        var moveInformation = {
            destination: 'graveyard',
            cardUid: data._id,
            gameId: Session.get('currentGame')._id
        };

        //console.log(moveInformation);
        Meteor.call('moveCard', moveInformation);
    }
});

interact('.dropzone-exile').dropzone({
    accept: '.draggable',
    ondrop: function (event) {
        var data = Blaze.getData(event.relatedTarget);

        var moveInformation = {
            destination: 'exile',
            cardUid: data._id,
            gameId: Session.get('currentGame')._id
        };

        //console.log(moveInformation);
        Meteor.call('moveCard', moveInformation);
    }
});

interact('.dropzone-library').dropzone({
    accept: '.draggable',
    ondrop: function (event) {
        var data = Blaze.getData(event.relatedTarget);

        var moveInformation = {
            destination: 'library',
            cardUid: data._id,
            gameId: Session.get('currentGame')._id
        };

        //console.log(moveInformation);
        Meteor.call('moveCard', moveInformation);
    }
});

interact('.dropzone-land').dropzone({
    accept: '.draggable',
    ondrop: function (event) {
        var data = Blaze.getData(event.relatedTarget);

        var moveInformation = {
            destination: 'land',
            cardUid: data._id,
            gameId: Session.get('currentGame')._id
        };

        //console.log(moveInformation);
        Meteor.call('moveCard', moveInformation);
    }
});

interact('.dropzone-nonland').dropzone({
    accept: '.draggable',
    ondrop: function (event) {
        var data = Blaze.getData(event.relatedTarget);

        var moveInformation = {
            destination: 'nonland',
            cardUid: data._id,
            gameId: Session.get('currentGame')._id
        };

        console.log(moveInformation);
        Meteor.call('moveCard', moveInformation);
    }
});