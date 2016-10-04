module.exports = class Connection {
  constructor(name, sourcePort, destinationPorts, skipInit) {
    this.name = name;
    this.sourcePort = sourcePort;
    this.destinationPorts = destinationPorts;

    if(!skipInit){
      this.init();
    }
  }

  init(){
    this.setDestinationPorts(this.destinationPorts);
    this.setSourcePort(this.sourcePort);
  }

  setSourcePort(sourcePort){
    if(!sourcePort){
      return;
    }

    this.sourcePort.removeListener('data', this._handleSourceData);
    sourcePort.on('data', this._handleSourceData);
  }


  setDestinationPorts(destinationPorts){
    if(!destinationPorts){
      return;
    }

    if(this._handleSourceData){
      //Remove bound deligate from listners as its about to change.
      this.sourcePort.removeListener('data', this._handleSourceData);
    }

    this.destinationPorts = destinationPorts;
    //Bind new destinationPorts to the handler
    this._handleSourceData = this.handleSourceData.bind(this, destinationPorts);

    //Again subscribe to event
    this.sourcePort.on('data', this._handleSourceData);
  }

  handleSourceData (destinationPorts, data){
    destinationPorts.forEach((port) => {
      port.set(data);
    });
  }

}
