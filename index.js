var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use('/media', express.static(__dirname + '/media'));
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendfile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
});

io.on('tempChange', function(socket){
	io.emit('tempChange', msg);
});

http.listen(4567, function(){
  console.log('listening on localhost:4567');
});

// Start of Arduino Stuff

var j5 = require("johnny-five");
var board = new j5.Board();
 
var LEDPIN = 8;
var THMPIN = "A0";
 
board.on("ready", function(){

  var led = new j5.Led(LEDPIN);
  var thm = new j5.Sensor({ pin: THMPIN, freq: 2000 });
 
  var alertTemperatureF = 85;
  var currentTemp;
 
  thm.on("change",  function(err, thmVoltage){
	    currentTemp = convertVoltToTemp(thmVoltage);
	 
	    if (currentTemp.tempF >= alertTemperatureF) {
	      led.on();
	    } else {
	      led.off();
	    }
		
	    // Socket Emit Current Temp
	    io.emit('tempChange', currentTemp.tempF);
	});
 
});

function convertVoltToTemp(volt){
  var tempK, tempC, tempF;

  // get the Kelvin temperature
  tempK = Math.log(((10240000/volt) - 10000));
  tempK = 1 / (0.001129148 + (0.000234125 * tempK) + (0.0000000876741 * 
      tempK * tempK * tempK));

  // convert to Celsius and round to 1 decimal place
  tempC = tempK - 273.15;
  tempC = Math.round(tempC*10)/10;

  // get the Fahrenheit temperature, rounded
  tempF = (tempC * 1.8) + 32;
  tempF = Math.round(tempF*10)/10;

  // return all three temperature scales
  return {
    tempK: tempK,
    tempC: tempC,
    tempF: tempF
  };
}

function findIP() {
	'use strict';

	var os = require('os');
	var ifaces = os.networkInterfaces();

	Object.keys(ifaces).forEach(function (ifname) {
	  var alias = 0;

	  ifaces[ifname].forEach(function (iface) {
	    if ('IPv4' !== iface.family || iface.internal !== false) {
	      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
	      return;
	    }

	    if (alias >= 1) {
	      // this single interface has multiple ipv4 addresses
	      console.log(ifname + ':' + alias, iface.address);
	    } else {
	      // this interface has only one ipv4 adress
	      console.log(ifname, iface.address);
	    }
	  });
	});
}