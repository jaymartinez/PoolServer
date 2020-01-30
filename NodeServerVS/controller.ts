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

export class Controller {
    private options: any;
    private gpio: GPIO;
    private timer: NodeJS.Timeout;
    private poolSchedule: EquipmentSchedule;
    private boosterSchedule: EquipmentSchedule;
    private scheduleEnabled: boolean;

	constructor(options: any) {
        if (options === undefined ||
            typeof options === "undefined" ||
            typeof options.gpio == "undefined") {
			throw "options is undefined";
		}
        this.scheduleEnabled = false;

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
        
        if (this.scheduleEnabled) {
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
		res.send(JSON.stringify(this.gpio.toggle(this.gpio.Pool, this.gpio.PoolPumpPin)));
	}
	toggleBoosterPump(req: Request, res: Response) {
		res.send(JSON.stringify(this.gpio.toggle(this.gpio.Booster, this.gpio.BoosterPumpPin)));
    }
    toggleSpaPump(req: Request, res: Response) {
		res.send(JSON.stringify(this.gpio.toggle(this.gpio.Spa, this.gpio.SpaPumpPin)));
    }
    togglePoolLight(req: Request, res: Response) {
		res.send(JSON.stringify(this.gpio.toggle(this.gpio.PoolLight, this.gpio.PoolLightPin)));
    }
    toggleSpaLight(req: Request, res: Response) {
		res.send(JSON.stringify(this.gpio.toggle(this.gpio.SpaLight, this.gpio.SpaLightPin)));
	}
	toggleGroundLights(req: Request, res: Response) {
		res.send(JSON.stringify(this.gpio.toggle(this.gpio.GroundLights, this.gpio.GroundLightsPin)));
    }
    toggleHeater(req: Request, res: Response) {
		res.send(JSON.stringify(this.gpio.toggle(this.gpio.Heater, this.gpio.HeaterPin)));
    }
    setSchedule(req: Request, res: Response): void {
		//var result = this.gpio.setSchedule(req.query.startDate, req.query.endDate);
		//res.send(JSON.stringify(result));
        let msg, result, startDate, endDate, endDateHour, endDateMinute, 
            startDateHour, startDateMinute, boosterEndHour, boosterEndMinute;

        if (!req.query.startDate || !req.query.endDate) {
            msg = "Invalid start or end date"; 
            result = { messages: ["FAIL: " + msg] };
            res.send(JSON.stringify(result));
            return;
        }

        try {
            console.log(">> isActive = " + req.query.isActive);
            this.scheduleEnabled = req.query.isActive;
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
		console.log("ENTERED pinStatus: pin = " + req.query.pinNumber);
		var pinState = this.gpio.pinStatus(req.query.pinNumber), result = {
			Data: {
				PinNumber: req.query.pinNumber,
				State: pinState
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
        console.log("ENTERED allStatuses");
        var result = {
            Messages: ["allStatuses Response"]
        };

        res.send(JSON.stringify(result));
    }
}

