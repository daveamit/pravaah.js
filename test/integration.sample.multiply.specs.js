"use strict";
//This is so that es6 feature of default arguments works properly
//that is used in box.js
require("babel-core/register");

const Box = require('../lib/box');
const Port = require('../lib/port');
const Connection = require('../lib/connection');
const assert = require('assert');
const sinon = require('sinon');

class JsonParserBox extends Box {
    constructor(name) {
        super(name, [new Port('in')], [new Port('x'), new Port('y')]);

        this.inPorts.in.on('data', (stringValue) => {
            //Parsing string to json
            var value = JSON.parse(stringValue);


            //Emiting parsed values onto corresponding ports.
            this.outPorts.x.set(value.x);
            this.outPorts.y.set(value.y);

            //inform in port that this box is now ready
            //for more stuff to process.
            this.inPorts.in.ready();
        });
    }
}

class MulBox extends Box {
    constructor(name) {
        super(name, [new Port('x'), new Port('y')], [new Port('result')]);

        var self = this;
        self.x = undefined;
        self.y = undefined;


        self.inPorts.x.on('data', (x) => {
            self.x = x;
            self.multiply();
        });
        self.inPorts.y.on('data', (y) => {
            self.y = y;
            self.multiply();
        });

        self.outPorts.result.on('ready', () => {
            //now make x and y port ready.
            self.inPorts.x.ready();
            self.inPorts.y.ready();
        });

    }

    multiply() {
        if (this.x && this.y) {

            this.outPorts.result.set(this.x * this.y);

            //unset x and y
            this.x = undefined;
            this.y = undefined;


        }
    }
}


class JsonSerialiserBox extends Box {
    constructor(name) {
        super(name, [new Port('property'), new Port('value')], [new Port('result')]);

        var self = this;
        self.property = undefined;
        self.value = undefined;


        self.inPorts.value.on('data', (value) => {
            self.inPorts.property.ready();

            self.value = value;
            self.serialise();
        });
        self.inPorts.property.on('data', (property) => {
            self.property = property;
            self.serialise();
        });

        self.outPorts.result.on('ready', () => {
            //now make property and value port ready.
            self.inPorts.property.ready();
            self.inPorts.value.ready();
        });


    }

    serialise() {
        var self = this;
        if (self.property && self.value) {
            var obj = {};
            obj[self.property] = self.value;

            self.outPorts.result.set(obj);

            //unset property and value
            self.property = undefined;
            self.value = undefined;

        }
    }
}

class StaticBox extends Box {
    constructor(name, value) {
        super(name, [], [new Port('out')]);
        const self = this;

        self.value = value;

        self.outPorts.out.on('ready', () => {
            self.outPorts.out.set(self.value);
        });
    }
}


describe('Integration scenario', () => {
    const jsonParserBox = new JsonParserBox('jsonBox');
    const mulBox = new MulBox('mulBox');
    const jsonSerialiseBox = new JsonSerialiserBox('jsonSerialiseBox');
    const staticBox = new StaticBox('staticBox', 'result');

    const jsonXtoMulX = new Connection('jsonXtoMulX', jsonParserBox.outPorts.x, mulBox.inPorts.x);
    const jsonYtoMulY = new Connection('jsonYtoMulY', jsonParserBox.outPorts.y, mulBox.inPorts.y);
    const mulResultToJson = new Connection('mulResultToJson', mulBox.outPorts.result, jsonSerialiseBox.inPorts.value);
    const staticToJson = new Connection('staticToJson', staticBox.outPorts.out, jsonSerialiseBox.inPorts.property);


    it('should return 50 as result when input x = 5 and y = 10', (done) => {
        var assertResult = (value) => {
            jsonSerialiseBox.outPorts.result.removeListener('data', assertResult);
            assert.deepEqual(value, {
                result: 50
            });
            done();
        };

        //Init static box.
        staticBox.outPorts.out.ready();
        jsonSerialiseBox.outPorts.result.on('data', assertResult);
        jsonParserBox.inPorts.in.set('{ "x": 5, "y": 10}');
        jsonSerialiseBox.outPorts.result.ready();
    });

    it('should be able to process (almost) parellel requests', (done) => {
        var exprectedResult = [];

        var assertResult = (value) => {
            jsonSerialiseBox.outPorts.result.removeListener('data', assertResult);
            assert.deepEqual(value, {
                result: exprectedResult.shift()
            });
            done();
        };
        jsonSerialiseBox.outPorts.result.on('data', assertResult);

        var scheduler = (x, y) => jsonParserBox.inPorts.in.set(`{ "x": ${x}, "y": ${y}}`);
        for (var i = 0; i < 8; i++) {
            var x = Math.random() * 100;
            var y = Math.random() * 100;

            exprectedResult.push(x * y);
            process.nextTick(scheduler.bind(scheduler, x, y));
        }

        //jsonSerialiseBox.outPorts.result.ready();
    });
});
