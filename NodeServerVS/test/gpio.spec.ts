import {should, ok} from "should";
import * as sinon from "sinon";
import { Gpio } from "onoff";
import { GPIO } from "../gpio";

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
        let gpio = new GPIO();
        let stub = sinon.stub(gpio, "createGpio");

        // act
        gpio.init();

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
        let gpio = new GPIO();

        gpio.should.be.instanceOf(GPIO);
        gpio.Pool.PinNumber.should.equal(5);
        gpio.Spa.PinNumber.should.equal(6);
        gpio.Heater.PinNumber.should.equal(17);
        gpio.Booster.PinNumber.should.equal(13);
        gpio.PoolLight.PinNumber.should.equal(19);
        gpio.SpaLight.PinNumber.should.equal(20);
        gpio.GroundLights.PinNumber.should.equal(21);
    });

    it("pinStatus verifies pool", () => {
        // arrange
        const gpio = new GPIO();
        let stub = sinon.stub(gpio, "readPin");

        // act
        gpio.pinStatus("5");

        // assert
        stub.withArgs(gpio.Pool).called.should.be.true("");
    });

    it("pinStatus verifies spa", () => {
        // arrange
        const gpio = new GPIO();
        let stub = sinon.stub(gpio, "readPin");

        // act
        gpio.pinStatus("6");

        // assert
        stub.withArgs(gpio.Spa).called.should.be.true("");
    });
    it("pinStatus verifies heater", () => {
        // arrange
        const gpio = new GPIO();
        let stub = sinon.stub(gpio, "readPin");

        // act
        gpio.pinStatus("17");

        // assert
        stub.withArgs(gpio.Heater).called.should.be.true("");
    });
    it("pinStatus verifies booster", () => {
        // arrange
        const gpio = new GPIO();
        let stub = sinon.stub(gpio, "readPin");

        // act
        gpio.pinStatus("13");

        // assert
        stub.withArgs(gpio.Booster).called.should.be.true("");
    });
    it("pinStatus verifies pool light", () => {
        // arrange
        const gpio = new GPIO();
        let stub = sinon.stub(gpio, "readPin");

        // act
        gpio.pinStatus("19");

        // assert
        stub.withArgs(gpio.PoolLight).called.should.be.true("");
    });
    it("pinStatus verifies spa light", () => {
        // arrange
        const gpio = new GPIO();
        let stub = sinon.stub(gpio, "readPin");

        // act
        gpio.pinStatus("20");

        // assert
        stub.withArgs(gpio.SpaLight).called.should.be.true("");
    });
    it("pinStatus verifies ground lights", () => {
        // arrange
        const gpio = new GPIO();
        let stub = sinon.stub(gpio, "readPin");

        // act
        gpio.pinStatus("21");

        // assert
        stub.withArgs(gpio.GroundLights).called.should.be.true("");
    });
    it("pinStatus verifies spa status", () => {
        // arrange
        const gpio = new GPIO();
        let stub = sinon.stub(gpio, "readPin");

        // act
        gpio.pinStatus("5");

        // assert
        stub.withArgs(gpio.Pool).called.should.be.true("");
    });
    it("pinStatus verifies spa status", () => {
        // arrange
        const gpio = new GPIO();
        let stub = sinon.stub(gpio, "readPin");

        // act
        gpio.pinStatus("5");

        // assert
        stub.withArgs(gpio.Pool).called.should.be.true("");
    });
});
