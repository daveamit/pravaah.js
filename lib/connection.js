"use strict";

const Fifo = require('fifo');

module.exports = class Connection {
    constructor(name, sourcePort, destinationPort, skipInit) {
        this.name = name;
        this.buffer = new Fifo();
        this.maxBuffer = 10;
        this.onReady = this.onReady.bind(this, this);

        if (sourcePort && destinationPort) {
            this.init = this.init.bind(this, sourcePort, destinationPort);

            if (!skipInit) {
                this.init();
            }

        }
    }

    onReady(self) {
        if (self.buffer.length) {
            self.buffer.shift()();
        }
    }

    init(sourcePort, destinationPort) {
        this._handleSourceData = this.handleSourceData.bind(this, this);
        this.connectSourcePort(sourcePort);
        this.connectDestinationPort(destinationPort);
    }

    connectSourcePort(sourcePort) {
        if (!sourcePort) {
            throw new Error(`${this.name} can not connect to null port (source)`);
        }

        this.disconnectSourcePort();

        this.sourcePort = sourcePort;
        sourcePort.on('data', this._handleSourceData);
    }


    connectDestinationPort(destinationPort) {
        if (!destinationPort) {
            throw new Error(`${this.name} can not connect to null port (destination)`);
        }

        this.disconnectDestinationPort();

        this.destinationPort = destinationPort;
        this.destinationPort.on('ready', this.onReady);
    }

    disconnectSourcePort() {
        if (!this.sourcePort) {
            return;
        }
        this.sourcePort.removeListener('data', this._handleSourceData);
        delete this.sourcePort;
    }

    disconnectDestinationPort() {
        if (!this.destinationPort) {
            return;
        }

        this.destinationPort.removeListener('ready', this.onReady);
        delete this.destinationPort;
    }


    handleSourceData(self, data) {
        if (!self.destinationPort) {
            throw new Error(`"${self.name}" is not connected to any destination port, can not send`);
        }

        if (self.maxBuffer <= self.buffer.length) {
            throw new Error(`"${self.name}'s" buffer is full, can not push more elements`);
        }

        const port = self.destinationPort;

        if (port.isReady) {
            port.set(data);
        } else {
            self.buffer.push(() => port.set(data));
        }

        if(self.maxBuffer > self.buffer.length){
            self.sourcePort.ready();
        }
    }

};
