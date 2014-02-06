Buses.Router.map(function () {
  this.resource('buses', { path: '/' }, function() {
    // additional child routes    
  });
  //this.route('buses');
});

/*Buses.IndexRoute = Ember.Route.extend({
  redirect: function() {
    this.transitionTo('buses');
  }
});*/

Buses.BusesRoute = Ember.Route.extend({
  model: function () {
    return this.store.find('bus');
  }
});
