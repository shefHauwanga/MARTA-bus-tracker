Buses.BusesController = Ember.ArrayController.extend({
  page: 1,
  per_page: 10,
  totalPages: (function() {
    return Math.ceil(this.get('length')/this.get('per_page'));
  }).property('length, per_page'),
  pages: (function() {
    var collection = Ember.A();

    for(var i = 0; i < this.get('totalPages'); i++){
      collection.pushObject(Ember.Object.create({
        number: i + 1
      }));
    }
    return collection;
  }).property('totalPages'),
  prevPage: (function() {
    var page = this.get('page');
    var totalPages = this.get('totalPages');

    if(page > 1 && totalPages > 1){
      return page - 1;
    } else {
      return null;
    }
  }).property('page', 'totalPages'),
  nextPage: (function() {
    var page = this.get('page');
    var totalPages = this.get('totalPages');

    if(page < totalPages && totalPages > 1){
      return page + 1;
    } else {
      return null;
    }
  }).property('page', 'totalPages'),
  paginatedContent: (function() {
    var start = (this.get('page') - 1) * this.get('per_page');
    var end = start + this.get('per_page');
    
    return this.get('content').slice(start, end);
  }).property('page', 'totalPages', 'content.[]'),
  selectPage: function(number) {
    this.set('page', number);
  },
  hasPrev: (function(){
    var page = this.get('page');

    if(page > 1)
      return true;
    else
      return false;
  }).property('hasPrev'),
  hasNext: (function() {
    var page = this.get('page');
    if(this.totalPages <= (page + 1))
      return false;
    else
      return true;
  }).property('hasNext')
});
