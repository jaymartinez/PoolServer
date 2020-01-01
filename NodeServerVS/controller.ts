//var _ = require("underscore");
//var onoffGpio = require("onoff").Gpio || { Gpio: function () { return; } };
//var gpio = require("./gpio");
import { Pool } from "./gpio";
import { Request, json } from "express";
import { Response } from "express";
import { ResolveOptions } from "dns";
import { equal } from "assert";
import { setInterval } from "timers";
import { EquipmentSchedule } from "./typings/EquipmentSchedule";
import { _ } from "underscore";

declare var _masterSwitchState: boolean;

export class Controller {
    private options: any;
    private gpio: Pool.GPIO;
    private timer: NodeJS.Timeout;
    private poolSchedule: EquipmentSchedule;
    private boosterSchedule: EquipmentSchedule;

	constructor(options: any) {
        if (options === undefined ||
            typeof options === "undefined" ||
            typeof options.gpio == "undefined") {
			throw "options is undefined";
		}

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

		if (this.poolSchedule.startHour === hour && this.poolSchedule.startMinute === minute) {
			if (this.gpio.Pool.readSync() === 0) {
				this.gpio.setPin(this.gpio.Pool, 1);
				console.log("Pool pump active at " + (new Date(Date.now())).toLocaleString());
			}
		}
		else if (this.poolSchedule.endHour === hour && this.poolSchedule.endMinute === minute) {
			if (this.gpio.Pool.readSync() === 1) {
				this.gpio.setPin(this.gpio.Pool, 0);
				console.log("Pool pump deactivated at " + (new Date(Date.now())).toLocaleString());
			}
		}
		if (this.boosterSchedule.startHour === hour && this.boosterSchedule.startMinute === minute) {
			if (this.gpio.Booster.readSync() === 0) {
				this.gpio.setPin(this.gpio.Booster, 1);
				console.log("Booster pump activated at " + (new Date(Date.now())).toLocaleString());
			}
		}
		else if (this.boosterSchedule.endHour === hour && this.boosterSchedule.endMinute === minute) {
			if (this.gpio.Booster.readSync() === 1) {
				this.gpio.setPin(this.gpio.Booster, 0);
				console.log("Booster pump deactivated at " + (new Date(Date.now())).toLocaleString());
			}
		}
	}
	toggleMasterSwitch(req: Request, res: Response) {
		_masterSwitchState = !_masterSwitchState;
		var result = {
			data: {}
		};
	}
	getSchedule(req: Request, res: Response) {
		var result = {
			data: {
				StartHour: this.poolSchedule.startHour,
				StartMinute: this.poolSchedule.startMinute,
				EndHour: this.poolSchedule.endHour,
				EndMinute: this.poolSchedule.endMinute
			}
		};
		res.send(JSON.stringify(result));
	}
	ping(req: Request, res: Response) {
		var result = { messages: ["OK"] };
		res.send(JSON.stringify(result));
	}
	login(req, res) {
		var user = req.query.username, password = req.query.password, response = {};
		console.log("Login invoked at " + (new Date(Date.now())).toLocaleString());
		if (user === "jaimee" && password === "Getyour0wnP@$$word") {
			response = { messages: ["OK"] };
		}
		else {
			response = { messages: ["FAIL"] };
		}
		res.send(200, JSON.stringify(response));
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
		//var result = this.gpio.setSchedule(req.query.startDate, req.query.endDate);
		//res.send(JSON.stringify(result));
        let msg, result, startDate, endDate, endDateHour, endDateMinute, startDateHour, startDateMinute, boosterEndHour, boosterEndMinute;

        if (!req.query.startDate || !req.query.endDate) {
            msg = "Invalid start or end date"; 
            result = { messages: ["FAIL: " + msg] };
            res.send(JSON.stringify(result));
            return;
        }

        try {
            startDate = new Date(req.query.startDate);
            endDate = new Date(req.query.endDate);

            console.log("EndDate - StartDate (in minutes) = " + ((endDate - startDate) / 1000).toString());

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

            result = { messages: ["SUCCESS"] };
        } catch (err) {
            msg = err.message || err.getMessage();
            result = { messages: ["FAIL: " + msg] };
        }

        res.send(JSON.stringify(result));
    }
    pinStatus(req: Request, res: Response) {
		console.log("ENTERED pinStatus");
		var equipment = this.gpio.getEquipmentName(req.query.pinNumber), pinState = this.gpio.pinStatus(req.query.pinNumber), result = {
			data: {
				PinObject: {
					PinNumber: req.query.pinNumber,
					State: pinState,
					StateDescription: pinState === 1 ? "ON" : "OFF"
				},
				Equipment: equipment,
			}
		};
		try {
			res.header("Access-Control-Allow-Origin", "*");
			res.send(JSON.stringify(result));
		}
		catch (ex) {
			console.log(ex.message || "There was an error sending the response from method [pinStatus()]");
		}
	}
}

