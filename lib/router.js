Router.configure({
    layoutTemplate: 'layout'
});

Router.map(function() {
    this.route('home', {path: '/'});

    this.route('decks', {path: '/decks'});
    this.route('browseDeck', {
        path: 'browseDeck/:_id',
        data: function(){
            return utils.lookup.deck(this.params._id);
        }
    });

    this.route('gameselector', {path: '/game'});

    this.route('game', {
        path: '/game/:_id',
        data: function(){
            //If router not ready, return
            if(!this.ready()){
                return;
            }

            ////If no Id, go home
            //if(!this.params._id) {
            //    this.redirect('/');
            //    return;
            //}

            //Lookup the game
            var game = Games.findOne({_id: this.params._id});
            Session.set('currentGame', game);
            return game;
        }}
    );
});