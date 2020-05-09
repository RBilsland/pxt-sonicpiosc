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
