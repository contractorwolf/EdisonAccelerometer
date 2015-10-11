/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */
// Leave the above lines for propper jshinting
//Type Node.js Here :)

var sensorObj = require('jsupm_lsm9ds0');

var mraa = require('mraa'); //require mraa
console.log('MRAA Version: ' + mraa.getVersion()); //write the mraa version to the Intel XDK console


// Instantiate an LSM9DS0 using default parameters (bus 1, gyro addr 6b, xm addr 1d)
var sensor = new sensorObj.LSM9DS0();
// Initialize the device with default values
sensor.init();

//VARIABLES
var x = new sensorObj.new_floatp();
var y = new sensorObj.new_floatp();
var z = new sensorObj.new_floatp();
var total_x = new sensorObj.new_floatp();
var avg_x = new sensorObj.new_floatp();

var currentX; 
var currentY; 
var currentZ; 

var highestX = 0; 
var highestY = 0; 
var highestZ = 0;

var calibrateX = 0; 
var calibrateY = 0; 
var calibrateZ = 0;

var reading_count = 0

var speed = 30;//milliseconds
var resetCount = 1000;


console.log('EdisonAccelorometer Started: ' + Date());


var ConcussionLed = new mraa.Gpio(31); //LED hooked up to digital pin 13 (or built in pin on Intel Galileo Gen2 as well as Intel Edison)
ConcussionLed.dir(mraa.DIR_OUT); //set the gpio direction to output
ConcussionLed.write(0); 

var concussionIndicated = false;
 

function intitalizeReadings(){
    sensor.update();
    sensor.getAccelerometer(x, y, z);
    currentX = sensorObj.floatp_value(x);
    currentY = sensorObj.floatp_value(y);
    currentZ = sensorObj.floatp_value(z);
    
    
    calibrateX = currentX; 
    calibrateY = currentY; 
    calibrateZ = currentZ;
    
    console.log("INITIALIZED READINGS");
}

intitalizeReadings();


// Output data every half second until interrupted
setInterval(function()
{
    sensor.update();
    
    sensor.getAccelerometer(x, y, z);
    
    reading_count++;
    
    //get readings from sensor, adjust with the calibrate numbers
    currentX = sensorObj.floatp_value(x) - calibrateX;
    currentY = sensorObj.floatp_value(y) - calibrateY;
    currentZ = sensorObj.floatp_value(z) - calibrateZ;
    
    //if the absoulte is greater than the max, it is the max
    if(Math.abs(currentX) > highestX){highestX = Math.abs(currentX);}
    if(Math.abs(currentY) > highestY){highestY = Math.abs(currentY);}  
    if(Math.abs(currentZ) > highestZ){highestZ = Math.abs(currentZ);}
    
    
    //ALL READINGS
    //console.log("AX: %d   \tAY: %d  \tAZ: %d   \tMaxX: %d   \tMaxY: %d  \tMaxZ: %d",currentX,currentY,currentZ,highestX,highestY,highestZ);

    //MAX READINGS
    console.log("MaxX: %d   \tMaxY: %d  \tMaxZ: %d  \tloop: %d \t indicators: %s-%s-%s",highestX,highestY,highestZ,reading_count, highestX>1,highestY>1,highestZ>1);
    
    
    
    if(highestX>1||highestY>1||highestZ>1){
        if(concussionIndicated==false){
            ConcussionLed.write(1);
            concussionIndicated = true;
            console.log("CONCUSSION INDICATED");
            reading_count = 1;
        }
    }
    
    
    //reset highest after 5000 loops
    if(reading_count%resetCount==0){
        highestX = 0; 
        highestY = 0; 
        highestZ = 0;
        
        concussionIndicated = false;
        ConcussionLed.write(0); 
        console.log("RESET");
    }
    
    
    
    
    
    

}, speed);

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
var myOnboardLed = new mraa.Gpio(31); //LED hooked up to digital pin 13 (or built in pin on Intel Galileo Gen2 as well as Intel Edison)
myOnboardLed.dir(mraa.DIR_OUT); //set the gpio direction to output
var ledState = true; //Boolean to hold the state of Led

periodicActivity(); //call the periodicActivity function

function periodicActivity()
{
  myOnboardLed.write(ledState?1:0); //if ledState is true then write a '1' (high) otherwise write a '0' (low)
  ledState = !ledState; //invert the ledState
  setTimeout(periodicActivity,1000); //call the indicated function after 1 second (1000 milliseconds)
  console.log('blink: ' + ledState);
}

*/