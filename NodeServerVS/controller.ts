//var onoffGpio = require("onoff").Gpio || { Gpio: function () { return; } };
//var gpio = require("./gpio");
import { GPIO, PumpState } from "./gpio";
import { Request, json } from "express";
import { Response } from "express";
import { ResolveOptions } from "dns";
import { equal } from "assert";
import { setInterval } from "timers";
import { EquipmentSchedule } from "./typings/EquipmentSchedule";
import * as _ from "underscore";
import { ControllerOptions } from "./typings/ControllerOptions";
import { PiPin } from "./piPin";
import { pipeline } from "stream";
import { PoolLightMode } from "./PoolLightMode";

export class Controller {
    private options: any;
    private gpio: GPIO;
    private timer: NodeJS.Timeout;
    private poolSchedule: EquipmentSchedule;
    private poolLightSchedule: EquipmentSchedule;
    private groundLightSchedule: EquipmentSchedule;
    private spaLightSchedule: EquipmentSchedule;
    private boosterSchedule: EquipmentSchedule;
    private scheduleEnabled: boolean;
    private poolLightScheduleEnabled: boolean;
    private groundLightScheduleEnabled: boolean;
    private spaLightScheduleEnabled: boolean;
    private includeBoosterWithSchedule: boolean;
    private poolLightMode: number;
    private previousPoolLightMode: number;
    private spaLightMode: number;
    private previousSpaLightMode: number;

	constructor(options: ControllerOptions) {
        if (options === undefined ||
            typeof options === "undefined" ||
            typeof options.gpio == "undefined") {
			throw "options is undefined";
		}
        this.scheduleEnabled = options.enableSchedule;
        this.poolLightScheduleEnabled = options.poolLightScheduleEnabled;
        this.groundLightScheduleEnabled = options.groundLightScheduleEnabled;
        this.includeBoosterWithSchedule = options.includeBoosterWithSchedule;
        this.poolLightMode = options.poolLightMode;
        this.previousPoolLightMode = PoolLightMode.notSet;
        this.spaLightMode = options.spaLightMode;
        this.previousSpaLightMode = PoolLightMode.notSet;

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

        this.poolLightSchedule = {
            startHour: 20,
            startMinute: 0,
            endHour: 1,
            endMinute: 0
        };

        this.spaLightSchedule = {
            startHour: 20,
            startMinute: 0,
            endHour: 1,
            endMinute: 0
        };

        this.groundLightSchedule = {
            startHour: 18,
            startMinute: 0,
            endHour: 1,
            endMinute: 0
        };

		// Create the timer at 1s intervals
        this.startTimer(1000);
	}

    get ScheduleEnabled(): boolean {
        return this.scheduleEnabled;
    }

    get IncludeBoosterWithSchedule(): boolean {
        return this.includeBoosterWithSchedule;
    }

    get PoolSchedule(): EquipmentSchedule {
        return this.poolSchedule;
    }
    get BoosterSchedule(): EquipmentSchedule {
        return this.boosterSchedule;
    }

    get PoolLightSchedule(): EquipmentSchedule {
        return this.poolLightSchedule;
    }
    get GroundLightSchedule(): EquipmentSchedule {
        return this.groundLightSchedule;
    }

    get PoolLightScheduleEnabled(): boolean {
        return this.poolLightScheduleEnabled;
    }
    get GroundLightScheduleEnabled(): boolean {
        return this.groundLightScheduleEnabled;
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

            // Only turn booster on if this flag is set, but allow it to turn off regardless for safety
		    if (this.includeBoosterWithSchedule && this.boosterSchedule.startHour === hour && this.boosterSchedule.startMinute === minute) {
			    if (this.gpio.Booster.Gpio.readSync() === 0) {
                    this.gpio.Booster.Gpio.writeSync(1);
                    this.gpio.Booster.DateActivated = new Date(Date.now());
				    console.log("Booster pump activated at " + this.gpio.Booster.DateActivated.toLocaleString());
			    }
		    }
		    if (this.boosterSchedule.endHour === hour && this.boosterSchedule.endMinute === minute) {
			    if (this.gpio.Booster.Gpio.readSync() === 1) {
                    this.gpio.Booster.Gpio.writeSync(0);
                    this.gpio.Booster.DateDeactivated = new Date(Date.now());
				    console.log("Booster pump deactivated at " + this.gpio.Booster.DateDeactivated.toLocaleString());
			    }
		    }
        }

        if (this.poolLightScheduleEnabled)
        {
            if (this.poolLightSchedule.startHour === hour && this.poolLightSchedule.startMinute === minute) {
                if (this.gpio.PoolLight.Gpio.readSync() === 0) {
                    this.gpio.PoolLight.Gpio.writeSync(1);
                    this.gpio.PoolLight.DateActivated = new Date(Date.now());
                    console.log("Pool Light active at " + this.gpio.PoolLight.DateActivated.toLocaleString());
                }
            }
            else if (this.poolLightSchedule.endHour === hour && this.poolLightSchedule.endMinute === minute) {
                if (this.gpio.PoolLight.Gpio.readSync() === 1) {
                    this.gpio.PoolLight.Gpio.writeSync(0);
                    this.gpio.PoolLight.DateDeactivated = new Date(Date.now());
                    console.log("Pool Light deactivated at " + this.gpio.PoolLight.DateDeactivated.toLocaleString());
                }
            }
        }

        if (this.groundLightScheduleEnabled)
        {
            if (this.groundLightSchedule.startHour === hour && this.groundLightSchedule.startMinute === minute) {
                if (this.gpio.GroundLights.Gpio.readSync() === 0) {
                    this.gpio.GroundLights.Gpio.writeSync(1);
                    this.gpio.GroundLights.DateActivated = new Date(Date.now());
                    console.log("Ground Lights active at " + this.gpio.GroundLights.DateActivated.toLocaleString());
                }
            }
            else if (this.groundLightSchedule.endHour === hour && this.groundLightSchedule.endMinute === minute) {
                if (this.gpio.GroundLights.Gpio.readSync() === 1) {
                    this.gpio.GroundLights.Gpio.writeSync(0);
                    this.gpio.GroundLights.DateDeactivated = new Date(Date.now());
                    console.log("Ground Lights deactivated at " + this.gpio.GroundLights.DateDeactivated.toLocaleString());
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
			Data: this.scheduleEnabled ? 1 : 0
		};
		res.send(JSON.stringify(result));
	}
    toggleIncludeBoosterSwitch(req: Request, res: Response) {

        this.includeBoosterWithSchedule = !this.includeBoosterWithSchedule;

		let result = {
			Data: this.includeBoosterWithSchedule ? 1 : 0
		};
        console.log("Toggling include booster - result is" + this.includeBoosterWithSchedule.toString());
		res.send(JSON.stringify(result));
    }
    getGroundLightSchedule(req: Request, res: Response) {
        console.log("Entering getGroundLightSchedule()");
		var result = {
			Data: {
				StartHour: this.groundLightSchedule.startHour,
				StartMinute: this.groundLightSchedule.startMinute,
				EndHour: this.groundLightSchedule.endHour,
				EndMinute: this.groundLightSchedule.endMinute,
                IsActive: this.groundLightScheduleEnabled
			}
		};
		res.send(JSON.stringify(result));
	}
    getPoolLightSchedule(req: Request, res: Response) {
        console.log("Entering getPoolLightSchedule()");
		var result = {
			Data: {
				StartHour: this.poolLightSchedule.startHour,
				StartMinute: this.poolLightSchedule.startMinute,
				EndHour: this.poolLightSchedule.endHour,
				EndMinute: this.poolLightSchedule.endMinute,
                IsActive: this.poolLightScheduleEnabled
			}
		};
		res.send(JSON.stringify(result));
	}
    getSpaLightSchedule(req: Request, res: Response) {
        console.log("Entered getSpaLightSchedule()");
		var result = {
			Data: {
				StartHour: this.spaLightSchedule.startHour,
				StartMinute: this.spaLightSchedule.startMinute,
				EndHour: this.spaLightSchedule.endHour,
				EndMinute: this.spaLightSchedule.endMinute,
                IsActive: this.spaLightScheduleEnabled
			}
		};
		res.send(JSON.stringify(result));
	}
	getSchedule(req: Request, res: Response) {
        console.log("Entered getSchedule()");
		var result = {
			Data: {
				StartHour: this.poolSchedule.startHour,
				StartMinute: this.poolSchedule.startMinute,
				EndHour: this.poolSchedule.endHour,
				EndMinute: this.poolSchedule.endMinute,
                IsActive: this.scheduleEnabled,
                IncludeBooster: this.includeBoosterWithSchedule
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
    savePoolLightMode(req: Request, res: Response) {
        this.previousPoolLightMode = this.poolLightMode;
        this.poolLightMode = req.query.mode;

        let result = {
            Data: {
                CurrentMode: this.poolLightMode,
                PreviousMode: this.previousPoolLightMode
            }
        };
        console.log("Saving pool light mode - result is" + this.poolLightMode.toString());
        res.send(JSON.stringify(result));
    }
    getPoolLightMode(req: Request, res: Response) {
        let result = {
            Data: {
                CurrentMode: this.poolLightMode,
                PreviousMode: this.previousPoolLightMode
            }
        };
        res.send(JSON.stringify(result));
    }
    saveSpaLightMode(req: Request, res: Response) {
        this.previousSpaLightMode = this.spaLightMode;
        this.spaLightMode = req.query.mode;

        let result = {
            Data: {
                CurrentMode: this.spaLightMode,
                PreviousMode: this.previousSpaLightMode
            }
        };
        console.log("Saving pool light mode - result is" + this.poolLightMode.toString());
        res.send(JSON.stringify(result));
    }
    getSpaLightMode(req: Request, res: Response) {
        let result = {
            Data: {
                CurrentMode: this.spaLightMode,
                PreviousMode: this.previousSpaLightMode
            }
        };
        res.send(JSON.stringify(result));
    }
    setGroundLightSchedule(req: Request, res: Response) {
        let msg, result, startDate:Date, endDate:Date, endDateHour, endDateMinute, startDateHour, startDateMinute;

        if (!req.query.startDate || !req.query.endDate) {
            msg = "Invalid start or end date"; 
            result = { messages: ["FAIL: " + msg] };
            res.send(JSON.stringify(result));
            return;
        }

        try {
            startDate = new Date(req.query.startDate);
            endDate = new Date(req.query.endDate);

            console.log(">> setting ground light schedule active = " + req.query.isActive);
            console.log("Saving ground light schedule---Start: " + startDate.toLocaleTimeString() + "\n" + "End: " + endDate.toLocaleTimeString());

            startDateHour = startDate.getHours();
            startDateMinute = startDate.getMinutes();
            endDateHour = endDate.getHours();
            endDateMinute = endDate.getMinutes();

            this.groundLightScheduleEnabled = req.query.isActive === "True" || req.query.isActive === "true" ? true : false;
            this.groundLightSchedule.endHour = endDateHour;
            this.groundLightSchedule.endMinute = endDateMinute;
            this.groundLightSchedule.startHour = startDateHour;
            this.groundLightSchedule.startMinute = startDateMinute;

            result = {
                Data: {
                    StartHour: this.groundLightSchedule.startHour,
                    StartMinute: this.groundLightSchedule.startMinute,
                    EndHour: this.groundLightSchedule.endHour,
                    EndMinute: this.groundLightSchedule.endMinute
                }
            };

        } catch (err) {
            msg = err.message || err.getMessage();
            result = { Messages: ["FAIL: " + msg] };
        }

        res.send(JSON.stringify(result));
    }
    setPoolLightSchedule(req: Request, res: Response) {
        let msg, result, startDate:Date, endDate:Date, endDateHour, endDateMinute, startDateHour, startDateMinute;

        if (!req.query.startDate || !req.query.endDate) {
            msg = "Invalid start or end date"; 
            result = { messages: ["FAIL: " + msg] };
            res.send(JSON.stringify(result));
            return;
        }

        try {
            startDate = new Date(req.query.startDate);
            endDate = new Date(req.query.endDate);

            console.log(">> setting pool light schedule active = " + req.query.isActive);
            console.log("Start: " + startDate.toLocaleTimeString() + "\n" + "End: " + endDate.toLocaleTimeString());

            startDateHour = startDate.getHours();
            startDateMinute = startDate.getMinutes();
            endDateHour = endDate.getHours();
            endDateMinute = endDate.getMinutes();

            this.poolLightScheduleEnabled = req.query.isActive === "True" || req.query.isActive === "true" ? true : false;
            this.poolLightSchedule.endHour = endDateHour;
            this.poolLightSchedule.endMinute = endDateMinute;
            this.poolLightSchedule.startHour = startDateHour;
            this.poolLightSchedule.startMinute = startDateMinute;

            result = {
                Data: {
                    StartHour: this.poolLightSchedule.startHour,
                    StartMinute: this.poolLightSchedule.startMinute,
                    EndHour: this.poolLightSchedule.endHour,
                    EndMinute: this.poolLightSchedule.endMinute
                }
            };

        } catch (err) {
            msg = err.message || err.getMessage();
            result = { Messages: ["FAIL: " + msg] };
        }

        res.send(JSON.stringify(result));
    }
    setSpaLightSchedule(req: Request, res: Response) {
        let msg, result, startDate:Date, endDate:Date, endDateHour, endDateMinute, startDateHour, startDateMinute;

        if (!req.query.startDate || !req.query.endDate) {
            msg = "Invalid start or end date"; 
            result = { messages: ["FAIL: " + msg] };
            res.send(JSON.stringify(result));
            return;
        }

        try {
            startDate = new Date(req.query.startDate);
            endDate = new Date(req.query.endDate);

            console.log(">> setting spa light schedule active = " + req.query.isActive);
            console.log("Start: " + startDate.toLocaleTimeString() + "\n" + "End: " + endDate.toLocaleTimeString());

            startDateHour = startDate.getHours();
            startDateMinute = startDate.getMinutes();
            endDateHour = endDate.getHours();
            endDateMinute = endDate.getMinutes();

            this.spaLightScheduleEnabled = req.query.isActive === "True" || req.query.isActive === "true" ? true : false;
            this.spaLightSchedule.endHour = endDateHour;
            this.spaLightSchedule.endMinute = endDateMinute;
            this.spaLightSchedule.startHour = startDateHour;
            this.spaLightSchedule.startMinute = startDateMinute;

            result = {
                Data: {
                    StartHour: this.spaLightSchedule.startHour,
                    StartMinute: this.spaLightSchedule.startMinute,
                    EndHour: this.spaLightSchedule.endHour,
                    EndMinute: this.spaLightSchedule.endMinute
                }
            };

        } catch (err) {
            msg = err.message || err.getMessage();
            result = { Messages: ["FAIL: " + msg] };
        }

        res.send(JSON.stringify(result));
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
            this.includeBoosterWithSchedule = req.query.includeBooster === "True" || req.query.includeBooster === "true" ? true : false;
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
        var pins = this.gpio.allStatuses();

        var newPins = _.map(pins, pin => {
            let piPin = new PiPin(pin.PinNumber);
            piPin.DateActivated = pin.DateActivated;
            piPin.DateDeactivated = pin.DateDeactivated;
            piPin.State = pin.State;
            return piPin;
        });

        const result = {
            Data: newPins
        };

		try {
			res.header("Access-Control-Allow-Origin", "*");
            res.send(JSON.stringify(result));
		}
		catch (ex) {
			console.log(ex.message || "There was an error sending the response from method - [allStatuses()]");
            res.send(JSON.stringify({ Messages: [ex.message] }));
		}
    }
}

