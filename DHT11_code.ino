
/*
Purpose: DHT11 sensor + Arduino Mega + Node.js + Plotly IoT demo
*/

#include <DHT.h>

#define DHTPIN 5   // Pin digital al que se conectara el sensor DHT11
#define DHTTYPE DHT11 // Define el tipo de sensor a usar (DHT11,DHT22,DHT21)


/*----------- function declarations ------------ */
void Millidelay(long int delay_user);
DHT dht(DHTPIN, DHTTYPE); // Instanciamos la clase DHT.
/*---------------------------------------------- */

void setup() {
  Serial.begin(9600); //Set the data rate(bps) for serial Tx, open serial port and initializes the seial buffer (128bytes)
                        // Arduino Mega has 4 serial ports (serial.begin, serial1.begin,...)
  dht.begin();          // llama al metodo begin() para inicializar el sensor DHT11 
 }

void loop() {

  /*
  Nota: Generamos este tiempo de espera con la funcion millis() en vez de la funcion delay(), debido
  a que el uso de delay hace que la CPU no acepte ningun otro requerimiento, ni siquiera un ISR
  (Interruption Service Routine), por lo que lo hace ineficiente.   
  */  
  float h = dht.readHumidity(); // Leemos la humedad relativa
  float t = dht.readTemperature(); // Leemos la temperatura en grados centigrados (por defecto)   
  float hic = dht.computeHeatIndex(t, h, false); // Calcular el indice de calor en grados centigrados
   
  // Comprobamos si ha habido algun error en la lectura
  if (isnan(h) || isnan(t)) {
    Serial.println("Error obteniendo los datos del sensor DHT11");
    return;
  }
    /*envía los datos de temperatura y humedad, separados por el delimitador '\t'*/
    Serial.println(String(t)+'\t'+String(h));     
   
  Serial.flush(); //Waits for the transmission of outgoing serial data to complete.
  Millidelay(3000); // tiempo de espera entre medidas.  
}

/*----------- function definition ------------ */

void Millidelay(long int delay_user) {
  unsigned long time = 0; 
  static unsigned long time_updated = 0;
  while (true) {
    time = millis(); //Number of milliseconds since the program started (unsigned long).
    if(time > time_updated + delay_user){
      time_updated = time;
      break;
    }
  }
}


