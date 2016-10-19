'use strict';

var pinnedCards = ['card1', 'card2', 'card3'];
var cardStripGutter = 8;

/**
 * Initializes jQuery UI draggable plugin - https://jqueryui.com/draggable/.
 * @param $card - jQuery selector of viz card
 */
function initDraggable($card) {
  const _this = this;
  let _$prevCard, _$nextCard, _$selectedCard;
  let prevCardOldPosition, prevCardNewPosition;
  let selectedCardOldPosition, selectedCardNewPosition;
  let nextCardOldPosition, nextCardNewPosition;
  let hasCrossed = false; // Flag is set when card crosses over the next or previous card.

  $card.draggable({
    axis: 'x',
    containment: '#cardStrip',
    handle: '.toolbar',
    start: onDragStart,
    drag: onDrag,
    stop: onDragStop
  });

  // Set up events
  function onDragStart(e, ui) {
    _$selectedCard = $(this);

    // Get neighbours of the card that is being dragged
    setNeighbourVars(_$selectedCard);

    // Adds CSS class to increase z-index to ensure the selected card stays on top of other cards
    _$selectedCard.addClass('dragging');
  }

  function onDrag(e, ui) {
    if (_$nextCard !== undefined && ((ui.offset.left + _$selectedCard.outerWidth()) > (_$nextCard.position().left + _$nextCard.outerWidth()/2))) {
      // When selectedCard crosses over the nextCard's midpoint (moving to the right)

      hasCrossed = true;

      // Update the next card's position
      nextCardNewPosition = nextCardOldPosition - cardStripGutter - _$selectedCard.outerWidth();
      _$nextCard.css('left', nextCardNewPosition);

      // Update the position of the selectedCard. This value is accessed when the mouse is released onDragStop.
      selectedCardNewPosition = nextCardNewPosition + _$nextCard.outerWidth() + cardStripGutter;

      showDropTargetPlaceholder(selectedCardNewPosition);
      resetNeighbourVars();
      reorderCards();
      setNeighbourVars(_$selectedCard);
    } else if (_$prevCard !== undefined && (ui.offset.left < (_$prevCard.position().left + _$prevCard.outerWidth()/2))) {
      // When selectedCard crosses over the prevCard's midpoint (moving to the left)

      hasCrossed = true;

      // Update the previous card's position
      prevCardNewPosition = prevCardOldPosition + _$selectedCard.outerWidth() + cardStripGutter;
      _$prevCard.css('left', prevCardNewPosition);

      // Update the position of the selectedCard. This value is accessed when the mouse is released onDragStop.
      selectedCardNewPosition = prevCardOldPosition;

      showDropTargetPlaceholder(selectedCardNewPosition);
      resetNeighbourVars();
      reorderCards();
      setNeighbourVars(_$selectedCard);
    } else {
      // Revert to old position of the card didn't cross over previous or next card.

      if (!hasCrossed) {
        // Once crossed, do not update the selectedCardNewPosition as it should take value from one of the above two
        // conditions
        selectedCardNewPosition = selectedCardOldPosition;
        showDropTargetPlaceholder(selectedCardNewPosition);
      }
    }
  }

  function onDragStop() {
    // Remove dragging CSS class which reverts the z-index value
    _$selectedCard.removeClass('dragging');

    _$selectedCard.css('left', selectedCardNewPosition);

    hideDropTargetPlaceholder();

    // Reset pinnedCards list which maintains the order of the cards
    reorderCards();

    // Reset vars
    resetNeighbourVars();
    hasCrossed = false;
    _$selectedCard = selectedCardOldPosition = selectedCardNewPosition = undefined;
  }

  /**
   * Returns the previous and next card of the selectedCard.
   * @param selectedCardId
   * @returns {Array<jQuery>} $previousCard, $nextCard
   */
  function getNeighbourCards(selectedCardId) {
    let $previousCard, $nextCard;
    for (let i = 0; i < pinnedCards.length; i++) {
      if (selectedCardId === pinnedCards[i]) {
        if (i !== 0) {
          $previousCard = $('#' + pinnedCards[i-1]);
        }
        if (i !== pinnedCards.length - 1) {
          $nextCard = $('#' + pinnedCards[i+1]);
        }
      }
    }
    return [$previousCard, $nextCard];
  }

  function setNeighbourVars($selectedCard) {
    const selectedCardId = $selectedCard.attr('id');
    const neighbours = getNeighbourCards(selectedCardId);
    _$prevCard = neighbours[0];
    _$nextCard = neighbours[1];

    selectedCardOldPosition = $selectedCard.position().left;

    if (_$prevCard !== undefined) {
      // If left most card in the container is being dragged...
      prevCardOldPosition = _$prevCard.position().left;
    }
    if (_$nextCard !== undefined) {
      // If right most card in the container is being dragged...
      nextCardOldPosition = _$nextCard.position().left;
    }
  }

  /**
   * Reset neighbour card vars.
   */
  function resetNeighbourVars() {
    _$prevCard = _$nextCard = undefined;
    prevCardOldPosition = prevCardNewPosition = nextCardOldPosition = nextCardNewPosition = undefined;
  }

  function reorderCards() {
    pinnedCards.sort(function(a, b) {
      return $('#' + a).position().left - $('#' + b).position().left;
    });
  }

  /**
   * Sets the geometry of drop target placeholder and displays it.
   * @param left
   */
  function showDropTargetPlaceholder(left) {
    $('#dropTargetDiv').css({
      'width': _$selectedCard.outerWidth(),
      'left': left,
      'visibility': 'visible'
    });
  }

  /**
   * Hides the drop target placeholder.
   */
  function hideDropTargetPlaceholder() {
    $('#dropTargetDiv').css('visibility', 'hidden');
  }
};

initDraggable($('#card1'));
initDraggable($('#card2'));
initDraggable($('#card3'));
