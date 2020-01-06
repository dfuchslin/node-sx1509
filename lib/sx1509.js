
const RECEIVE_TIMEOUT_VALUE = 1000
const LINEAR = 0
const LOGARITHMIC = 1
const INTERNAL_CLOCK_2MHZ = 2
const EXTERNAL_CLOCK = 1
const SOFTWARE_RESET = 0
const HARDWARE_RESET = 1
const ANALOG_OUTPUT = 0x3

class SX1509 {
  constructor() {
    this.a = 0
    this.deviceAddress = 0 // byte
    this.pinInterrupt = 0 // byte
    this.pinOscillator = 0 // byte
    this.pinReset = 0 // byte
    this._clkX = 0 // unsigned long
  }

  /* private methods ---------------------------------------- */

  readByte(registerAddress) {

  }

  readWord(registerAddress) {

  }

  readBytes(firstRegisterAddress, destination, length) {

  }

  writeByte(registerAddress, writeValue) {

  }

  writeWord(registerAddress, writeValue) {

  }

  writeBytes(firstRegisterAddress, writeArray, length) {

  }

  calculateLEDTRegister(ms) {

  }

  calculateSlopeRegister(ms, onIntensity, offIntensity) {

  }

  /* public methods ---------------------------------------- */

  begin(address = 0x3E, resetPin = 0xFF) {
    return true
  }

  reset(hardware) {
  }

  pinMode(pin, inOut) {

  }

  digitalWrite(pin, highLow) {

  }

  digitalRead(pin) {

  }

  ledDriverInit(pin, freq = 1, log = false) {

  }

  analogWrite(pin, iOn) {

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

  }
}

module.exports = SX1509
