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
    const destinationPorts = [new Port('in-box1'), new Port('in-box2')];
    //Skip init in constructor. Will have to call init manually.
    const connection = new Connection('Connection1', sourcePort, destinationPorts, true);
    const data = {
      'sample': 'data'
    };

    //Setup spies
    const handleSourceDataDeligate = sinon.spy(connection, 'handleSourceData');
    destinationPorts.forEach((port) => port.set = sinon.spy());

    //initialize the connection.
    connection.init();

    //Write some data to source port, this should trigger set of all destination ports
    sourcePort.set(data);

    //Assert to see if all functions were called with porper arguments
    assert(handleSourceDataDeligate.calledWith(destinationPorts, data), `"data" event generated source port "${sourcePort.name}" was not properly handled`);
    destinationPorts.forEach((port) => assert(port.set.calledWith(data), `destination port "${port.name}" not invoked`));


  });
});
