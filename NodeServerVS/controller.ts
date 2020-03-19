//var onoffGpio = require("onoff").Gpio || { Gpio: function () { return; } };
//var gpio = require("./gpio");
import { GPIO } from "./gpio";
import { Request, json } from "express";
import { Response } from "express";
import { ResolveOptions } from "dns";
import { equal } from "assert";
import { setInterval } from "timers";
import { EquipmentSchedule } from "./typings/EquipmentSchedule";
import { _ } from "underscore";
import { ControllerOptions } from "./typings/ControllerOptions";
import { PiPin } from "./piPin";

export class Controller {
    private options: any;
    private gpio: GPIO;
    private timer: NodeJS.Timeout;
    private poolSchedule: EquipmentSchedule;
    private boosterSchedule: EquipmentSchedule;
    private scheduleEnabled: boolean;

	constructor(options: ControllerOptions) {
        if (options === undefined ||
            typeof options === "undefined" ||
            typeof options.gpio == "undefined") {
			throw "options is undefined";
		}
        this.scheduleEnabled = options.enableSchedule;

        this.gpio = options.gpio;

        this.poolSchedule = {
            startHour: 8,
            startMinute: 30,
            endHour: 14,
            endMinute: 30
        };

        this.boosterSchedule = {
            startHour: 8,
            startMinute: 35,
            endHour: 12,
            endMinute: 0
        };

		// Create the timer at 1s intervals
        this.startTimer(1000);
	}

    get ScheduleEnabled(): boolean {
        return this.scheduleEnabled;
    }

    get PoolSchedule(): EquipmentSchedule {
        return this.poolSchedule;
    }
    get BoosterSchedule(): EquipmentSchedule {
        return this.boosterSchedule;
    }

    startTimer(interval: number): void {
        this.timer = setInterval(_.bind(this.timerHandler, this), interval);
    }

	timerHandler(): void {
        const today: Date = new Date(),
            hour: number = today.getHours(),
            minute: number = today.getMinutes();
        
        if (this.scheduleEnabled) {
		    if (this.poolSchedule.startHour === hour && this.poolSchedule.startMinute === minute) {
			    if (this.gpio.Pool.Gpio.readSync() === 0) {
                    this.gpio.Pool.Gpio.writeSync(1);
                    this.gpio.Pool.DateActivated = new Date(Date.now());
				    console.log("Pool pump active at " + this.gpio.Pool.DateActivated.toLocaleString());
			    }
		    }
		    else if (this.poolSchedule.endHour === hour && this.poolSchedule.endMinute === minute) {
			    if (this.gpio.Pool.Gpio.readSync() === 1) {
                    this.gpio.Booster.Gpio.writeSync(0);
                    this.gpio.Heater.Gpio.writeSync(0);
                    this.gpio.Pool.Gpio.writeSync(0);
                    this.gpio.Pool.DateDeactivated = new Date(Date.now());
				    console.log("Pool pump deactivated at " + this.gpio.Pool.DateDeactivated.toLocaleString());
			    }
		    }
		    if (this.boosterSchedule.startHour === hour && this.boosterSchedule.startMinute === minute) {
			    if (this.gpio.Booster.Gpio.readSync() === 0) {
                    this.gpio.Booster.Gpio.writeSync(1);
                    this.gpio.Booster.DateActivated = new Date(Date.now());
				    console.log("Booster pump activated at " + this.gpio.Booster.DateActivated.toLocaleString());
			    }
		    }
		    else if (this.boosterSchedule.endHour === hour && this.boosterSchedule.endMinute === minute) {
			    if (this.gpio.Booster.Gpio.readSync() === 1) {
                    this.gpio.Booster.Gpio.writeSync(0);
                    this.gpio.Booster.DateDeactivated = new Date(Date.now());
				    console.log("Booster pump deactivated at " + this.gpio.Booster.DateDeactivated.toLocaleString());
			    }
		    }
        }
    }
    masterSwitchStatus(req: Request, res: Response) {
		let result = {
			Data: this.scheduleEnabled
		};
		res.send(JSON.stringify(result));
    }
	toggleMasterSwitch(req: Request, res: Response) {
        this.scheduleEnabled = !this.scheduleEnabled;

		let result = {
			Data: this.scheduleEnabled
		};
		res.send(JSON.stringify(result));
	}
	getSchedule(req: Request, res: Response) {
		var result = {
			Data: {
				StartHour: this.poolSchedule.startHour,
				StartMinute: this.poolSchedule.startMinute,
				EndHour: this.poolSchedule.endHour,
				EndMinute: this.poolSchedule.endMinute,
                IsActive: this.scheduleEnabled
			}
		};
		res.send(JSON.stringify(result));
	}
	ping(req: Request, res: Response) {
        console.log("Entered ping()");
		var result = { Messages: ["OK"] };
		res.send(JSON.stringify(result));
	}
	togglePoolPump(req: Request, res: Response) {
		res.send(JSON.stringify(this.gpio.toggle(this.gpio.Pool)));
	}
	toggleBoosterPump(req: Request, res: Response) {
		res.send(JSON.stringify(this.gpio.toggle(this.gpio.Booster)));
    }
    toggleSpaPump(req: Request, res: Response) {
		res.send(JSON.stringify(this.gpio.toggle(this.gpio.Spa)));
    }
    togglePoolLight(req: Request, res: Response) {
		res.send(JSON.stringify(this.gpio.toggle(this.gpio.PoolLight)));
    }
    toggleSpaLight(req: Request, res: Response) {
		res.send(JSON.stringify(this.gpio.toggle(this.gpio.SpaLight)));
	}
	toggleGroundLights(req: Request, res: Response) {
		res.send(JSON.stringify(this.gpio.toggle(this.gpio.GroundLights)));
    }
    toggleHeater(req: Request, res: Response) {
		res.send(JSON.stringify(this.gpio.toggle(this.gpio.Heater)));
    }
    setSchedule(req: Request, res: Response): void {
        let msg, result, startDate:Date, endDate:Date, endDateHour, endDateMinute, 
            startDateHour, startDateMinute, boosterEndHour, boosterEndMinute;

        if (!req.query.startDate || !req.query.endDate) {
            msg = "Invalid start or end date"; 
            result = { messages: ["FAIL: " + msg] };
            res.send(JSON.stringify(result));
            return;
        }

        try {
            console.log(">> isActive = " + req.query.isActive);
            this.scheduleEnabled = req.query.isActive === "True" || req.query.isActive === "true" ? true : false;
            startDate = new Date(req.query.startDate);
            endDate = new Date(req.query.endDate);

            console.log("Start: " + startDate.toLocaleTimeString() + "\n" + "End: " + endDate.toLocaleTimeString());

            startDateHour = startDate.getHours();
            startDateMinute = startDate.getMinutes();
            endDateHour = endDate.getHours();
            endDateMinute = endDate.getMinutes();

            this.poolSchedule.endHour = endDateHour;
            this.poolSchedule.endMinute = endDateMinute;
            this.poolSchedule.startHour = startDateHour;
            this.poolSchedule.startMinute = startDateMinute;


            // Make the booster start a minute after the pool pump and set the end hour 3.5 hours after the pool pump starts.
            // This is because the pool pump goes into low power mode after 4 hours.
            this.boosterSchedule.startHour = this.poolSchedule.startHour;
            this.boosterSchedule.startMinute = this.poolSchedule.startMinute + 5;

            boosterEndMinute = (this.poolSchedule.startMinute + 30) % 60;
            boosterEndHour = (this.poolSchedule.startHour + 3) % 24;
            console.log("\n\tBooster End Hour: " + boosterEndHour);
            console.log("\n\tBooster End Minute: " + boosterEndMinute);

            this.boosterSchedule.endHour = boosterEndHour;
            this.boosterSchedule.endMinute = boosterEndMinute;

            result = { 
                Data: {
                    StartHour:this.poolSchedule.startHour,
                    StartMinute:this.poolSchedule.startMinute,
                    EndHour:this.poolSchedule.endHour,
                    EndMinute:this.poolSchedule.endMinute
                } 
            };

        } catch (err) {
            msg = err.message || err.getMessage();
            result = { Messages: ["FAIL: " + msg] };
        }

        res.send(JSON.stringify(result));
    }
    pinStatus(req: Request, res: Response) {
        const pin: PiPin = this.gpio.pinStatus(req.query.pinNumber);
        let result: any = {};

        result = {
            Data: {
                PinNumber: pin.PinNumber,
                State: pin.State,
                DateActivated: pin.DateActivated,
                DateDeactivated: pin.DateDeactivated
            }
		};

		try {
			res.header("Access-Control-Allow-Origin", "*");
			res.send(JSON.stringify(result));
		}
		catch (ex) {
			console.log(ex.message || "There was an error sending the response from method [pinStatus()]");
            res.send(JSON.stringify({ Messages: [ex.message] }));
		}
	}
    allStatuses(req: Request, res: Response) {
        var result = {
            Messages: ["allStatuses Response"]
        };

        res.send(JSON.stringify(result));
    }
}

