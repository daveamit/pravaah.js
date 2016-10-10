const Box = require('../lib/box');
const Port = require('../lib/port');
const Connection = require('../lib/connection');
const assert = require('assert');
const sinon = require('sinon');

describe('Box', () => {
    describe('Should be constractable ', () => {
      const inPort = new Port('in-port');
      const outPortA = new Port('out-port-a');
      const outPortB = new Port('out-port-b');

      const name = 'Black-box';
      const box = new Box(name, [inPort], [outPortA, outPortB]);

        it('with valid name set', function () {
          assert.equal(box.name, name);
        });

        it('with valid out port set', function () {
          assert.equal(box.outPorts['in-port'].name, 'in-port', 'in port mapped with "in-port" must have same name');
        });

        it('with valid in port set', function () {
          assert.equal(box.inPorts['out-port-a'].name, 'out-port-a', 'out port mapped with "out-port-a" must have same name');
          assert.equal(box.inPorts['out-port-b'].name, 'out-port-b', 'out port mapped with "out-port-b" must have same name');
        });


    });
});
