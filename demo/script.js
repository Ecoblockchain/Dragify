const cardsList = ['card1', 'card2', 'card3'];

dragify({
  cardsList: cardsList,
  containment: '#cardStrip',
  handle: '.toolbar',
  cardContainerGutter: 8,
  zIndex: 1,
  placeholderCard: '#placeholderCard'
});
