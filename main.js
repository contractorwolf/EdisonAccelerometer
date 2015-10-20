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

var speed = 20;//milliseconds
var resetCount = 1000;
var concussionThreshold = 2;//2 times gravity =  2g, a concussion can happen at ~30-50g
var deviceSerialNumber = "fzed439d00tom501"


console.log('EdisonAccelorometer Started: ' + Date());

var impactDateTime;
var xSurpass = false;
var ySurpass = false;
var zSurpass = false;

var ConcussionLed = new mraa.Gpio(31); //LED hooked up to digital pin 13 (or built in pin on Intel Galileo Gen2 as well as Intel Edison)
ConcussionLed.dir(mraa.DIR_OUT); //set the gpio direction to output
ConcussionLed.write(0); 

//var concussionIndicated = false;

var outputTemplate = "CurrentX: %d   \tCurrentY: %d  \tCurrentZ: %d  \tloop: %d \t status: %s-%s-%s \tthreshold: %d \ttime: %s";


//SOCKET
var serverPort = "4242";//server port
var serverIP = 'http://192.168.1.142';//server host

var socket = require('socket.io-client')(serverIP + ':' + serverPort);

//connection with server successful
socket.on('connect', function(){
    console.log('connected to server');
    socket.emit('message','client ready');
});

//received message from server
socket.on('servermessage', function(data){
  console.log("message received: " + data);
  
  socket.emit('message','thank you server');
  
});

//disconnected from server
socket.on('disconnect', function(){
   console.log('disconnected from server');
});


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

//send data to server via socket.io emit (publish)
function sendData(x,y,z,threshold, impactDateTime){

    var impactVector = {
      createDate: impactDateTime,
      deviceSerialNumber: deviceSerialNumber,
      measurementX: x,
      measurementY: y,
      meausrementZ: z,
      threshold: threshold
    };

    socket.emit('clientmessage', impactVector);
    
    console.log("emit: client message");
}



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
    
    
    xSurpass = currentX>concussionThreshold;
    ySurpass = currentY>concussionThreshold;
    zSurpass = currentZ>concussionThreshold;
    
    impactDateTime = Date();
    
    //test for concussion
    if(xSurpass||ySurpass||zSurpass){
        
        //log sensor data
        console.log(outputTemplate,currentX,currentY,currentZ,reading_count, xSurpass, ySurpass, zSurpass, concussionThreshold,impactDateTime);
        
        sendData(currentX,currentY,currentZ,concussionThreshold,impactDateTime);
        console.log("CONCUSSION INDICATED,  %dg exceeded, turn on LED:  %s", concussionThreshold, impactDateTime);
        ConcussionLed.write(1);
        reading_count = 1;
    }

    //reset highest after 5000 loops
    if(reading_count%resetCount==0){
        ConcussionLed.write(0); 
        console.log("RESET LED and Count");
        reading_count = 1;
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

