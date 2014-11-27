Router.configure({
    layoutTemplate: 'layout'
});

Router.map(function() {
    this.route('home', {path: '/'});
    this.route('build', {path: '/build'});
    this.route('decks', {path: '/decks'});
});