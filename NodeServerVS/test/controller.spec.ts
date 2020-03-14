import { should, ok } from "should";
import * as sinon from "sinon";
import * as controller from "../controller";
import { DeviceManager } from "../deviceManager";
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
        let device = new DeviceManager();
        sinon.stub(device, "Pool").returns({
            readSync: function () {
                return;
            }
        });
        sinon.stub(device, "Spa").returns({
            readSync: function () {
                return;
            }
        });
        sinon.stub(device, "Booster").returns({
            readSync: function () {
                return;
            }
        });
        sinon.stub(device, "PoolLight").returns({
            readSync: function () {
                return;
            }
        });
        sinon.stub(device, "SpaLight").returns({
            readSync: function () {
                return;
            }
        });
        sinon.stub(device, "GroundLights").returns({
            readSync: function () {
                return;
            }
        });
        sinon.stub(device, "Heater").returns({
            readSync: function () {
                return;
            }
        });

        const opts: ControllerOptions = {
            device: device,
            enableSchedule: false
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
