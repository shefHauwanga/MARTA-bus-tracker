List.Router.map(function () {
  this.resource('buses', { path: '/' }, function() {
    // additional child routes    
  });
});

List.BusesRoute = Ember.Route.extend({
  model: function () {
    return this.store.find('bus');
  }
});
