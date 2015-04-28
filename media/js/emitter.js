$(function() {
var socket = io();
  socket.on('tempChange', function(msg){
  	$('#temp').text(msg);
  });
});