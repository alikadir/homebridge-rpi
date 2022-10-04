// homebridge-rpi/lib/RpiService/GpioOutput/index.js
// Copyright © 2019-2022 Erik Baauw.  All rights reserved.
//
// Homebridge plugin for Raspberry Pi.

'use strict'

const homebridgeLib = require('homebridge-lib')
const PigpioClient = require('../../PigpioClient')

class GpioOutput extends homebridgeLib.ServiceDelegate {
  static get PigpioClient () { return PigpioClient }

  static get GpioLock () { return require('./GpioLock') }
  static get GpioSwitch () { return require('./GpioSwitch') }
  static get GpioValve () { return require('./GpioValve') }

  constructor (gpioAccessory, params = {}) {
    params.name = gpioAccessory.name
    super(gpioAccessory, params)
    this.pi = gpioAccessory.pi
    this.gpio = params.gpio
    this.mode = PigpioClient.modeValues.OUTPUT

    this.pi.on('notification', (payload) => {
      const newGpioValue = (payload.map & (1 << this.gpio)) !== 0
      if (newGpioValue !== this._gpioValue) {
        this._gpioValue = newGpioValue
        this.emit('gpio', this._gpioValue)
      }
    })
  }

  async init () {
    this.debug('initialising GPIO %d: mode %d', this.gpio, this.mode)
    await this.pi.command(PigpioClient.commands.MODES, this.gpio, this.mode)
  }

  async shutdown () {}
}

module.exports = GpioOutput