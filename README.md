SparkFun SX1509 library
-----------------------

SparkFun SX1509: https://learn.sparkfun.com/tutorials/sx1509-io-expander-breakout-hookup-guide

This is my attempt of a port of the [SparkFun SX1509 Arduino Library](https://github.com/sparkfun/SparkFun_SX1509_Arduino_Library) to javascript for use on a Raspberry Pi.

I am only using the board for simple PWM control using the `analogWrite` method.

Example usage:

```
const SX1509 = require('node-sx1509')

var pin = 0
var io = new SX1509()
try {
  await io.begin({ busNumber: 1, deviceAddress: 0x3E })
  await io.pinMode(pin, SX1509.ANALOG_OUTPUT)
  await io.analogWrite(pin, 75)
} catch (e) {
  console.log(e)
} finally {
  io.end().catch(e => console.log(e))
}

```

For raspberry pi i2c configuration, see the configuration notes for i2c-bus: https://github.com/fivdi/i2c-bus/blob/master/doc/raspberry-pi-i2c.md

The nodejs program does not need to be run as root if the user is a member of group `i2c`. Run the following command, log out, then log in again:
```
sudo usermod -a G i2c USERNAME
```

TODO: all the remaining methods...



**Since this is a port, including SparkFun's original open source license text below**

License Information
-------------------

This product is _**open source**_!

The **code** is beerware; if you see me (or any other SparkFun employee) at the local, and you've found our code helpful, please buy us a round!

Please use, reuse, and modify these files as you see fit. Please maintain attribution to SparkFun Electronics and release anything derivative under the same license.

Distributed as-is; no warranty is given.

- Your friends at SparkFun.