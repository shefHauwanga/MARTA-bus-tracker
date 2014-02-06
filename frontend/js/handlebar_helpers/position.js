var positionCounter = 0;
Handlebars.registerHelper('position', function() {
  
  if(positionCounter++ % 10 === 0 )
    return 'top-list-item';
  else
    return '';
});
