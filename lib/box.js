const _ = require('lodash');
module.exports = class Port {
  constructor(name = 'No Name', inPorts = [], outPorts = []) {
    this.name = name;
    this.outPorts = _.reduce(inPorts, (a, c) => { a[c.name] = c; return a; } , {}) ;
    this.inPorts = _.reduce(outPorts, (a, c) => { a[c.name] = c; return a; }, {}) ;
  }
}
