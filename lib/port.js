const EventEmitter = require('events');

class Port extends EventEmitter {
  constructor(name) {
    super(arguments);

    this.name = name;
  }

  set(data) {
    this.emit('data', data);
  }
}
module.exports =  Port;
