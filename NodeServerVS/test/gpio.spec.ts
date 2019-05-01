import {should, ok} from "should";
import * as sinon from "sinon";
import { Gpio } from "onoff";
import { Pool } from "../gpio";

var persist = should;

describe("Gpio tests", () => {
    let fakeOnoff: sinon.SinonStubbedInstance<Gpio>;
    let _gpio: Pool.GPIO;
    const fakeMethod: any = () => { return; };

    beforeEach(() => {
        //fakeOnoff = sinon.createStubInstance(Gpio);
        _gpio = new Pool.GPIO();

        sinon.stub(_gpio, "createGpio").callsFake((pin, direction) => {
            let fakeGpioObject: any = {};
            fakeGpioObject.pinNumber = 0;
            fakeGpioObject.writeSync = (state: any) => {
                return;
            };

            return fakeGpioObject;
        });
    });

    it("Tests gpio exists", () => {
        _gpio.should.be.instanceOf(Pool.GPIO);
    });

    it("Tests constructor sets pins", () => {
        _gpio.PoolPumpPin.should.equal(5);
        _gpio.SpaPumpPin.should.equal(6);
        _gpio.HeaterPin.should.equal(17);
        _gpio.BoosterPumpPin.should.equal(18);
        _gpio.PoolLightPin.should.equal(19);
        _gpio.SpaLightPin.should.equal(20);
        _gpio.GroundLightsPin.should.equal(21);
    });

    it("Verifies setPin() calls writeSync with correct args", () => {
        // arrange
        _gpio.init();

        // act
        _gpio.setPin(_gpio.Pool, 1);

        // assert
    });
});
