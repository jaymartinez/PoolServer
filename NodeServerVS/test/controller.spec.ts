import { should, ok } from "should";
import * as sinon from "sinon";
import * as controller from "../controller";
import { setInterval } from "timers";

/*tslint:disable prefer-const*/
var persist = should;
/*tslint:enable prefer-const*/

describe("Controller Tests", () => {
    let c: controller.Controller; 

    beforeEach(() => {
        const opts = {
            gpio: sinon.createStubInstance(controller.Controller)
        };
        c = new controller.Controller(opts);
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
