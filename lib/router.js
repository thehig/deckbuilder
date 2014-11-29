Router.configure({
    layoutTemplate: 'layout'
});

Router.map(function() {
    this.route('home', {path: '/'});

    this.route('decks', {path: '/decks'});
    this.route('browseDeck', {
        path: 'browseDeck/:_id',
        data: function(){
            var deck = Decks.findOne(this.params._id);

            if(deck){
                return deck;
            }
        }
    });

    this.route('game', {path: '/game'});
    this.route('play', {path: '/play'});
});