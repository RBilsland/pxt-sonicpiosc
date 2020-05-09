# Sonic Pi OSC Extension for MicroBit

This extension has been developed to allow a micro:bit to send OpenSound Control (OSC) messages directly to an instance of Sonic Pi.

The extension is built around the ESP8266 low cost serial Wi-Fi microchip built into [Elecfreaks](https://www.elecfreaks.com/store/) iot:bit module, purchased this from [Cool Components](https://coolcomponents.co.uk/products/iot-bit-for-bbc-micro-bit) in the UK.

![iot:bit module for the micro:bit by Elecfreaks](https://github.com/RBilsland/pxt-sonicpiosc/blob/master/images/iotbit.png)

## Basic Usage

For this I will use the micro:bits Microsoft MakeCode block editor.

1. Open the Microsoft MakeCode editor and create a new empty project.
2. As this extension isn't included by default it will need to be added to the project. From the bottom of pallet of block categories click the Advanced section to expand it and then from the bottom of the Advanced section click Extensions.
3. The extension isn't currently included in the extensions library so enter https://github.com/rBilsland/pxt-sonicpiosc in the search box at the top of the page and press return.
4. Click the extension presented to add it to the project.

## Connecting to Sonic Pi

Before any messages can be sent to Sonic Pi a connection must first be established. The process involves 3 steps;

### Initialising the connection to the ESP8266 microchip

If using the iot:bit module then the defaut parameters will surffice. Once complete you can check if it was successful or not.

![initialise block commands](https://github.com/RBilsland/pxt-sonicpiosc/blob/master/images/initialise.png)

### Connecting to WiFi

You will need to provide the details of the WiFi access point you wish to connect to. Make sure you enter upper / lower case characters correctly as this will make a difference. You cannot attempt a WiFi connection unless you have successfully initialised a connection first. Once complete you can check if it was successfull or not.

![wifi block commands](https://github.com/RBilsland/pxt-sonicpiosc/blob/master/images/connectWiFi.png)

### Connecting to Sonic Pi

You will need to provide the details of the IP Address of the machine where Sonic Pi is running and the 