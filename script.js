const cardsList = ['card1', 'card2', 'card3'];
const cardStripGutter = 8;

cardsList.forEach(function(card) {
  initDraggable($('#' + card));
});
