"use strict";

const _ = require('lodash');

module.exports = class Port {
    constructor(name = 'No Name', inPorts = {}, outPorts = {}) {
        this.name = name;
        this.inPorts = _.reduce(inPorts, (a, c) => {
            a[c.name] = c;
            return a;
        }, {});
        this.outPorts = _.reduce(outPorts, (a, c) => {
            a[c.name] = c;
            return a;
        }, {});
    }

    addInPort(port) {
        if (!port) {
            throw new Error('Port must have some value');
        }
        if (!port.name) {
            throw new Error('Port must have a name');
        }

        if (this.inPorts[port.name]) {
            throw new Error(`A port with same name (${port.name}) exsists`);
        }


        this.inPorts[port.name] = port;
    }
    addOutPort(port) {
        if (!port) {
            throw new Error('Port must have some value');
        }
        if (!port.name) {
            throw new Error('Port must have a name');
        }
        if (this.outPorts[port.name]) {
            throw new Error(`A port with same name (${port.name}) exsists`);
        }

        this.outPorts[port.name] = port;
    }

    removeInPort(port) {
        if (!port) {
            throw new Error('Must provide an in port name');
        }
        if (typeof port !== 'string') {
            throw new Error('Port name must be a string value');
        }
        if (!this.inPorts[port]) {
            throw new Error(`No in port named ${port} exsists`);
        }

        delete this.inPorts[port];

    }
    removeOutPort(port) {
        if (!port) {
            throw new Error('Must provide an in port name');
        }
        if (typeof port !== 'string') {
            throw new Error('Port name must be a string value');
        }
        if (!this.outPorts[port]) {
            throw new Error(`No out port named ${port} exsists`);
        }

        delete this.outPorts[port];
    }
};
