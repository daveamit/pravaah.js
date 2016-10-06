"use strict";

const EventEmitter = require('events');

class Port extends EventEmitter {
  constructor(name) {
    super(arguments);

    this.name = name;
    this.isReady = true;
  }

  ready(){
    this.isReady = true;
    this.emit('ready');
  }

  set(data) {
    if(!this.isReady){
      throw new Error(`"${this.name}" Port is busy`);
    }
    this.isReady = false;
    this.emit('data', data);
  }
}
module.exports =  Port;
