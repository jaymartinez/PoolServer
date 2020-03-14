﻿import {should, ok} from "should";
import { Direction } from "onoff";
import * as sinon from "sinon";
import { Gpio } from "onoff";
import { DeviceManager } from "../deviceManager";
import * as onoff from "onoff";
import { PiPin } from "../piPin";
import { debug } from "util";

var persist = should;

describe("Gpio tests", () => {
    let _fakeOnoff: sinon.SinonStubbedInstance<Gpio>;
    const poolPumpPin: number = 5;
    const spaPumpPin: number = 6;
    const heaterPin: number = 17;
    const boosterPumpPin: number = 13;
    const poolLightPin: number = 19;
    const spaLightPin: number = 20;
    const groundLightsPin: number = 21;
    const fakeMethod: any = () => { return; };

    beforeEach(() => {
        _fakeOnoff = sinon.createStubInstance(Gpio);
    });

    it("Init creates gpio", () => {
        // arrange
        let device = new DeviceManager();
        let stub = sinon.stub(device, "createGpio");

        // act
        device.init();

        // assert
        stub.withArgs(poolPumpPin, "out").called.should.be.true("pool");
        stub.withArgs(spaPumpPin, "out").called.should.be.true("spa");
        stub.withArgs(boosterPumpPin, "out").called.should.be.true("booster");
        stub.withArgs(poolLightPin, "out").called.should.be.true("poollight");
        stub.withArgs(spaLightPin, "out").called.should.be.true("spalight");
        stub.withArgs(groundLightsPin, "out").called.should.be.true("groundlights");
        stub.withArgs(heaterPin, "out").called.should.be.true("heater");
    });

    it("Tests constructor sets pins", () => {
        let device = new DeviceManager();

        device.should.be.instanceOf(DeviceManager);
        device.Pool.PinNumber.should.equal(5);
        device.Spa.PinNumber.should.equal(6);
        device.Heater.PinNumber.should.equal(17);
        device.Booster.PinNumber.should.equal(13);
        device.PoolLight.PinNumber.should.equal(19);
        device.SpaLight.PinNumber.should.equal(20);
        device.GroundLights.PinNumber.should.equal(21);
    });

    it("pinStatus verifies pool", () => {
        // arrange
        const device = new DeviceManager();
        let stub = sinon.stub(device, "readPin");

        // act
        device.pinStatus("5");

        // assert
        stub.withArgs(device.Pool).called.should.be.true("");
    });

    it("pinStatus verifies spa", () => {
        // arrange
        const device = new DeviceManager();
        let stub = sinon.stub(device, "readPin");

        // act
        device.pinStatus("6");

        // assert
        stub.withArgs(device.Spa).called.should.be.true("");
    });
    it("pinStatus verifies heater", () => {
        // arrange
        const device = new DeviceManager();
        let stub = sinon.stub(device, "readPin");

        // act
        device.pinStatus("17");

        // assert
        stub.withArgs(device.Heater).called.should.be.true("");
    });
    it("pinStatus verifies booster", () => {
        // arrange
        const device = new DeviceManager();
        let stub = sinon.stub(device, "readPin");

        // act
        device.pinStatus("13");

        // assert
        stub.withArgs(device.Booster).called.should.be.true("");
    });
    it("pinStatus verifies pool light", () => {
        // arrange
        const device = new DeviceManager();
        let stub = sinon.stub(device, "readPin");

        // act
        device.pinStatus("19");

        // assert
        stub.withArgs(device.PoolLight).called.should.be.true("");
    });
    it("pinStatus verifies spa light", () => {
        // arrange
        const device = new DeviceManager();
        let stub = sinon.stub(device, "readPin");

        // act
        device.pinStatus("20");

        // assert
        stub.withArgs(device.SpaLight).called.should.be.true("");
    });
    it("pinStatus verifies ground lights", () => {
        // arrange
        const device = new DeviceManager();
        let stub = sinon.stub(device, "readPin");

        // act
        device.pinStatus("21");

        // assert
        stub.withArgs(device.GroundLights).called.should.be.true("");
    });
    it("pinStatus verifies spa status", () => {
        // arrange
        const device = new DeviceManager();
        let stub = sinon.stub(device, "readPin");

        // act
        device.pinStatus("5");

        // assert
        stub.withArgs(device.Pool).called.should.be.true("");
    });
    it("pinStatus verifies spa status", () => {
        // arrange
        const device = new DeviceManager();
        let stub = sinon.stub(device, "readPin");

        // act
        device.pinStatus("5");

        // assert
        stub.withArgs(device.Pool).called.should.be.true("");
    });
});
