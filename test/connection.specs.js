"use strict";

const Connection = require('../lib/connection');
const Port = require('../lib/port');
const assert = require('assert');
const sinon = require('sinon');

describe('Connection', function() {
    it('should be constractable with name properly set', function() {

        assert.equal((new Connection('Connection1')).name, 'Connection1');
    });

    it('should be able to communicate data', () => {

        const sourcePort = new Port('out');
        const destinationPort = new Port('in-box1');

        //Skip init in constructor. Will have to call init manually.
        const connection = new Connection('Connection1', sourcePort, destinationPort, true);
        const data = {
            'sample': 'data'
        };

        //Setup spies
        const handleSourceDataDeligate = sinon.spy(connection, 'handleSourceData');
        destinationPort.set = sinon.spy(destinationPort, 'set');

        //initialize the connection.
        connection.init();

        //Write some data to source port, this should trigger set of all destination ports
        sourcePort.set(data);

        //Assert to see if all functions were called with porper arguments
        assert(handleSourceDataDeligate.calledWith(connection, data), `"data" event generated source port "${sourcePort.name}" was not properly handled`);
        assert(destinationPort.set.calledWith(data), `destination port "${destinationPort.name}" not invoked`);


    });

    it('should be able to communicate data (async)', (done) => {

        const sourcePort = new Port('out');
        const destinationPort = new Port('in-box1');

        //Skip init in constructor. Will have to call init manually.
        const connection = new Connection('Connection1', sourcePort, destinationPort, true);
        const data = {
            'sample': 'data'
        };

        //Setup spies
        const handleSourceDataDeligate = sinon.spy(connection, 'handleSourceData');
        destinationPort.set = sinon.spy(destinationPort, 'set');


        //initialize the connection.
        connection.init();

        //Write some data to source port, this should trigger set of all destination ports
        sourcePort.set(data);
        sourcePort.ready();

        //Assert to see if all functions were called with porper arguments
        assert(handleSourceDataDeligate.calledWith(connection, data), `"data" event generated source port "${sourcePort.name}" was not properly handled`);
        assert(destinationPort.set.calledWith(data), `destination port "${destinationPort.name}" not invoked`);

        handleSourceDataDeligate.reset();
        destinationPort.set.reset();

        sourcePort.set(data);

        //Assert to see if all functions were called with porper arguments
        assert(handleSourceDataDeligate.calledWith(connection, data), `"data" event generated source port "${sourcePort.name}" was not properly handled  (2nd time)`);
        assert(destinationPort.set.neverCalledWith(data), `destination port "${destinationPort.name}" not invoked (2nd time)`);

        handleSourceDataDeligate.reset();
        destinationPort.set.reset();

        destinationPort.ready();

        process.nextTick(() => {
            assert(handleSourceDataDeligate.neverCalledWith(connection, data), `"data" event generated source port "${sourcePort.name}" was not properly handled  (3nd time)`);
            assert(destinationPort.set.calledWith(data), `destination port "${destinationPort.name}" not invoked (3nd time)`);
            done();
        });

    });

    it('should throw buffer full error', () => {

        const sourcePort = new Port('out (source)');
        const destinationPort = new Port('in-box1 (destination)');

        //Skip init in constructor. Will have to call init manually.
        const connection = new Connection('Connection1', sourcePort, destinationPort);
        const data = {
            'sample': 'data'
        };

        destinationPort.isReady = false; // Make destinationPort busy
        connection.maxBuffer = 2;

        //Write some data to source port, this should trigger set of all destination ports
        sourcePort.set(data); // 1
        sourcePort.set(data); // 2
        sourcePort.ready();

        //make sure that 3rd call throws exception
        assert.throws(sourcePort.set.bind(sourcePort, data));
    });


    it('should throw error when trying to connect to null port (source and destination)', () => {
        //Skip init in constructor. Will have to call init manually.
        //Notice we have not passed any ports.
        const connection = new Connection('Connection1', undefined, undefined, true);

        assert.throws(connection.connectSourcePort.bind(connection, undefined));
        assert.throws(connection.connectDestinationPort.bind(connection, undefined));
    });

    it('should not recieve data once source port is disconnected', () => {

        const sourcePort = new Port('out (source)');
        const destinationPort = new Port('in-box1 (destination)');

        //Skip init in constructor. Will have to call init manually.
        const connection = new Connection('Connection1', sourcePort, destinationPort);
        const data = {
            'sample': 'data'
        };

        const handleSourceDataDeligate = sinon.spy(connection, 'handleSourceData');
        destinationPort.set = sinon.spy(destinationPort, 'set');

        connection.disconnectSourcePort();

        //Write some data to source port, this should trigger set of all destination ports if connected
        sourcePort.set(data); // 1

        //make handler was not call
        assert(handleSourceDataDeligate.notCalled, 'Handler called even after disconnecting the SourcePort');
        //make sure destinationPort did not recieve anything
        assert(destinationPort.set.notCalled, 'Handler called even after disconnecting the SourcePort');

    });

    it('should not send output data once destination port is disconnected', () => {

        const sourcePort = new Port('out (source)');
        const destinationPort = new Port('in-box1 (destination)');

        //Skip init in constructor. Will have to call init manually.
        const connection = new Connection('Connection1', sourcePort, destinationPort, true);
        const data = {
            'sample': 'data'
        };

        const handleSourceDataDeligate = sinon.spy(connection, 'handleSourceData');
        destinationPort.set = sinon.spy(destinationPort, 'set');

        //Initialize the connection as we skipped while construction the object.
        connection.init();

        connection.disconnectDestinationPort();

        //Write some data to source port, this should trigger set of all destination ports if connected
        //this is expected to throw error saying output is not connected.
        assert.throws(sourcePort.set.bind(sourcePort, data), 'If destinationPort is disconnected, setting source data should throw error'); // 1

        //make handler should get called with data
        assert(handleSourceDataDeligate.calledWith(connection, data), 'Handler did not called even though source port is connected');

        //make sure destinationPort did not recieve anything
        assert(destinationPort.set.notCalled, 'Handler called even after destinationPort is disconnected');

    });


    it('should be able to send data if destination port is already ready. (queue is empty)', () => {

        const sourcePort = new Port('out (source)');
        const destinationPort = new Port('in-box1 (destination)');

        //Skip init in constructor. Will have to call init manually.
        const connection = new Connection('Connection1', sourcePort, destinationPort, true);
        const data = {
            'sample': 'data'
        };

        const handleSourceDataDeligate = sinon.spy(connection, 'handleSourceData');
        destinationPort.set = sinon.spy(destinationPort, 'set');

        //Initialize the connection as we skipped while construction the object.
        connection.init();

        //Destination port gets ready (the queue is empty now)
        destinationPort.ready();

        //Make destination port busy
        destinationPort.isReady = false;

        //Write data so it will get queued
        sourcePort.set(data);

        //make handler should get called with data
        assert(handleSourceDataDeligate.calledWith(connection, data), 'Handler did not called even though source port is connected');

        //make sure destinationPort DID not recieves data
        assert(destinationPort.set.notCalled, 'destinationPort recieved data even when busy');

        handleSourceDataDeligate.reset();

        destinationPort.ready();


        //make handler should NOT get called
        assert(handleSourceDataDeligate.notCalled, 'Handler called 2nd time on OnReady event of destination-port');

        //make sure destinationPort recieves data
        assert(destinationPort.set.calledWith(data), 'destinationPort data not set even after everything is connected');

    });

});
