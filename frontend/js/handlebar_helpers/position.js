var positionCounter = 1;
Handlebars.registerHelper('position', function() {
  
  //if(positionCounter++ % 10 === 0 )
  if(positionCounter++ === 1)
    return 'top-list-item';
  else
    return '';
});
