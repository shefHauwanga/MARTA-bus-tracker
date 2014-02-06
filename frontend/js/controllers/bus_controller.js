Buses.BusController = Ember.ObjectController.extend({
  isFirst: function(key, value) {
    var model = this.get('model');

    return key === 0 ? 'top-list-item': '';
  }.property('model.isFirst'),
  isTimely: function(key, value){
    var model = this.get('model');
    
    return parseInt(this.get('adherence')) === 0 ? true : false;
  }.property('model.isTimely'),
  absoluteAdherence: function(key, value){
    var model = this.get('model');

    return Math.abs(parseInt(this.get('adherence')));
  }.property('model.absoluteAdherence'),
  lateOrEarly: function(key, value){
    var model = this.get('model');

    return parseInt(this.get('adherence')) < 0 ? 'late' : 'early';
  }.property('model.lateOrEarly'),
  adherenceColor: function(key, value){
    var model = this.get('model');
    var adherence = parseInt(this.get('adherence'));
    var adherenceClass = 'late';

    if(adherence > 0){
      adherenceClass = 'early';
    } else {
      if(adherence > -2)
        adherenceClass = 'late';
      else
        adherenceClass = 'veryLate';
    }
    
    return adherenceClass;
  }.property('model.adherenceColor'),
  inflection: function(key, value){
    var model = this.get('model');

    return Math.abs(parseInt(this.get('adherence'))) === 1 ? 'minute' : 'minutes';
  }.property('model.inflection')
});
