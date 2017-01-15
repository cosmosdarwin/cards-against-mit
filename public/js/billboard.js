var pairings = [];
var pairingsIds = [];

var upvoted = []; // ids only

function assemble(pairing) {
  // Open
  var html = '<tr data-id="' + pairing._id + '" class="pairing">';
  // Course
  html += '<td class="course"><b>' + pairing.course + '</b></td>';
  // String
  html += '<td class="string">'; 
  for (var i = 0; i < pairing.whitefrags.length; i++) {
    html += pairing.blackfrags[i];
    html += "<b><u>" + pairing.whitefrags[i] + "</u></b>";
  }
  html += pairing.blackfrags[pairing.blackfrags.length-1];
  html += '</td>';
  // Votes
  html += '<td class="votes">' + pairing.votes + '</td>';
  // Button
  if (upvoted.indexOf(pairing._id) == -1) { html += '<td class="upvote">Upvote</td>'; }
  else { html += '<td class="upvoted">Upvoted!</td>'; }
  // Close
  html += '</tr>';
  return html;
}

function refreshView(newPairings, newPairingsIds) {

  // HACK: Prevents scroll gitter on clear
  var h = $('.billboard').height();
  $('.billboard').css({ 'min-height': h+40 });

  // Empty
  $('.billboard').empty();

  for (var i = 0; i < newPairings.length; i++) {
    var newPairing = newPairings[i];
    var newPairingId = newPairingsIds[i];

    if (newPairingsIds.indexOf(newPairingId) == pairingsIds.indexOf(newPairingId)) {
      $(assemble(newPairing))
        // Unchanged
        .appendTo('.billboard');
    }
    else if (pairingsIds.indexOf(newPairingId) == -1) {
      $(assemble(newPairing))
        // New
        .css({opacity: 0 })
        .appendTo('.billboard')
        .animate({opacity: 1 }, 300);
    }
    else if (newPairingsIds.indexOf(newPairingId) < pairingsIds.indexOf(newPairingId)) {
      $(assemble(newPairing))
        // Rise
        .css({opacity: 0, top:'50px'})
        .appendTo('.billboard')
        .animate({opacity: 1, top:'0px'}, 300);
    }
    else if (newPairingsIds.indexOf(newPairingId) > pairingsIds.indexOf(newPairingId)) {
      $(assemble(newPairing))
        // Fall
        .css({opacity: 0, top:'-50px'})
        .appendTo('.billboard')
        .animate({opacity: 1, top:'0px'}, 300);
    }
  }

  // Re-attach handler
  $('.upvote').click(function() {
    upvote(this);
  });

  // Save
  pairings = newPairings;
  pairingsIds = newPairingsIds;
  
  return false;
}

function upvote(target) {
  var id = $(target).parent().data('id');
  if (upvoted.indexOf(id) == -1) {
    upvoted.push(id);
    Cookies.set('upvoted', upvoted);
    $.ajax({
      type: "POST",
      url: "/upvote",
      contentType: "application/json",
      data: JSON.stringify({ "id" : id }),
      success: function(response) {
        refreshData();
        return false;
      }
    });
  }
}

function refreshData() {
  $.ajax({
    type: "GET",
    url: "/sort",
    success: function(response) {
      var newPairings = response.pairings;
      // Create ids list
      var newPairingsIds = [];
      newPairings.forEach(function(newPairing){
        newPairingsIds.push(newPairing._id);
      });
      refreshView(newPairings, newPairingsIds);
      return false;
    }
  });
}

$(document).ready(function(){
  // Retrieve cookie
  if (Cookies.getJSON('upvoted') != undefined) {
    upvoted = Cookies.getJSON('upvoted');
  }
  // Initial
  refreshData();
  // Thereafter
  window.setInterval(refreshData, 5000);
});