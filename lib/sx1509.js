const Constants = require('./constants')
const i2cbus = require('i2c-bus')
const debug = require('debug')
const log = debug('sx1509')

/*
 * Ported from
 * https://github.com/sparkfun/SparkFun_SX1509_Arduino_Library/blob/master/src/SparkFunSX1509.h
 * https://github.com/sparkfun/SparkFun_SX1509_Arduino_Library/blob/master/src/SparkFunSX1509.cpp
 */
class SX1509 {
  constructor() {
    this._clkX = 0
  }

  /* private methods ---------------------------------------- */

  async init() {
    log('init')
    // If the reset pin is connected
    if (this.pinReset !== 255) {
      await this.reset(1)
    } else {
      await this.reset(0)
    }

    // Communication test. We'll read from two registers with different
    // default values to verify communication.
    var testRegisters = 0
    testRegisters = await this.readWord(Constants.REG_INTERRUPT_MASK_A) // This should return 0xFF00
    // Then read a byte that should be 0x00
    if (testRegisters === 0xFF00) {
      // Set the clock to a default of 2MHz using internal
      await this.clock(Constants.INTERNAL_CLOCK_2MHZ)
      return true
    }
    return false
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async readByte(registerAddress) {
    await this.openBus()
    await this.i2c.i2cWrite(this.deviceAddress, 1, Buffer.from([registerAddress]))
    const buf = Buffer.alloc(1)
    const data = await this.i2c.i2cRead(this.deviceAddress, buf.length, buf)
    const readValue = data.buffer[0]
    log(`  readByte: deviceAddress:${this.deviceAddress} registerAddress:${registerAddress} readValue:${readValue}`)
    return readValue
  }

  async readWord(registerAddress) {
    await this.openBus()
    await this.i2c.i2cWrite(this.deviceAddress, 1, Buffer.from([registerAddress]))
    const buf = Buffer.alloc(2)
    const data = await this.i2c.i2cRead(this.deviceAddress, buf.length, buf)

    const msb = (data.buffer[0] & 0x00FF) << 8
    const lsb = (data.buffer[1] & 0x00FF)
    const readValue = msb | lsb
    log(`  readWord: deviceAddress:${this.deviceAddress} registerAddress:${registerAddress} msb:${data.buffer[0]}->${msb} lsb:${data.buffer[1]}->${lsb} readvalue:${readValue}`)
    return readValue
  }

  async readBytes(firstRegisterAddress, destination, length) {
    // TODO
    Promise.reject(new Error('Method "readBytes(firstRegisterAddress, destination, length)" not implemented!'))
  }

  async writeByte(registerAddress, writeValue) {
    log(`  writeByte: deviceAddress:${this.deviceAddress} registerAddress:${registerAddress} writeValue:${writeValue}`)
    await this.openBus()
    await this.i2c.i2cWrite(this.deviceAddress, 2, Buffer.from([registerAddress, writeValue]))
  }

  async writeWord(registerAddress, writeValue) {
    log(`  writeWord: deviceAddress:${this.deviceAddress} registerAddress:${registerAddress} writeValue:${writeValue}`)
    await this.openBus()
    const msb = (writeValue & 0xFF00) >> 8
    const lsb = writeValue & 0x00FF
    await this.i2c.i2cWrite(this.deviceAddress, 3, Buffer.from([registerAddress, msb, lsb]))
  }

  async writeBytes(firstRegisterAddress, writeArray, length) {
    // TODO
    Promise.reject(new Error('Method "writeBytes(firstRegisterAddress, writeArray, length)" not implemented!'))
  }

  async calculateLEDTRegister(ms) {
    // TODO
    Promise.reject(new Error('Method "calculateLEDTRegister(ms)" not implemented!'))
  }

  calculateSlopeRegister(ms, onIntensity, offIntensity) {
    // TODO
    Promise.reject(new Error('Method "calculateSlopeRegister(ms, onIntensity, offIntensity)" not implemented!'))
  }

  constrain(amt, low, high) {
    return amt < low ? low : (amt > high ? high : amt)
  }

  async openBus() {
    if (!this.i2c) {
      this.i2c = await i2cbus.openPromisified(this.busNumber)
    }
  }

  async closeBus() {
    if (this.i2c) {
      await this.i2c.close()
      this.i2c = null
    }
  }

  /* public methods ---------------------------------------- */

  async end() {
    await this.closeBus()
  }

  async begin(config = {}) {
    this.busNumber = config.busNumber || 1
    this.deviceAddress = config.address || 0x3E
    this.pinReset = config.resetPin || 0xFF
    this.i2c = null
    return this.init()
  }

  async reset(hardware) {
    // if hardware bool is set
    if (hardware) {
      log('hardware reset')
      // Check if bit 2 of REG_MISC is set
      // if so nReset will not issue a POR, we'll need to clear that bit first
      var regMisc = await this.readByte(Constants.REG_MISC)
      if (regMisc & (1 << 2)) {
        regMisc &= ~(1 << 2)
        await this.writeByte(Constants.REG_MISC, regMisc)
      }
      // Reset the SX1509, the pin is active low
      await this.pinMode(this.pinReset, Constants.OUTPUT) // set reset pin as output
      await this.digitalWrite(this.pinReset, Constants.LOW) // pull reset pin low
      await this.delay(1) // Wait for the pin to settle
      await this.digitalWrite(this.pinReset, Constants.HIGH) // pull reset pin back high
    } else {
      log('software reset')
      // Software reset command sequence:
      await this.writeByte(Constants.REG_RESET, 0x12)
      await this.writeByte(Constants.REG_RESET, 0x34)
    }
  }

  async pinMode(pin, inOut) {
    log(`pinMode pin:${pin} inOut:${inOut}`)
    // from pinDir

    // The SX1509 RegDir registers: REG_DIR_B, REG_DIR_A
    // 0: IO is configured as an output
    // 1: IO is configured as an input
    var modeBit
    if ((inOut === Constants.OUTPUT) || (inOut === Constants.ANALOG_OUTPUT)) {
      modeBit = 0
    } else {
      modeBit = 1
    }

    var tempRegDir = await this.readWord(Constants.REG_DIR_B)
    if (modeBit) {
      tempRegDir |= (1 << pin)
    } else {
      tempRegDir &= ~(1 << pin)
    }

    await this.writeWord(Constants.REG_DIR_B, tempRegDir)

    // If INPUT_PULLUP was called, set up the pullup too:
    if (inOut === Constants.INPUT_PULLUP) {
      await this.digitalWrite(pin, Constants.HIGH)
    }

    if (inOut === Constants.ANALOG_OUTPUT) {
      await this.ledDriverInit(pin)
    }
  }

  async digitalWrite(pin, highLow) {
    log(`digitalWrite pin:${pin} highLow:${highLow}`)
    // from writePin

    var tempRegDir = await this.readWord(Constants.REG_DIR_B)

    if ((0xFFFF ^ tempRegDir) & (1 << pin)) { // If the pin is an output, write high/low
      var tempRegData = await this.readWord(Constants.REG_DATA_B)
      if (highLow) {
        tempRegData |= (1 << pin)
      } else {
        tempRegData &= ~(1 << pin)
      }
      await this.writeWord(Constants.REG_DATA_B, tempRegData)
    } else { // Otherwise the pin is an input, pull-up/down
      var tempPullUp = await this.readWord(Constants.REG_PULL_UP_B)
      var tempPullDown = await this.readWord(Constants.REG_PULL_DOWN_B)

      if (highLow) { // if HIGH, do pull-up, disable pull-down
        tempPullUp |= (1 << pin)
        tempPullDown &= ~(1 << pin)
        await this.writeWord(Constants.REG_PULL_UP_B, tempPullUp)
        await this.writeWord(Constants.REG_PULL_DOWN_B, tempPullDown)
      } else { // If LOW do pull-down, disable pull-up
        tempPullDown |= (1 << pin)
        tempPullUp &= ~(1 << pin)
        await this.writeWord(Constants.REG_PULL_UP_B, tempPullUp)
        await this.writeWord(Constants.REG_PULL_DOWN_B, tempPullDown)
      }
    }
  }

  async digitalRead(pin) {
    // TODO
    Promise.reject(new Error('Method "digitalRead(pin)" not implemented!'))
  }

  async ledDriverInit(pin, freq = 1, logarithmic = false) {
    log(`ledDriverInit pin:${pin} freq:${freq} logarithmic:${logarithmic}`)
    var tempWord
    var tempByte

    // Disable input buffer
    // Writing a 1 to the pin bit will disable that pins input buffer
    tempWord = await this.readWord(Constants.REG_INPUT_DISABLE_B)
    tempWord |= (1 << pin)
    await this.writeWord(Constants.REG_INPUT_DISABLE_B, tempWord)

    // Disable pull-up
    // Writing a 0 to the pin bit will disable that pull-up resistor
    tempWord = await this.readWord(Constants.REG_PULL_UP_B)
    tempWord &= ~(1 << pin)
    await this.writeWord(Constants.REG_PULL_UP_B, tempWord)

    // Set direction to output (REG_DIR_B)
    tempWord = (await this.readWord(Constants.REG_DIR_B))
    tempWord &= ~(1 << pin) // 0=output
    await this.writeWord(Constants.REG_DIR_B, tempWord)

    // Enable oscillator (REG_CLOCK)
    tempByte = await this.readByte(Constants.REG_CLOCK)
    tempByte |= (1 << 6) // Internal 2MHz oscillator part 1 (set bit 6)
    tempByte &= ~(1 << 5) // Internal 2MHz oscillator part 2 (clear bit 5)
    await this.writeByte(Constants.REG_CLOCK, tempByte)

    // Configure LED driver clock and mode (REG_MISC)
    tempByte = await this.readByte(Constants.REG_MISC)
    if (logarithmic) {
      tempByte |= (1 << 7) // set logarithmic mode bank B
      tempByte |= (1 << 3) // set logarithmic mode bank A
    } else {
      tempByte &= ~(1 << 7) // set linear mode bank B
      tempByte &= ~(1 << 3) // set linear mode bank A
    }

    // Use configClock to setup the clock divider
    if (this._clkX === 0) { // Make clckX non-zero
      this._clkX = 2000000.0 / (1 << (1 - 1)) // Update private clock variable
      var f = (freq & 0x07) << 4 // freq should only be 3 bits from 6:4
      tempByte |= f
    }
    await this.writeByte(Constants.REG_MISC, tempByte)

    // Enable LED driver operation (REG_LED_DRIVER_ENABLE)
    tempWord = await this.readWord(Constants.REG_LED_DRIVER_ENABLE_B)
    tempWord |= (1 << pin)
    await this.writeWord(Constants.REG_LED_DRIVER_ENABLE_B, tempWord)

    // Set REG_DATA bit low ~ LED driver started
    tempWord = await this.readWord(Constants.REG_DATA_B)
    tempWord &= ~(1 << pin)
    await this.writeWord(Constants.REG_DATA_B, tempWord)
  }

  async analogWrite(pin, iOn) {
    log(`analogWrite pin:${pin} iOn:${iOn}`)
    // from pwm

    // Write the on intensity of pin
    // Linear mode: Ion = iOn
    // Log mode: Ion = f(iOn)
    await this.writeByte(Constants.REG_I_ON[pin], iOn)
  }

  async setupBlink(pin, tOn, toff, onIntensity = 255, offIntensity = 0, tRise = 0, tFall = 0, log = false) {
    // TODO
    Promise.reject(new Error('Method "setupBlink(pin, tOn, toff, onIntensity, offIntensity, tRise, tFall, log)" not implemented!'))
  }

  async blink(pin, tOn, tOff, onIntensity = 255, offIntensity = 0) {
    // TODO
    Promise.reject(new Error('Method "blink(pin, tOn, tOff, onIntensity, offIntensity)" not implemented!'))
  }

  async breathe(pin, tOn, tOff, rise, fall, onInt = 255, offInt = 0, log = Constants.LINEAR) {
    // TODO
    Promise.reject(new Error('Method "breathe(pin, tOn, tOff, rise, fall, onInt, offInt, log)" not implemented!'))
  }

  async keypad(rows, columns, sleepTime = 0, scanTime = 1, debounceTime = 0) {
    // TODO
    Promise.reject(new Error('Method "keypad(rows, columns, sleepTime, scanTime, debounceTime)" not implemented!'))
  }

  async readKeypad() {
    // TODO
    Promise.reject(new Error('Method "readKeypad()" not implemented!'))
  }

  async getRow(keyData) {
    // TODO
    Promise.reject(new Error('Method "getRow(keyData)" not implemented!'))
  }

  async getCol(keyData) {
    // TODO
    Promise.reject(new Error('Method "getCol(keyData)" not implemented!'))
  }

  async sync() {
    // TODO
    Promise.reject(new Error('Method "sync()" not implemented!'))
  }

  async debounceConfig(configValue) {
    // TODO
    Promise.reject(new Error('Method "debounceConfig(configValue)" not implemented!'))
  }

  async debounceTime(time) {
    // TODO
    Promise.reject(new Error('Method "debounceTime(time)" not implemented!'))
  }

  async debouncePin(pin) {
    // TODO
    Promise.reject(new Error('Method "debouncePin(pin)" not implemented!'))
  }

  async debounceKeypad(time, numRows, numCols) {
    // TODO
    Promise.reject(new Error('Method "debounceKeypad(time, numRows, numCols)" not implemented!'))
  }

  async enableInterrupt(pin, riseFall) {
    // TODO
    Promise.reject(new Error('Method "enableInterrupt(pin, riseFall)" not implemented!'))
  }

  async interruptSource(clear = true) {
    // TODO
    Promise.reject(new Error('Method "interruptSource(clear)" not implemented!'))
  }

  async checkInterrupt(pin) {
    // TODO
    Promise.reject(new Error('Method "checkInterrupt(pin)" not implemented!'))
  }

  async clock(oscSource = 2, oscDivider = 1, oscPinFunction = 0, oscFreqOut = 0) {
    // from configClock
log('setting clock')
    // RegClock constructed as follows:
    // 6:5 - Oscillator frequency souce
    // 00: off, 01: external input, 10: internal 2MHz, 1: reserved
    // 4 - OSCIO pin function
    // 0: input, 1 ouptut
    // 3:0 - Frequency of oscout pin
    // 0: LOW, 0xF: high, else fOSCOUT = FoSC/(2^(RegClock[3:0]-1))
    oscSource = (oscSource & 0b11) << 5 // 2-bit value, bits 6:5
    oscPinFunction = (oscPinFunction & 1) << 4 // 1-bit value bit 4
    oscFreqOut = (oscFreqOut & 0b1111) // 4-bit value, bits 3:0
    var regClock = oscSource | oscPinFunction | oscFreqOut
    await this.writeByte(Constants.REG_CLOCK, regClock)

    // Config RegMisc[6:4] with oscDivider
    // 0: off, else ClkX = fOSC / (2^(RegMisc[6:4] -1))
    oscDivider = this.constrain(oscDivider, 1, 7)
    this._clkX = 2000000.0 / (1 << (oscDivider - 1)) // Update private clock variable
    oscDivider = (oscDivider & 0b111) << 4 // 3-bit value, bits 6:4

    var regMisc = await this.readByte(Constants.REG_MISC)
    regMisc &= ~(0b111 << 4)
    regMisc |= oscDivider
    await this.writeByte(Constants.REG_MISC, regMisc)
  }
}

module.exports = SX1509
