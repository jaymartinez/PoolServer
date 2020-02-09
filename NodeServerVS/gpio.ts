//import { Gpio } from "onoff";
//import { Direction } from "onoff";
//import { BinaryValue } from "onoff";
import * as onoff from "onoff";


declare var _masterSwitchState: boolean;

export class GPIO {
    private poolPumpPin: number;
    private spaPumpPin: number;
    private heaterPin: number;
    private boosterPumpPin: number;
    private poolLightPin: number;
    private spaLightPin: number;
    private groundLightsPin: number;

    private pool: onoff.Gpio;
    private spa: onoff.Gpio;
    private booster: onoff.Gpio;
    private poolLight: onoff.Gpio;
    private spaLight: onoff.Gpio;
    private groundLights: onoff.Gpio;
    private heater: onoff.Gpio;

    constructor() {
        this.poolPumpPin = 5;
        this.spaPumpPin = 6;
        this.heaterPin = 17;
        this.boosterPumpPin = 13;
        this.poolLightPin = 19;
        this.spaLightPin = 20;
        this.groundLightsPin = 21;

        this.init();
    }

    get PoolPumpPin(): number {
        return this.poolPumpPin;
    }
    get SpaPumpPin(): number {
        return this.spaPumpPin;
    }
    get HeaterPin(): number {
        return this.heaterPin;
    }
    get BoosterPumpPin(): number {
        return this.boosterPumpPin;
    }
    get PoolLightPin(): number {
        return this.poolLightPin;
    }
    get SpaLightPin(): number {
        return this.spaLightPin;
    }
    get GroundLightsPin(): number {
        return this.groundLightsPin;
    }
    get Pool(): onoff.Gpio {
        return this.pool;
    }
    get Spa(): onoff.Gpio {
        return this.spa;
    }
    get Booster(): onoff.Gpio {
        return this.booster;
    }
    get PoolLight(): onoff.Gpio {
        return this.poolLight;
    }
    get SpaLight(): onoff.Gpio {
        return this.spaLight;
    }
    get GroundLights(): onoff.Gpio {
        return this.groundLights;
    }
    get Heater(): onoff.Gpio {
        return this.heater;
    }

    init() {
        this.pool = this.createGpio(this.poolPumpPin, "out");
        this.spa = this.createGpio(this.spaPumpPin, "out");
        this.booster = this.createGpio(this.boosterPumpPin, "out");
        this.poolLight = this.createGpio(this.poolLightPin, "out");
        this.spaLight = this.createGpio(this.spaLightPin, "out");
        this.groundLights = this.createGpio(this.groundLightsPin, "out");
        this.heater = this.createGpio(this.heaterPin, "out");
    }

    createGpio(pin: number, direction: onoff.Direction): onoff.Gpio {
        console.log("ENTERED createGpio");
        return new onoff.Gpio(pin, direction);
    }

    setPin(pinObj: onoff.Gpio, state: onoff.BinaryValue) {
        pinObj.writeSync(state);
    }

    pinStatus(pin: string) {
        switch (pin) {
            case "5":
                return this.pool.readSync();
            case "6":
                return this.spa.readSync();
            case "17":
                return this.heater.readSync();
            case "18":
                return this.booster.readSync();
            case "19":
                return this.poolLight.readSync();
            case "20":
                return this.spaLight.readSync();
            case "21":
                return this.groundLights.readSync();
        }
    }

    getEquipmentName(pin: number) {
        let equipment = "";

        switch (pin) {
            case this.poolPumpPin:
                equipment = "Pool Pump";
                break;
            case this.spaPumpPin:
                equipment = "Spa Pump";
                break;
            case this.heaterPin:
                equipment = "Heater";
                break;
            case this.boosterPumpPin:
                equipment = "Booster Pump";
                break;
            case this.poolLightPin:
                equipment = "Pool Light";
                break;
            case this.spaLightPin:
                equipment = "Spa Light";
                break;
            case this.groundLightsPin:
                equipment = "Ground Lights";
                break;
        }

        return equipment;
    }

    toggle(gpio: any, pin: any) {
        let initialPinState = gpio.readSync(),
            finalStateString = "",
            finalState,
            result;

        if (initialPinState === 1) {
            //Set pin low
            gpio.writeSync(0);
        } else {
            //Set pin high
            gpio.writeSync(1);
        }

        finalState = gpio.readSync();
        finalStateString = finalState === 1 ? "On" : "Off";

        result = {
            Data: {
                State: finalState,
                PinNumber: pin
            }
        };
        console.log("Request received: PIN " + pin + " is now " + finalStateString);

        return result;
    }
}

export module TimeConstants {
    export var ThreeHoursInMilliseconds: number = 10800000;
    export var OneMinuteInMilliseconds: number = 60000;
}

export module PumpState {
    export var ON: number = 1;
    export var OFF: number = 0;
}

