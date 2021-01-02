﻿import { should, ok } from "should";
import * as sinon from "sinon";
import * as controller from "../controller";
import { GPIO } from "../gpio";
import { setInterval } from "timers";
import { after } from "mocha";
import { ControllerOptions } from "../typings/ControllerOptions";

/*tslint:disable prefer-const*/
var persist = should;
/*tslint:enable prefer-const*/

describe("Controller Tests", () => {
    let c: controller.Controller; 
    var clock;

    beforeEach(() => {
        let gpio = sinon.createStubInstance(GPIO); 
        sinon.stub(gpio, "Pool").returns({
            readSync: function () {
                return;
            }
        });
        sinon.stub(gpio, "Spa").returns({
            readSync: function () {
                return;
            }
        });
        sinon.stub(gpio, "Booster").returns({
            readSync: function () {
                return;
            }
        });
        sinon.stub(gpio, "PoolLight").returns({
            readSync: function () {
                return;
            }
        });
        sinon.stub(gpio, "SpaLight").returns({
            readSync: function () {
                return;
            }
        });
        sinon.stub(gpio, "GroundLights").returns({
            readSync: function () {
                return;
            }
        });
        sinon.stub(gpio, "Heater").returns({
            readSync: function () {
                return;
            }
        });

        const opts: ControllerOptions = {
            gpio: gpio,
            enableSchedule: false,
            includeBoosterWithSchedule: false
        };
        c = new controller.Controller(opts);
        clock = sinon.useFakeTimers();
    });
    afterEach(() => {
        clock.restore();
    });

    it("Verify default options", () => {
        c.ScheduleEnabled.should.be.equal(false);
    });

    it("Verifies c exists", () => {
        c.should.be.instanceOf(controller.Controller);
    });

    it("Verifies default pool and booster schedule", () => {
        c.PoolSchedule.startHour.should.be.equal(8);
        c.PoolSchedule.startMinute.should.be.equal(30);
        c.PoolSchedule.endHour.should.be.equal(14);
        c.PoolSchedule.endMinute.should.be.equal(30);
        c.BoosterSchedule.startHour.should.be.equal(8);
        c.BoosterSchedule.startMinute.should.be.equal(35);
        c.BoosterSchedule.endHour.should.be.equal(12);
        c.BoosterSchedule.endMinute.should.be.equal(0);
    });

});
