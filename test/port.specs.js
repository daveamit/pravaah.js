const Port = require('../lib/port');
const assert = require('assert');

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
});
