import {should, ok} from "should";
import * as sinon from "sinon";
import { Gpio } from "onoff";
import { GPIO } from "../gpio";

var persist = should;

describe("Gpio tests", () => {
    let _fakeOnoff: sinon.SinonStubbedInstance<Gpio>;
    const poolPumpPin1: number = 5;
    const poolPumpPin2: number = 6;
    const spaPumpPin1: number = 23;
    const spaPumpPin2: number = 24;
    const boosterPumpPin1: number = 12;
    const boosterPumpPin2: number = 13;
    const heaterPin: number = 17;
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
        stub.withArgs(poolPumpPin1, "out").called.should.be.true("pool");
        stub.withArgs(poolPumpPin2, "out").called.should.be.true("pool");
        stub.withArgs(spaPumpPin1, "out").called.should.be.true("spa");
        stub.withArgs(spaPumpPin2, "out").called.should.be.true("spa");
        stub.withArgs(boosterPumpPin1, "out").called.should.be.true("booster");
        stub.withArgs(boosterPumpPin2, "out").called.should.be.true("booster");
        stub.withArgs(poolLightPin, "out").called.should.be.true("poollight");
        stub.withArgs(spaLightPin, "out").called.should.be.true("spalight");
        stub.withArgs(groundLightsPin, "out").called.should.be.true("groundlights");
        stub.withArgs(heaterPin, "out").called.should.be.true("heater");
    });

    it("Tests constructor sets pins", () => {
        let gpio = new GPIO();

        gpio.should.be.instanceOf(GPIO);
        gpio.Pool_1.PinNumber.should.equal(5);
        gpio.Pool_2.PinNumber.should.equal(6);
        gpio.Spa_1.PinNumber.should.equal(23);
        gpio.Spa_2.PinNumber.should.equal(24);
        gpio.Heater.PinNumber.should.equal(17);
        gpio.Booster_1.PinNumber.should.equal(12);
        gpio.Booster_2.PinNumber.should.equal(13);
        gpio.PoolLight.PinNumber.should.equal(19);
        gpio.SpaLight.PinNumber.should.equal(20);
        gpio.GroundLights.PinNumber.should.equal(21);
    });

    it("pinStatus verifies pool1", () => {
        // arrange
        const gpio = new GPIO();
        let stub = sinon.stub(gpio, "readPin");

        // act
        gpio.pinStatus("5");

        // assert
        stub.withArgs(gpio.Pool_1).called.should.be.true("");
    });

    it("pinStatus verifies pool2", () => {
        // arrange
        const gpio = new GPIO();
        let stub = sinon.stub(gpio, "readPin");

        // act
        gpio.pinStatus("6");

        // assert
        stub.withArgs(gpio.Pool_2).called.should.be.true("");
    });

    it("pinStatus verifies spa1", () => {
        // arrange
        const gpio = new GPIO();
        let stub = sinon.stub(gpio, "readPin");

        // act
        gpio.pinStatus("23");

        // assert
        stub.withArgs(gpio.Spa_1).called.should.be.true("");
    });

    it("pinStatus verifies spa2", () => {
        // arrange
        const gpio = new GPIO();
        let stub = sinon.stub(gpio, "readPin");

        // act
        gpio.pinStatus("24");

        // assert
        stub.withArgs(gpio.Spa_2).called.should.be.true("");
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
    it("pinStatus verifies booster1", () => {
        // arrange
        const gpio = new GPIO();
        let stub = sinon.stub(gpio, "readPin");

        // act
        gpio.pinStatus("12");

        // assert
        stub.withArgs(gpio.Booster_1).called.should.be.true("");
    });
    it("pinStatus verifies booster2", () => {
        // arrange
        const gpio = new GPIO();
        let stub = sinon.stub(gpio, "readPin");

        // act
        gpio.pinStatus("13");

        // assert
        stub.withArgs(gpio.Booster_2).called.should.be.true("");
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
});
