'use strict';


let _options;

function dragify(options) {
  // const options = {
  //   cardList: cardList,
  //   cardContainer: cardContainer,
  //   cardContainerGutter: cardContainerGutter || 0,
  //   containment: containment || cardContainer,
  //   axis: axis || 'x',
  //   handle: handle || '.card',
  //   zIndex: zIndex || 0,
  //   placeholder: placeholder || null
  // };
  _options = options;

  // if the compulsory options are not present, throw error
  options.cardsList.forEach(function(card) {
    _initDraggable($('#' + card), options.axis, options.containment,
      options.handle, options.cardContainerGutter, options.zIndex, options.placeholderCard);
  });
}

function undragify() {
  _options.cardsList.forEach(function(card) {
    $('#' + card).draggable('destroy');
  });
}

/**
 * Initializes jQuery UI draggable plugin - https://jqueryui.com/draggable/.
 * @param $card - jQuery selector of viz card
 */
function _initDraggable($card, axis, containment, handle, cardStripGutter, zIndex, placeholderCard) {
  let _$prevCard, _$nextCard, _$selectedCard;
  let prevCardOldPosition, prevCardNewPosition;
  let selectedCardOldPosition, selectedCardNewPosition;
  let nextCardOldPosition, nextCardNewPosition;
  let hasCrossed = false; // Flag is set when card crosses over the next or previous card.

  $card.draggable({
    axis: axis,
    containment: containment,
    handle: handle,
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
    _$selectedCard.css('zIndex', zIndex + 1);
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
    _$selectedCard.css('zIndex', zIndex);

    _$selectedCard.css('left', selectedCardNewPosition);

    hideDropTargetPlaceholder();

    // Reset cardsList list which maintains the order of the cards
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
    for (let i = 0; i < cardsList.length; i++) {
      if (selectedCardId === cardsList[i]) {
        if (i !== 0) {
          $previousCard = $('#' + cardsList[i-1]);
        }
        if (i !== cardsList.length - 1) {
          $nextCard = $('#' + cardsList[i+1]);
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

  /**
   * Reorder cards list.
   */
  function reorderCards() {
    cardsList.sort(function(a, b) {
      return $('#' + a).position().left - $('#' + b).position().left;
    });
  }

  /**
   * Sets the geometry of drop target placeholder and displays it.
   * @param left
   */
  function showDropTargetPlaceholder(left) {
    $(placeholderCard).css({
      'width': _$selectedCard.outerWidth(),
      'left': left,
      'visibility': 'visible'
    });
  }

  /**
   * Hides the drop target placeholder.
   */
  function hideDropTargetPlaceholder() {
    $(placeholderCard).css('visibility', 'hidden');
  }
};
