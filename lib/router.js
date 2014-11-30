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

    this.route('play', {
        path: '/game/:_id',
        data: function(){
            var game = Games.findOne({_id: this.params._id});
            console.log(game);
            return game;
        }}
    );
});