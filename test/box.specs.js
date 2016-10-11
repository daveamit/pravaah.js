"use strict";
//This is so that es6 feature of default arguments works properly
//that is used in box.js
require("babel-core/register");

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

        it('with valid name set', function() {
            assert.equal(box.name, name);
        });

        it('with valid out port set', function() {
            assert.equal(box.inPorts['in-port'].name, 'in-port', 'in port mapped with "in-port" must have same name');
        });

        it('with valid in port set', function() {
            assert.equal(box.outPorts['out-port-a'].name, 'out-port-a', 'out port mapped with "out-port-a" must have same name');
            assert.equal(box.outPorts['out-port-b'].name, 'out-port-b', 'out port mapped with "out-port-b" must have same name');
        });
    });

    describe('Should be', () => {
        const inPort = new Port('in-port');
        const outPortA = new Port('out-port-a');
        const outPortB = new Port('out-port-b');

        const name = 'Black-box';
        const box = new Box(name, [inPort], [outPortA, outPortB]);


        describe('able to add by', () => {
            it('failing when passed undefined port', () => {
                assert.throws(box.addInPort.bind(box, undefined));
                assert.throws(box.addOutPort.bind(box, undefined));
            });

            it('failing when passed port object with no name', () => {
                assert.throws(box.addInPort.bind(box, {}));
                assert.throws(box.addOutPort.bind(box, {}));
            });

            it('failing to add another port with same name', () => {
                assert.throws(box.addInPort.bind(box, inPort));
                assert.throws(box.addOutPort.bind(box, outPortA));
            });
            it('adding a port with unique name', () => {
                assert.doesNotThrow(box.addInPort.bind(box, new Port('new-in-port')));
                assert.doesNotThrow(box.addOutPort.bind(box, new Port('new-out-port')));

                assert.equal(box.inPorts['new-in-port'].name, 'new-in-port', 'addInPort did not work as expected');
                assert.equal(box.outPorts['new-out-port'].name, 'new-out-port', 'addOutPort did not work as expected');

            });
        });

        describe('able to remove by', () => {
            it('failing when passed undefined port', () => {
                assert.throws(box.removeInPort.bind(box, undefined));
                assert.throws(box.removeOutPort.bind(box, undefined));
            });

            it('failing when passed object passed port', () => {
                assert.throws(box.removeInPort.bind(box, inPort));
                assert.throws(box.removeOutPort.bind(box, outPortA));
            });


            it('failing when port is not present', () => {
                assert.throws(box.removeInPort.bind(box, 'non-existent-in-port'));
                assert.throws(box.removeOutPort.bind(box, 'non-existent-out-port'));
            });
            it('removing when port is present', () => {
                assert.doesNotThrow(box.removeInPort.bind(box, 'in-port'));
                assert.doesNotThrow(box.removeOutPort.bind(box, 'out-port-a'));

                assert.equal(box.inPorts['in-port'], undefined, 'inport not properly removed');
                assert.equal(box.outPorts['out-port-a'], undefined, 'outport not properly removed');
            });
        });
    });
});
