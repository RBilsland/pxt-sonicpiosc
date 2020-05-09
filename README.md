# Sonic Pi OSC Extension for the micro:bit

This extension has been developed to allow a micro:bit to send OpenSound Control (OSC) messages directly to an instance of Sonic Pi.

The extension is built around the [ESP8266](https://en.wikipedia.org/wiki/ESP8266) low cost serial Wi-Fi microchip built into [Elecfreaks](https://www.elecfreaks.com/store/) iot:bit module, although any ESP8266 micro:bit module should work but may require different pins to be selected in the initialise block. The module was purchased from [Cool Components](https://coolcomponents.co.uk/products/iot-bit-for-bbc-micro-bit) in the UK.

![iot:bit module for the micro:bit by Elecfreaks](https://github.com/RBilsland/pxt-sonicpiosc/blob/master/images/iotbit.png)


## Why?

Why build this extension? Well Sonic Pi is a fantastic musical tool and micro:bits allow so many ways of interacting with them so getting them to talk to each other opens up a whole new world of possibilities. Music is something that should be able to be physically interacted with and the micro:bits provide so many ways of interacting with them either by themselves or through things being plugged into them. It's all about encouraging creativity and collaboration between people with different ideas and skill sets.


## Demos

I've written a couple of demos (including videos) using this extension, a Theremin demo where the pitch and roll of a micro:bit control the note and volumed played and a virtual drum kit where a micro:bit on each hand and one on a foot control the playing of a snare drum, kick drum and cymbal.

* Theremin Demo - https://github.com/RBilsland/pxt-sonicpiosc/blob/master/ThereminDemo.md
* Virtual Drum Kit Demo - https://github.com/RBilsland/pxt-sonicpiosc/blob/master/VirtualDrumKitDemo.md

## Using the Extension

For this I will use the micro:bits Microsoft MakeCode block editor.

1. Open the Microsoft MakeCode editor and create a new empty project.
2. As this extension isn't included by default it will need to be added to the project. From the bottom of the palette of block categories click the Advanced section to expand it and then from the bottom of the Advanced section click Extensions.
3. The extension isn't currently included in the extensions library so enter https://github.com/rBilsland/pxt-sonicpiosc in the search box at the top of the page and press return.
4. Click the extension presented to add it to the project.


## Connecting to Sonic Pi

Before any messages can be sent to Sonic Pi a connection must first be established. The process involves 3 steps;

### Initialising the connection to the ESP8266 microchip

If using the iot:bit module then the default parameters will suffice. Once complete you can check if it was successful or not.

![initialise block commands](https://github.com/RBilsland/pxt-sonicpiosc/blob/master/images/initialise.png)

### Connecting to WiFi

You will need to provide the details of the WiFi access point you wish to connect to. Make sure you enter upper / lower case characters correctly as this will make a difference. You cannot attempt a WiFi connection unless you have successfully initialised a connection first. Once complete you can check if it was successful or not.

![wifi block commands](https://github.com/RBilsland/pxt-sonicpiosc/blob/master/images/connectWiFi.png)

### Connecting to Sonic Pi

You will need to provide the details of the IP Address of the machine where Sonic Pi is running and the port the service is running on. Both of these pieces of information can be found in the IO preferences of Sonic Pi. Also make sure both the Enable OSC server and Send/Receive remote OSC checkboxes are ticked. You cannot attempt a Sonic Pi connection unless you have successfully connected WiFi first. Once complete you can check if it was successful or not.

![sonic pi block commands](https://github.com/RBilsland/pxt-sonicpiosc/blob/master/images/connectSonicPi.png)

### Example of use

This establishes a connection to Sonic Pi as the micro:bit starts. The additional 500ms delay is to allow the ESP8266 microchip to start. After each step status is checked before proceeding.

![initialise example block commands](https://github.com/RBilsland/pxt-sonicpiosc/blob/master/images/initialiseExample.png)


## Sending OpenSound Control (OSC) Messages

Once a connection to Sonic Pi has been created messages can be sent.

### Building a Message

This process is broken down into 3 steps, starting a command with its associated address, adding parameters (if any are required) and finally sending the message. The address is what in Sonic Pi can be synced to and strings, integers and float can be passed as parameters. Once the message has been sent you can check if it was successful or not.

![message block commands](https://github.com/RBilsland/pxt-sonicpiosc/blob/master/images/message.png)

### Example of use

When the A button is pressed a message will be built and sent with the address of "microbit" and will include 3 parameters, the first a "hello" string, next an integer of 123 and finally a float of 456.789.

![message example block commands](https://github.com/RBilsland/pxt-sonicpiosc/blob/master/images/messageExample.png)


## Additional Blocks

There are a couple of additional behind the scenes parameters that can be adjusted. They are to do with the number of retries that are automatically attempted and the timeout duration (in milliseconds) when communicating with the ESP8266. By default the number of retries is set to 1 (so no retries, it just tries once) and timeout duration is set to 10000ms (or 10 seconds).

![additional block commands](https://github.com/RBilsland/pxt-sonicpiosc/blob/master/images/additional.png)


## License

MIT


## Supported targets

* for PXT/microbit
(The below metadata is required for package searching.)

```package
sonicpiosc=github:RBilsland/pxt-sonicpiosc
```
