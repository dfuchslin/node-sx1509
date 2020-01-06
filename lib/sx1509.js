const Registers = require('./sx1509-registers')
const RECEIVE_TIMEOUT_VALUE = 1000
const LINEAR = 0
const LOGARITHMIC = 1
const INTERNAL_CLOCK_2MHZ = 2
const EXTERNAL_CLOCK = 1
const SOFTWARE_RESET = 0
const HARDWARE_RESET = 1
const ANALOG_OUTPUT = 0x3

// arduino constants
const OUTPUT = 0x01
const INPUT_PULLUP = 0x02
const LOW = 0x0
const HIGH = 0x1

class SX1509 {
  constructor() {
    this._clkX = 0
  }

  /* private methods ---------------------------------------- */

  init() {
    // Begin I2C
    Wire.begin()

    // If the reset pin is connected
    if (this.pinReset !== 255) {
      this.reset(1)
    } else {
      this.reset(0)
    }

    // Communication test. We'll read from two registers with different
    // default values to verify communication.
    var testRegisters = 0
    testRegisters = this.readWord(Registers.REG_INTERRUPT_MASK_A) // This should return 0xFF00

    // Then read a byte that should be 0x00
    if (testRegisters === 0xFF00) {
      // Set the clock to a default of 2MHz using internal
      this.clock(INTERNAL_CLOCK_2MHZ)
      return true
    }

    return false
  }

  delay(milliseconds) {
    // USED (from arduino)
  }

  readByte(registerAddress) {
    var readValue
    var timeout = RECEIVE_TIMEOUT_VALUE

    Wire.beginTransmission(this.deviceAddress)
    Wire.write(registerAddress)
    Wire.endTransmission()
    Wire.requestFrom(this.deviceAddress, 1)

    while ((Wire.available() < 1) && (timeout !== 0)) {
      timeout--
    }

    if (timeout === 0) {
      return 0
    }

    readValue = Wire.read()

    return readValue
  }

  readWord(registerAddress) {
    var readValue
    var msb, lsb
    var timeout = RECEIVE_TIMEOUT_VALUE * 2

    Wire.beginTransmission(this.deviceAddress)
    Wire.write(registerAddress)
    Wire.endTransmission()
    Wire.requestFrom(this.deviceAddress, 2)

    while ((Wire.available() < 2) && (timeout !== 0)) {
      timeout--
    }

    if (timeout === 0) {
      return 0
    }

    msb = (Wire.read() & 0x00FF) << 8
    lsb = (Wire.read() & 0x00FF)
    readValue = msb | lsb

    return readValue
  }

  readBytes(firstRegisterAddress, destination, length) {

  }

  writeByte(registerAddress, writeValue) {
    Wire.beginTransmission(this.deviceAddress)
    Wire.write(registerAddress)
    Wire.write(writeValue)
    Wire.endTransmission()
  }

  writeWord(registerAddress, writeValue) {
    var msb, lsb
    msb = ((writeValue & 0xFF00) >> 8)
    lsb = (writeValue & 0x00FF)
    Wire.beginTransmission(this.deviceAddress)
    Wire.write(registerAddress)
    Wire.write(msb)
    Wire.write(lsb)
    Wire.endTransmission()
  }

  writeBytes(firstRegisterAddress, writeArray, length) {

  }

  calculateLEDTRegister(ms) {

  }

  calculateSlopeRegister(ms, onIntensity, offIntensity) {

  }

  constrain(amt, low, high) {
    return amt < low ? low : (amt > high ? high : amt)
  }

  /* public methods ---------------------------------------- */

  begin(address = 0x3E, resetPin = 0xFF) {
    this.deviceAddress = address
    this.pinReset = resetPin
    return this.init()
  }

  reset(hardware) {
    // if hardware bool is set
    if (hardware) {
      // Check if bit 2 of REG_MISC is set
      // if so nReset will not issue a POR, we'll need to clear that bit first
      var regMisc = this.readByte(Registers.REG_MISC)
      if (regMisc & (1 << 2)) {
        regMisc &= ~(1 << 2)
        this.writeByte(Registers.REG_MISC, regMisc)
      }
      // Reset the SX1509, the pin is active low
      this.pinMode(this.pinReset, OUTPUT) // set reset pin as output
      this.digitalWrite(this.pinReset, LOW) // pull reset pin low
      this.delay(1) // Wait for the pin to settle
      this.digitalWrite(this.pinReset, HIGH) // pull reset pin back high
    } else {
      // Software reset command sequence:
      this.writeByte(Registers.REG_RESET, 0x12)
      this.writeByte(Registers.REG_RESET, 0x34)
    }
  }

  pinMode(pin, inOut) {
    // from pinDir

    // The SX1509 RegDir registers: REG_DIR_B, REG_DIR_A
    // 0: IO is configured as an output
    // 1: IO is configured as an input
    var modeBit
    if ((inOut === OUTPUT) || (inOut === ANALOG_OUTPUT)) {
      modeBit = 0
    } else {
      modeBit = 1
    }

    var tempRegDir = this.readWord(Registers.REG_DIR_B)
    if (modeBit) {
      tempRegDir |= (1 << pin)
    } else {
      tempRegDir &= ~(1 << pin)
    }

    this.writeWord(Registers.REG_DIR_B, tempRegDir)

    // If INPUT_PULLUP was called, set up the pullup too:
    if (inOut === INPUT_PULLUP) {
      this.digitalWrite(pin, HIGH)
    }

    if (inOut === ANALOG_OUTPUT) {
      this.ledDriverInit(pin)
    }
  }

  digitalWrite(pin, highLow) {
    // from writePin

    var tempRegDir = this.readWord(Registers.REG_DIR_B)

    if ((0xFFFF ^ tempRegDir) & (1 << pin)) { // If the pin is an output, write high/low
      var tempRegData = this.readWord(Registers.REG_DATA_B)
      if (highLow) {
        tempRegData |= (1 << pin)
      } else {
        tempRegData &= ~(1 << pin)
      }
      this.writeWord(Registers.REG_DATA_B, tempRegData)
    } else { // Otherwise the pin is an input, pull-up/down
      var tempPullUp = this.readWord(Registers.REG_PULL_UP_B)
      var tempPullDown = this.readWord(Registers.REG_PULL_DOWN_B)

      if (highLow) { // if HIGH, do pull-up, disable pull-down
        tempPullUp |= (1 << pin)
        tempPullDown &= ~(1 << pin)
        this.writeWord(Registers.REG_PULL_UP_B, tempPullUp)
        this.writeWord(Registers.REG_PULL_DOWN_B, tempPullDown)
      } else { // If LOW do pull-down, disable pull-up
        tempPullDown |= (1 << pin)
        tempPullUp &= ~(1 << pin)
        this.writeWord(Registers.REG_PULL_UP_B, tempPullUp)
        this.writeWord(Registers.REG_PULL_DOWN_B, tempPullDown)
      }
    }
  }

  digitalRead(pin) {

  }

  ledDriverInit(pin, freq = 1, log = false) {
    var tempWord
    var tempByte

    // Disable input buffer
    // Writing a 1 to the pin bit will disable that pins input buffer
    tempWord = this.readWord(Registers.REG_INPUT_DISABLE_B)
    tempWord |= (1 << pin)
    this.writeWord(Registers.REG_INPUT_DISABLE_B, tempWord)

    // Disable pull-up
    // Writing a 0 to the pin bit will disable that pull-up resistor
    tempWord = this.readWord(Registers.REG_PULL_UP_B)
    tempWord &= ~(1 << pin)
    this.writeWord(Registers.REG_PULL_UP_B, tempWord)

    // Set direction to output (REG_DIR_B)
    tempWord = this.readWord(Registers.REG_DIR_B)
    tempWord &= ~(1 << pin) // 0=output
    this.writeWord(Registers.REG_DIR_B, tempWord)

    // Enable oscillator (REG_CLOCK)
    tempByte = this.readByte(Registers.REG_CLOCK)
    tempByte |= (1 << 6) // Internal 2MHz oscillator part 1 (set bit 6)
    tempByte &= ~(1 << 5) // Internal 2MHz oscillator part 2 (clear bit 5)
    this.writeByte(Registers.REG_CLOCK, tempByte)

    // Configure LED driver clock and mode (REG_MISC)
    tempByte = this.readByte(Registers.REG_MISC)
    if (log) {
      tempByte |= (1 << 7) // set logarithmic mode bank B
      tempByte |= (1 << 3) // set logarithmic mode bank A
    } else {
      tempByte &= ~(1 << 7) // set linear mode bank B
      tempByte &= ~(1 << 3) // set linear mode bank A
    }

    // Use configClock to setup the clock divder
    if (this._clkX === 0) { // Make clckX non-zero
      this._clkX = 2000000.0 / (1 << (1 - 1)) // Update private clock variable
      var f = (freq & 0x07) << 4 // freq should only be 3 bits from 6:4
      tempByte |= f
    }
    this.writeByte(Registers.REG_MISC, tempByte)

    // Enable LED driver operation (REG_LED_DRIVER_ENABLE)
    tempWord = this.readWord(Registers.REG_LED_DRIVER_ENABLE_B)
    tempWord |= (1 << pin)
    this.writeWord(Registers.REG_LED_DRIVER_ENABLE_B, tempWord)

    // Set REG_DATA bit low ~ LED driver started
    tempWord = this.readWord(Registers.REG_DATA_B)
    tempWord &= ~(1 << pin)
    this.writeWord(Registers.REG_DATA_B, tempWord)
  }

  analogWrite(pin, iOn) {
    // from pwm

    // Write the on intensity of pin
    // Linear mode: Ion = iOn
    // Log mode: Ion = f(iOn)
    this.writeByte(Registers.REG_I_ON[pin], iOn)
  }

  setupBlink(pin, tOn, toff, onIntensity = 255, offIntensity = 0, tRise = 0, tFall = 0, log = false) {

  }

  blink(pin, tOn, tOff, onIntensity = 255, offIntensity = 0) {

  }

  breathe(pin, tOn, tOff, rise, fall, onInt = 255, offInt = 0, log = LINEAR) {

  }

  keypad(rows, columns, sleepTime = 0, scanTime = 1, debounceTime = 0) {

  }

  readKeypad() {

  }

  getRow(keyData) {

  }

  getCol(keyData) {

  }

  sync() {

  }

  debounceConfig(configVaule) {

  }

  debounceTime(time) {

  }

  debouncePin(pin) {

  }

  debounceKeypad(time, numRows, numCols) {

  }

  enableInterrupt(pin, riseFall) {

  }

  interruptSource(clear = true) {

  }

  checkInterrupt(pin) {

  }

  clock(oscSource = 2, oscDivider = 1, oscPinFunction = 0, oscFreqOut = 0) {
    // from configClock

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
    this.writeByte(Registers.REG_CLOCK, regClock)

    // Config RegMisc[6:4] with oscDivider
    // 0: off, else ClkX = fOSC / (2^(RegMisc[6:4] -1))
    oscDivider = this.constrain(oscDivider, 1, 7)
    this._clkX = 2000000.0 / (1 << (oscDivider - 1)) // Update private clock variable
    oscDivider = (oscDivider & 0b111) << 4 // 3-bit value, bits 6:4

    var regMisc = this.readByte(Registers.REG_MISC)
    regMisc &= ~(0b111 << 4)
    regMisc |= oscDivider
    this.writeByte(Registers.REG_MISC, regMisc)
  }
}

module.exports = SX1509
