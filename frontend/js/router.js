Buses.Router.map(function () {
  this.resource('list', function() {
    // additional child routes    
    this.route('buses');
    this.resource('trip', {path: '/trip/:trip_id'}, function() {
      this.route('bus', {path: '/bus/:bus_id'});
    });
  });
});

Buses.IndexRoute = Ember.Route.extend({
  redirect: function() {
    this.transitionTo('list.buses');
  }
});

Buses.ListBusesRoute = Ember.Route.extend({
  model: function () {
    return this.store.find('bus');
  }
});

Buses.ListTripRoute = Ember.Route.extend({
  model: function () {
    return this.store.find('trip', {trip: 'trip_id', bus: 'bus_id'});
  }
});
