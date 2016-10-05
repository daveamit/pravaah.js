const Connection = require('../lib/connection');
const Port = require('../lib/port');
const assert = require('assert');
const sinon = require('sinon');

describe('Connection', function () {
  it('should be constractable with name properly set', function () {

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

  it('should be able to communicate data', (done) => {

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

    const sourcePort = new Port('out');
    const destinationPort = new Port('in-box1');

    //Skip init in constructor. Will have to call init manually.
    const connection = new Connection('Connection1', sourcePort, destinationPort);
    const data = {
      'sample': 'data'
    };

    destinationPort.isReady = false; // Make destinationPort busy
    connection.maxBuffer = 2;

    //Write some data to source port, this should trigger set of all destination ports
    sourcePort.set(data); sourcePort.ready(); // 1
    sourcePort.set(data); sourcePort.ready(); // 2


    //make sure that 3rd call throws exception
    assert.throws(sourcePort.set.bind(sourcePort, data));



  });
});
