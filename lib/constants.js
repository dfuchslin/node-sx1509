const constants = {
  RECEIVE_TIMEOUT_VALUE: 1000,
  LINEAR: 0,
  LOGARITHMIC: 1,
  INTERNAL_CLOCK_2MHZ: 2,
  EXTERNAL_CLOCK: 1,
  SOFTWARE_RESET: 0,
  HARDWARE_RESET: 1,
  ANALOG_OUTPUT: 0x03,

  // arduino constants
  OUTPUT: 0x01,
  INPUT_PULLUP: 0x02,
  LOW: 0x00,
  HIGH: 0x01,

  // SX-1509 register constants
  REG_INPUT_DISABLE_B: 0x00,
  REG_INPUT_DISABLE_A: 0x01,
  REG_LONG_SLEW_B: 0x02,
  REG_LONG_SLEW_A: 0x03,
  REG_LOW_DRIVE_B: 0x04,
  REG_LOW_DRIVE_A: 0x05,
  REG_PULL_UP_B: 0x06,
  REG_PULL_UP_A: 0x07,
  REG_PULL_DOWN_B: 0x08,
  REG_PULL_DOWN_A: 0x09,
  REG_OPEN_DRAIN_B: 0x0A,
  REG_OPEN_DRAIN_A: 0x0B,
  REG_POLARITY_B: 0x0C,
  REG_POLARITY_A: 0x0D,
  REG_DIR_B: 0x0E,
  REG_DIR_A: 0x0F,
  REG_DATA_B: 0x10,
  REG_DATA_A: 0x11,
  REG_INTERRUPT_MASK_B: 0x12,
  REG_INTERRUPT_MASK_A: 0x13,
  REG_SENSE_HIGH_B: 0x14,
  REG_SENSE_LOW_B: 0x15,
  REG_SENSE_HIGH_A: 0x16,
  REG_SENSE_LOW_A: 0x17,
  REG_INTERRUPT_SOURCE_B: 0x18,
  REG_INTERRUPT_SOURCE_A: 0x19,
  REG_EVENT_STATUS_B: 0x1A,
  REG_EVENT_STATUS_A: 0x1B,
  REG_LEVEL_SHIFTER_1: 0x1C,
  REG_LEVEL_SHIFTER_2: 0x1D,
  REG_CLOCK: 0x1E,
  REG_MISC: 0x1F,
  REG_LED_DRIVER_ENABLE_B: 0x20,
  REG_LED_DRIVER_ENABLE_A: 0x21,

  REG_DEBOUNCE_CONFIG: 0x22,
  REG_DEBOUNCE_ENABLE_B: 0x23,
  REG_DEBOUNCE_ENABLE_A: 0x24,
  REG_KEY_CONFIG_1: 0x25,
  REG_KEY_CONFIG_2: 0x26,
  REG_KEY_DATA_1: 0x27,
  REG_KEY_DATA_2: 0x28,

  REG_T_ON_0: 0x29,
  REG_I_ON_0: 0x2A,
  REG_OFF_0: 0x2B,
  REG_T_ON_1: 0x2C,
  REG_I_ON_1: 0x2D,
  REG_OFF_1: 0x2E,
  REG_T_ON_2: 0x2F,
  REG_I_ON_2: 0x30,
  REG_OFF_2: 0x31,
  REG_T_ON_3: 0x32,
  REG_I_ON_3: 0x33,
  REG_OFF_3: 0x34,
  REG_T_ON_4: 0x35,
  REG_I_ON_4: 0x36,
  REG_OFF_4: 0x37,
  REG_T_RISE_4: 0x38,
  REG_T_FALL_4: 0x39,
  REG_T_ON_5: 0x3A,
  REG_I_ON_5: 0x3B,
  REG_OFF_5: 0x3C,
  REG_T_RISE_5: 0x3D,
  REG_T_FALL_5: 0x3E,
  REG_T_ON_6: 0x3F,
  REG_I_ON_6: 0x40,
  REG_OFF_6: 0x41,
  REG_T_RISE_6: 0x42,
  REG_T_FALL_6: 0x43,
  REG_T_ON_7: 0x44,
  REG_I_ON_7: 0x45,
  REG_OFF_7: 0x46,
  REG_T_RISE_7: 0x47,
  REG_T_FALL_7: 0x48,
  REG_T_ON_8: 0x49,
  REG_I_ON_8: 0x4A,
  REG_OFF_8: 0x4B,
  REG_T_ON_9: 0x4C,
  REG_I_ON_9: 0x4D,
  REG_OFF_9: 0x4E,
  REG_T_ON_10: 0x4F,
  REG_I_ON_10: 0x50,
  REG_OFF_10: 0x51,
  REG_T_ON_11: 0x52,
  REG_I_ON_11: 0x53,
  REG_OFF_11: 0x54,
  REG_T_ON_12: 0x55,
  REG_I_ON_12: 0x56,
  REG_OFF_12: 0x57,
  REG_T_RISE_12: 0x58,
  REG_T_FALL_12: 0x59,
  REG_T_ON_13: 0x5A,
  REG_I_ON_13: 0x5B,
  REG_OFF_13: 0x5C,
  REG_T_RISE_13: 0x5D,
  REG_T_FALL_13: 0x5E,
  REG_T_ON_14: 0x5F,
  REG_I_ON_14: 0x60,
  REG_OFF_14: 0x61,
  REG_T_RISE_14: 0x62,
  REG_T_FALL_14: 0x63,
  REG_T_ON_15: 0x64,
  REG_I_ON_15: 0x65,
  REG_OFF_15: 0x66,
  REG_T_RISE_15: 0x67,
  REG_T_FALL_15: 0x68,

  REG_HIGH_INPUT_B: 0x69,
  REG_HIGH_INPUT_A: 0x6A,

  REG_RESET: 0x7D,
  REG_TEST_1: 0x7E,
  REG_TEST_2: 0x7F
}

constants.REG_I_ON = [
  constants.REG_I_ON_0, constants.REG_I_ON_1, constants.REG_I_ON_2, constants.REG_I_ON_3,
  constants.REG_I_ON_4, constants.REG_I_ON_5, constants.REG_I_ON_6, constants.REG_I_ON_7,
  constants.REG_I_ON_8, constants.REG_I_ON_9, constants.REG_I_ON_10, constants.REG_I_ON_11,
  constants.REG_I_ON_12, constants.REG_I_ON_13, constants.REG_I_ON_14, constants.REG_I_ON_15
]

constants.REG_T_ON = [
  constants.REG_T_ON_0, constants.REG_T_ON_1, constants.REG_T_ON_2, constants.REG_T_ON_3,
  constants.REG_T_ON_4, constants.REG_T_ON_5, constants.REG_T_ON_6, constants.REG_T_ON_7,
  constants.REG_T_ON_8, constants.REG_T_ON_9, constants.REG_T_ON_10, constants.REG_T_ON_11,
  constants.REG_T_ON_12, constants.REG_T_ON_13, constants.REG_T_ON_14, constants.REG_T_ON_15
]

constants.REG_OFF = [
  constants.REG_OFF_0, constants.REG_OFF_1, constants.REG_OFF_2, constants.REG_OFF_3,
  constants.REG_OFF_4, constants.REG_OFF_5, constants.REG_OFF_6, constants.REG_OFF_7,
  constants.REG_OFF_8, constants.REG_OFF_9, constants.REG_OFF_10, constants.REG_OFF_11,
  constants.REG_OFF_12, constants.REG_OFF_13, constants.REG_OFF_14, constants.REG_OFF_15
]

constants.REG_T_RISE = [
  0xFF, 0xFF, 0xFF, 0xFF,
  constants.REG_T_RISE_4, constants.REG_T_RISE_5, constants.REG_T_RISE_6, constants.REG_T_RISE_7,
  0xFF, 0xFF, 0xFF, 0xFF,
  constants.REG_T_RISE_12, constants.REG_T_RISE_13, constants.REG_T_RISE_14, constants.REG_T_RISE_15
]

constants.REG_T_FALL = [
  0xFF, 0xFF, 0xFF, 0xFF,
  constants.REG_T_FALL_4, constants.REG_T_FALL_5, constants.REG_T_FALL_6, constants.REG_T_FALL_7,
  0xFF, 0xFF, 0xFF, 0xFF,
  constants.REG_T_FALL_12, constants.REG_T_FALL_13, constants.REG_T_FALL_14, constants.REG_T_FALL_15
]

module.exports = Object.freeze(constants)
