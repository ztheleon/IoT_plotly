
'use strict' 

/*
  "const" and "let" are block scoped, compared to "var", which is function scoped 
  This means they are local to the closest block (curly braces) that they are defined in, 
  whereas var is local to the entire function, or even global if defined outside functions.
*/

  const SerialPort = require('serialport'); // incluimos la libreria Node-SerialPort
  const config = require('./config.json'); // config JSON file plotly (username,apikey,tokens)  
  const username = config['plotly_username'], 
        apiKey = config['plotly_api_key'],
        tokens = config['plotly_tokens'];    
  const plotly = require('plotly')(username,apiKey);// Instantiate your plotly object with the username and API key.      
  const portName = 'COM3';  //path port
  //SerialPort configuration options. UART whit 8 Databits, 1 Stopbit and no Parity              
  const options = {
    // autoOpen: false, The port will open automatically by default, you can disable this by setting the option autoOpen to false.  
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: 'none'    
  };

//  Create a new serial port object for COM3 (Note: Constructing a Serial port object immediately opens a port.).  
  const port = new SerialPort(portName, options);
/*
  new SerialPort(path, [options], [openCallback])
  portName: Serial Name COM3,/dev/ttyUSB0, etc 
  options: Port configuration options object 
  openCallback: Called after a connection is opened, If this is not provided and an error occurs, it will be emitted on the port's error event.  
*/
  
/* 
   Readline is a transform stream that emits data after a newline delimiter is received. 
   The readLine parser converts the data into string lines. 
*/
  const parsers = SerialPort.parsers; //Parser: The default Parsers are Transform streams that parse data in different ways to transform incoming data (ByteLength,Delimiter,ReadLine, Ready, etc).
  const parser = new parsers.Readline({  // make instance of Readline parser, who read serial data as ASCII-encoded text, line by line
                           delimiter: '\r\n'  //Use a `\r\n` as a line terminator                           
                  });

 // *************************** PLOTLY ********************************************************
  /*
   “dataObject” contiene un array de objetos cada uno relacionado con información sobre
   los datos a graficar y el estilo de la traza para las gráficas entre otros. 
        
   x:[], y:[] empty arrays since we will be streaming our data to into these arrays
   Por defecto, al graficar los datos en tiempo real, se muestran los 30 puntos 
   (coordenadas x y y) más recientes a la vez. Para modificar este valor, usamos la 
   propiedad "maxpoints".  
  */
var dataObject = [
  {
    name: 'Temperature',
    type: "scatter",
  	x:[],
  	y:[],
  	mode:'lines+markers',
  	marker: {
      color: "rgba(215, 172, 255, 0.9)",
      size: 8
    },
  	line: {
      color:"rgba(215, 172, 19, 1)",
      width: 2
    },
  	stream:{
      token:tokens[0],
      maxpoints: 500
    }  	
  },
  {
    name: 'Humidity',
    type: "scatter",
  	x:[],
  	y:[],
  	xaxis: "x2",
  	yaxis: "y2",
  	mode:'lines+markers',
  	marker: {
      color: "rgba(31, 119, 180, 0.9)",
      dash: 'solid',
      shape: 'linear',
      size: 8
    },
  	line: {
      color:"rgba(0,0,102,1)",
      dash: 'dot',      
      width: 4
    },
    stream:{
      token:tokens[1],
      maxpoints: 500
    }  
  }
];

/*
 The Layout object will define the look of the plot, and plot features which are unrelated to the data. 
 So we will be able to change things like the title, axis titles, spacing, font and even draw shapes on top of your plot
*/
  var layoutObject = { 
    title:'Temperature and Humidity',
    plot_bgcolor: 'rgba(200,255,0,0.1)',
    xaxis: {
      title: 'Time',  
      titlefont: {
        family: "Times New Roman",
        size: 18,
        color: "black"
      },         
      showline: true,   
      mirror: "ticks", 
      autorange: true,
      gridcolor: "#E0E0E0",
      gridwidth: 2     
    },
    yaxis: {
      title: 'Temperature(C)', 
      titlefont: {
        family: "Times New Roman",
        size: 18,
        color: "black"
      },    
      showline: true,
      mirror: "ticks",
      autorange: true,
      gridcolor: "#E0E0E0",
      gridwidth: 2,     
      domain: [0, 0.35]  
    },         
    xaxis2: {
      title: 'Time',
      titlefont: {
        family: "Times New Roman",
        size: 18,
        color: "black"
      },    
      showline: true,
      mirror: "ticks",
      anchor: "y2",
      autorange: true,
      gridcolor: "#E0E0E0",
      gridwidth: 2
    },   
    yaxis2: {
      title: 'Humidity(%)',
      showline: true,
      titlefont: {
        family: "Times New Roman",
        size: 18,
        color: "black"
      },    
      mirror: "ticks",
      autorange: true,
      gridcolor: "#E0E0E0",
      gridwidth: 2,
      domain: [0.6, 1] 
    }  
  };
  
 /*     
  El objeto “graphOptions” contiene propiedades relacionadas con el estilo (incluye layoutObject), 
  como el color o el título de la gráfica, entre otros.
  fileopt: Sets what to do if the file already exists, valid options are: "new","overwrite" (default),"append","extend".   
 */
  var graphOptions = {
    layout: layoutObject, 
    fileopt : "extend", 
    filename : "iot-test"
  };
  
  //Con plotly.plot(“Data Object”,”graphOptions”, [callback]) inicializa y adiciona un nuevo punto en la gráfica. 
  plotly.plot(dataObject, graphOptions, (err, msg) => {
    if (err) return console.log(err);
    console.log(msg);
    /* 
      Con el método plotly.stream() creamos el proceso para transmitir el streaming de datos 
      y con el método stream.write (en la función onData), escribimos el streaming en tiempo
      real hacia el endpoint de plotly.
    */  
    
    var streams = { // creamos dos streams de datos
      'temperature' : plotly.stream(tokens[0], function (err, res) {
          if (err) console.log(err);
          console.log(err, res);
      }),
      'humidity' : plotly.stream(tokens[1], function (err, res) {
          if (err) console.log(err);
          console.log(err, res);
      })
    };

    // readableSrc.pipe(writableDest) pipe is a technique for passing information from one program process to another.
      port.pipe(parser); 
    /* 
      The pipe method is the easiest way to consume streams. 
      It’s generally recommended to either use the pipe method or consume 
      streams with events, but avoid mixing these two. Usually when you’re using the pipe 
      method you don’t need to use events, but if you need to consume the streams in 
      more custom ways, events would be the way to go. 
    */
    /*  Read data when be emitted as an data event and then, run the callback function */
      parser.on('data', (data) => { 
      
        // data = 23.48\t45.62
        var values = data.split('\t'); //Split a string into an array of substrings ('\t' is used as the separator)
        // values = [23.48,45.62]
               
        // writing the temperature stream
         var tempStreamObject = JSON.stringify({ x : getDateString(), y : values[0] });
         console.log('temperatureObject: ' + tempStreamObject);
         streams['temperature'].write(tempStreamObject + '\n');
 
         // writing the humidity stream         
         var humStreamObject = JSON.stringify({ x : getDateString(), y : values[1] });
         console.log('humidityObject: ' + humStreamObject);
         streams['humidity'].write(humStreamObject + '\n');         
       
      });                         
    });  

/* ************************************************************************************** */                  
// helper function to get a nicely formatted date string
function getDateString() {
  let time = new Date().getTime();  
  // 18000000 is (GMT-5 Bogota, Peru)
  // for your timezone just multiply +/-GMT by 36000000
  let datestr = new Date(time-18000000).toISOString().replace(/T/, ' ').replace(/Z/, '');
  return datestr;
}
/* ************************************************************************************** */                

/*The port will open automatically by default, you can disable this by setting the option autoOpen to false. */ 
port.on('open', onOpen);
/* ************************************************************************************** */                
                           
/* Open errors will be emitted as an error event */
port.on('error', onError);
/* ************************************************************************************** */  

/* ************************* CALLBACK DEFINITIONS *************************************** */  
function onOpen() { 
    console.log('Port opened: '+ port.path + ',' + 'baud rate: ' + port.baudRate);    
    console.log("flushing...");    
    port.flush(function(err){
      if(err){console.log("Flush error: ",err)}; 
      //.flush discard data received but not read, and written but not transmitted. 
      // when a serial port is flushed the queue contents are discarded.  
    });
   // onWrite(delay); 
  }
/* ************************************************************************************** */  

function onError(err){
    console.log('Error: ', err.message);
  } 
/* ************************************************************************************** */    
  
 

 


