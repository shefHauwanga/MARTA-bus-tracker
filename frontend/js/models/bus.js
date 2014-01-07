List.Bus = DS.Model.extend({
  id: DS.attr('string'),
  route: DS.attr('string'),
  latitude: DS.attr('string'),
  longitutde: DS.attr('string'),
  direction: DS.attr('string'),
  nextStop: DS.attr('string'),
  adherence: DS.attr('string'),
  trip: DS.attr('string'),
  creationTime: DS.attr('string'),
  title: DS.attr('string')
});

List.Bus.FIXTURES = [];
