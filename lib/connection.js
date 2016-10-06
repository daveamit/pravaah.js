"use strict";

const Fifo = require('fifo');

module.exports = class Connection {
  constructor(name, sourcePort, destinationPort, skipInit) {
    this.name = name;
    this.buffer = new Fifo();
    this.maxBuffer = 10;


    this.init = this.init.bind(this, sourcePort, destinationPort);
    if(!skipInit){
      this.init();
    }
  }

  init(sourcePort, destinationPort){
    this._handleSourceData = this.handleSourceData.bind(this, this);
    this.connectionSourcePort(sourcePort);
    this.connectionDestinationPort(destinationPort);
  }

  connectionSourcePort(sourcePort){
    if(!sourcePort){
      this.disconnectSourcePort();
      return;
    }

    if(this.sourcePort){
      this.sourcePort.removeListener('data', this._handleSourceData);
    }
    this.sourcePort = sourcePort;
    sourcePort.on('data', this._handleSourceData);
  }


  connectionDestinationPort(destinationPort){
    if(!destinationPort){
      return;
    }

    this.destinationPort = destinationPort;
  }

  disconnectSourcePort(){
    delete this.sourcePort;
  }

  disconnectDestinationPort(){
    delete this.destinationPort;
  }


  handleSourceData (self, data){
    if(self.maxBuffer <= self.buffer.length){
      console.log(`"${self.name}'s" buffer is full, can not push more elements`);
      throw new Error(`"${self.name}'s" buffer is full, can not push more elements`);
    }

    const port = self.destinationPort;

    if(port.isReady){
      port.set(data);
    }else {

      const onReady = () => {
        self.buffer.shift()();
      }

      port.on('ready', onReady);

      self.buffer.push(() => port.set(data));
    }
  }



}
