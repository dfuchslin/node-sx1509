SparkFun SX1509 library
-----------------------

SparkFun SX1509: https://learn.sparkfun.com/tutorials/sx1509-io-expander-breakout-hookup-guide

This is my attempt of a port of the [SparkFun SX1509 Arduino Library](https://github.com/sparkfun/SparkFun_SX1509_Arduino_Library) to javascript for use on a Raspberry Pi.

I am only using the board for simple PWM control using the `analogWrite` method.

Example usage:

```
const SX1509 = require('node-sx1509')

var io = new SX1509()
try {
  await io.begin({ busNumber: 1, deviceAddress: 0x3E })
  await io.pinMode(pin, SX1509.ANALOG_OUTPUT)
  await io.analogWrite(0, 75)
} catch (e) {
  console.log(e)
} finally {
  io.end().catch(e => console.log(e))
}

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