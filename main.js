/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */
// Leave the above lines for propper jshinting
//Type Node.js Here :)

var sensorObj = require('jsupm_lsm9ds0');
// Instantiate an LSM9DS0 using default parameters (bus 1, gyro addr 6b,
// xm addr 1d)
var sensor = new sensorObj.LSM9DS0();

// Initialize the device with default values
sensor.init();

var x = new sensorObj.new_floatp();
var y = new sensorObj.new_floatp();
var z = new sensorObj.new_floatp();



console.log('EDISON ACCELEROMETER Started: ' + Date());



// Output data every half second until interrupted
setInterval(function()
{
    sensor.update();
    
    sensor.getAccelerometer(x, y, z);
    console.log("AX: %d   \tAY: %d \tAZ: %d",sensorObj.floatp_value(x),sensorObj.floatp_value(y),sensorObj.floatp_value(z));

}, 15);

// exit on ^C
process.on('SIGINT', function()
{
    sensor = null;
    sensorObj.cleanUp();
    sensorObj = null;
    console.log("Exiting.");
    process.exit(0);
});


//***************************************


/*

var mraa = require('mraa'); //require mraa
console.log('MRAA Version: ' + mraa.getVersion()); //write the mraa version to the Intel XDK console

//var myOnboardLed = new mraa.Gpio(3, false, true); //LED hooked up to digital pin (or built in pin on Galileo Gen1)
var myOnboardLed = new mraa.Gpio(13); //LED hooked up to digital pin 13 (or built in pin on Intel Galileo Gen2 as well as Intel Edison)
myOnboardLed.dir(mraa.DIR_OUT); //set the gpio direction to output
var ledState = true; //Boolean to hold the state of Led

periodicActivity(); //call the periodicActivity function

function periodicActivity()
{
  myOnboardLed.write(ledState?1:0); //if ledState is true then write a '1' (high) otherwise write a '0' (low)
  ledState = !ledState; //invert the ledState
  setTimeout(periodicActivity,100); //call the indicated function after 1 second (1000 milliseconds)
    
  console.log('periodicActivity(): ' + Date()); //write the mraa version to the Intel XDK console
}

*/