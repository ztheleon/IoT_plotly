# IoT_plotly

# Introducción.

Una de las aplicaciones con más desarrollo en el entorno de node.js es el control de hardware a través de la web (browser o aplicación móvil). Para iniciar nuestra práctica en este interesante tema, vamos a desarrollar la siguiente aplicación que manejará un sensor de temperatura - humedad de la serie HTC11 (desde un Arduino Mega), cuyos datos serán gestionados y transferidos por un servidor basado en node.js. El usuario, a través de una plataforma de visualización de datos en la nube, podrá hacer seguimiento a la medición de temperatura y humedad del sensor en tiempo real, la cual puede ser usada por varios dispositivos simultáneamente.

![Una imagen cualquiera](/Images/IoT_diagram.png)

# Objetivo.

Diseñar y desarrollar una aplicación básica IoT que nos sirva de base para estudiar su arquitectura en general.
Requerimientos:

*	Sensor de temperatura y humedad DHT11
*	Arduino Mega 2560
*	Node v8.6.0
*	Arduino IDE 1.8.4
*	Plotly node module versión 1.0.6
*	SerialPort node module versión 6.0.4

**Arquitectura:** 

![Una imagen cualquiera](/Images/Project 1.png)
 
Usaremos node.js como la plataforma para nuestra etapa de recolección los datos desde el arduino. Node.js es una plataforma de desarrollo de software construido sobre Chrome’s V8 JavaScript engine. Node.js utiliza un paradigma orientado a eventos, usando un modelo de entradas y salidas (I/O) no – bloqueante y asíncrono. Estas características lo hacen eficiente y ligero a la hora de diseñar aplicaciones en tiempo real.
