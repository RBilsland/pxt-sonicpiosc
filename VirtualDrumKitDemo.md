# Virtual Drumkit Demo

Drum Kits are usually controlled by drumsticks and the performers feet, in this demo there are no drumsticks or drums either, everythings virtual. By using the accelerometers in three micro:bits when they sense they are being stopped and send a radio message to a forth micro:bit that passes the message onto Sonic Pi to play the appropriate sound sample.


## Hardware Requirements

* 4 x micro:bit
* 1 x Elecfreaks iot:bit module
* 1 x installation of Sonic Pi


## micro:bit Code

The code is split into 4 parts, one for each micro:bit. The first is the code for the gateway that receives the radio message and passes them onto Sonic Pi. 
![Sonic Pi gateway demo code for the micro:bit](https://github.com/RBilsland/pxt-sonicpiosc/blob/master/images/sonicPiGatewayDemoMicrobit.png)
The above code can also be found here https://makecode.microbit.org/_FDKFT97Vg4XV. You can then edit it to insert your own details and download the hex file.


The next code is for the kick drum and it sends messages to the gateway.
![Kick drum demo code for the micro:bit](https://github.com/RBilsland/pxt-sonicpiosc/blob/master/images/kickDrumDemoMicrobit.png)
The above code can also be found here https://makecode.microbit.org/_aLKhcbh7Y1FJ. You can download the hex file.


The next code is for the snare drum and it sends messages to the gateway.
![Snare drum demo code for the micro:bit](https://github.com/RBilsland/pxt-sonicpiosc/blob/master/images/snareDrumDemoMicrobit.png)
The above code can also be found here https://makecode.microbit.org/_bseLchJyb1p6. You can download the hex file.


The next code is for the cymbal and it sends messages to the gateway.
![Cymbal demo code for the micro:bit](https://github.com/RBilsland/pxt-sonicpiosc/blob/master/images/cymbalDemoMicrobit.png)
The above code can also be found here https://makecode.microbit.org/_H62LYucFadx8. You can download the hex file.


## Sonic Pi Code

```sonicpi
live_loop :drum_heavy_kick do
  use_real_time
  sync "/osc:*/microbit/drumheavykick"
  sample :drum_heavy_kick
end

live_loop :drum_snare_soft do
  use_real_time
  sync "/osc:*/microbit/drumsnaresoft"
  sample :drum_snare_soft
end

live_loop :drum_snare_hard do
  use_real_time
  sync "/osc:*/microbit/drumsnarehard"
  sample :drum_snare_hard
end

live_loop :drum_cymbal_soft do
  use_real_time
  sync "/osc:*/microbit/drumcymbalsoft"
  sample :drum_cymbal_soft
end

live_loop :drum_cymbal_hard do
  use_real_time
  sync "/osc:*/microbit/drumcymbalhard"
  sample :drum_cymbal_hard
end
```


## In Use

1. Start Sonic Pi and check the IO Preferences, noting down your Local IP address and Incoming OSC port.
2. Copy in the code.
3. Edit the gateway micro:bit code updating your WiFi and Sonic Pi details.
4. Download the hex code to your micro:bit.
5. Insert the micro:bit into the iot:bit and power up.
6. The micro:bit will display a row of dots, one by one, across the top of its screen. If any of these dots move down a row then this indicates an issue establishing a connection, power off and back on the iot:bit and try again (this is an extreme edge case mostly caused by entering invalid details, double check them including it the case of WiFi name and password).
7. Download the hex code for the kick drum, snare drum and cymbal to your micro:bits.
8. Power up these micro:bits.
9. Run the Sonic Pi code.
10. Attach the three micro:bits to your hands and foot and play your virtual drum kit. Everytime one of these micro:bits sends a message to the gateway the dot in the middle of the bottom row will flash. Everytime the gateway passes a message onto Sonic Pi the dot in the middle of the bottom row will flash too.
9. When running in Sonic Pi a stream of cues will be shown as the kick drum, snare drum or cymbal is played.


## Demo Video

A video of the demo can be seen here https://youtu.be/1ntUQ2s-CvA