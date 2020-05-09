# Theremin Demo

A theremin is usually control by the distance of the performers hands from the device. By default a micro:bit doesn't have any distance sensing capabilities but what it does have is the ability to know it's pitch and roll. These are the inputs I will use to control sound being played, left to right (-90 degrees to +90 degrees) controlling pitch and down to up (-45 degrees to +45 degrees) controlling volume.


## Hardware Requirements

* 1 x micro:bit
* 1 x Elecfreaks iot:bit module
* 1 x installation of Sonic Pi


## micro:bit Code

![theremin demo code for the micro:bit](https://github.com/RBilsland/pxt-sonicpiosc/blob/master/images/thereminDemoMicrobit.png)
The above code can also be found here https://makecode.microbit.org/_bfs8kdgWcWug. You can then edit it to insert your own details and download the hex file.


## Sonic Pi Code

```sonicpi
use_synth :blade

base_note = play :C4, amp: 0, sustain: 60 * 60 * 2

live_loop :microbit do
  use_real_time
  note, amp = sync "/osc:*/microbit"
  control base_note, note: note, amp: amp, amp_slide: 0.1, note_slide: 0.1
end
```


## In Use

1. Start Sonic Pi and check the IO Preferences, noting down your Local IP address and Incoming OSC port.
2. Copy in the code.
3. Edit the micro:bit code updating your WiFi and Sonic Pi details.
4. Download the hex code to your micro:bit.
5. Insert the micro:bit into the iot:bit and power up.
6. The micro:bit show display a row of dots, one by one, across the top of its screen. If any of these dot move down a row then this indicates an issue establishing a connection, power off and back on the iot:bit and try again (this is an extreme edge case mostly caused by entering invalid details, double check them including it the case of WiFi name and password).
7. Run the Sonic Pi code.
8. To start the micro:bit Theremin press button A and to stop press button B. While it is running a dot will be shown in the middle of the bottom row.
9. When running in Sonic Pi a stream of cues will be shown with changing note and amp values.


## Demo Video

A video of the demo can be seen here ?