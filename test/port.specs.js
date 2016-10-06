"use strict";

const Port = require('../lib/port');
const assert = require('assert');
const sinon = require('sinon');

describe('input-port', function () {
  it('should be constractable with name properly set', function () {
    assert.equal((new Port('port1')).name, 'port1');
  });
  it('should be able to recieve data', (done) => {
    const port1 = new Port('port1');

    //Listen for data on port
    port1.on('data', (data) => {
      assert.equal(data, 'sample data')
      done();
    });

    //recieve data (this should trigger 'data' event)
    assert.doesNotThrow(port1.set.bind(port1, 'sample data'));
  });

  it('should throw "busy" exception when 2 set call are made back to back without ready in between', () => {
    const port1 = new Port('port1');

    //recieve data (this should trigger 'data' event)
    assert.doesNotThrow(port1.set.bind(port1, 'sample data'));
    assert.throws(port1.set.bind(port1, 'sample data'));
  });

  it('should NOT throw "busy" exception when 2 set call are made back to back with ready in between', () => {
    const port1 = new Port('port1');

    //recieve data (this should trigger 'data' event)
    assert.doesNotThrow(port1.set.bind(port1, 'sample data'));
    port1.ready();
    assert.doesNotThrow(port1.set.bind(port1, 'sample data'));
  });
});
