var black = {};
var blanks = 0;

var hand = {};
var handIds = [];

var blue = {};
var order = []; // ids only

function select(target) {
  var card = $(target);
  var id = card.data('id');
  if (card.hasClass('selected')) {
    // Deselect
    delete blue[id];
    var i = order.indexOf(id); order.splice(i, 1);
  }
  else {
    // Select
    if (order.length == black.blanks) {
      // On verge of exceeding blanks, deselect order[0] first 
      var firstId = order.shift();
      delete blue[firstId];
    }
    blue[id] = hand[id];
    order.push(id);
  }
  refreshOnSelect();
}

function refreshOnSelect() {
  // Re-assign selection, circle numbers
  $('.card.white').removeClass('selected');
  $('.card.white').removeClass('b1 b2 b3 b4 b5');
  for (var j = 0; j < order.length; j++) {
    var id = order[j];
    var className = 'b' + (j+1);
    $('[data-id="' + id + '"]').addClass('selected').addClass(className);
  }

  // Update helptext
  var remaining = blanks - order.length;
  $('.help').html("Select <b>" + remaining + "</b> more white cards...");

  if (remaining == 0) {
    $('.submit').addClass('ready').removeClass('noselect');
  }
  else {
    $('.submit').removeClass('ready').addClass('noselect');
  }
}

function refreshOnSubmit(draw, newBlack) {

  var newHand = {};
  var newHandIds = [];

  if (handIds.length == 0) {
    // Initial
    for (var id in draw) {
      newHand[id] = draw[id];
      newHandIds.push(id);
    }
  }
  else {
    // Merge
    var drawIds = [];
    for (var id in draw) {
      drawIds.push(id);
    }
    handIds.forEach(function(id){
      if (order.indexOf(id) == -1) {
        // keep
        newHand[id] = hand[id];
        newHandIds.push(id);
      }
      else {
        // take draw[0] instead
        var newId = drawIds.shift();
        newHand[newId] = draw[newId];
        newHandIds.push(newId);
      }
    });
  }

  // White
  $('.hand').empty();
  newHandIds.forEach(function(id) {
    var card = newHand[id];
    var html = '<div data-id="' + card._id + '" class="card white">' + card.string + '</div>';
    if (handIds.indexOf(id) == -1) {
      // new, fade in
      $(html)
        .css({opacity: 0 })
        .appendTo('.hand')
        .animate({opacity: 1 }, 500);
    }
    else {
      // preexisting, appear
      $(html)
        .appendTo('.hand')
    }
  });
  // Re-attach handler
  $('.card.white').click(function() {
    select(this);
  });

  // Black
  $('.play').empty();
  $('<div data-id="' + newBlack._id + '" class="card black big"><div class="bold">' + newBlack.course + '</div>' + newBlack.string + '</div>')
    .css({opacity: 0, top:'300px'})
    .appendTo('.play')
    .animate({opacity: 1, top:'130px'}, 500);

  // Save
  black = newBlack;
  blanks = newBlack.blanks;
  hand = newHand;
  handIds = newHandIds;
  blue = {};
  order = [];

  Cookies.set('hand', hand);
  Cookies.set('black', black);

  refreshOnSelect();
}

$(document).ready(function(){

  // Retrieve
  if ( (Cookies.getJSON('hand') != undefined) && (Cookies.getJSON('black') != undefined) ) {
    hand = Cookies.getJSON('hand'); black = Cookies.getJSON('black');
    refreshOnSubmit(hand, black);
  }
  else {
    // Initial
    $.ajax({
      type: "GET",
      url: "/initial",
      success: function(response) {
        // Unpack
        hand = response.hand;
        black = response.black;
        refreshOnSubmit(hand, black);
      }
    });
  }

  // Submit
  $('.submit').click(function() {
    if (blanks - order.length == 0) {
      $.ajax({
        type: "POST",
        url: "/submit",
        contentType: "application/json",
        data: JSON.stringify({ "black" : black, "hand": hand, "blue": blue }),
        success: function(response) {
          // Unpack
          var draw = response.draw;
          var newBlack = response.newBlack;
          refreshOnSubmit(draw, newBlack);
        }
      });
    }
  });

});