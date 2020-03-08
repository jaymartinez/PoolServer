import * as onoff from "onoff";
import { PiPin } from "./piPin";

export class GPIO {
    private poolPin: PiPin;
    private spaPin: PiPin;
    private heaterPin: PiPin;
    private boosterPin: PiPin;
    private poolLightPin: PiPin;
    private spaLightPin: PiPin;
    private groundLightsPin: PiPin;

    constructor() {
        this.poolPin = new PiPin(5);
        this.spaPin = new PiPin(6);
        this.heaterPin = new PiPin(17);
        this.boosterPin = new PiPin(13);
        this.poolLightPin = new PiPin(19);
        this.spaLightPin = new PiPin(20);
        this.groundLightsPin = new PiPin(21);
    }

    init() {
        this.poolPin.Gpio = this.createGpio(this.poolPin.PinNumber, "out");
        this.spaPin.Gpio = this.createGpio(this.spaPin.PinNumber, "out");
        this.boosterPin.Gpio = this.createGpio(this.boosterPin.PinNumber, "out");
        this.poolLightPin.Gpio = this.createGpio(this.poolLightPin.PinNumber, "out");
        this.spaLightPin.Gpio = this.createGpio(this.spaLightPin.PinNumber, "out");
        this.groundLightsPin.Gpio = this.createGpio(this.groundLightsPin.PinNumber, "out");
        this.heaterPin.Gpio = this.createGpio(this.heaterPin.PinNumber, "out");
    }

    createGpio(pin: number, direction: onoff.Direction): onoff.Gpio {
        console.log("ENTERED createGpio");
        return new onoff.Gpio(pin, direction);
    }

    pinStatus(pin: string): PiPin {
        switch (pin) {
            case "5":
                this.poolPin.State = this.readPin(this.poolPin);
                return this.poolPin;
            case "6":
                this.spaPin.State = this.readPin(this.spaPin);
                return this.spaPin;
            case "17":
                this.heaterPin.State = this.readPin(this.heaterPin);
                return this.heaterPin;
            case "13":
                this.boosterPin.State = this.readPin(this.boosterPin);
                return this.boosterPin;
            case "19":
                this.poolLightPin.State = this.readPin(this.poolLightPin);
                return this.poolLightPin;
            case "20":
                this.spaLightPin.State = this.readPin(this.spaLightPin);
                return this.spaLightPin;
            case "21":
                this.groundLightsPin.State = this.readPin(this.groundLightsPin);
                return this.groundLightsPin;
            default:
                throw "Unsupported pin number";
        }
    }

    readPin(pin: PiPin): onoff.BinaryValue {
        return pin.Gpio.readSync();
    }

    toggle(pin: PiPin) {
        let initialPinState: onoff.BinaryValue = pin.Gpio.readSync(),
            finalStateString: string = "",
            result: any = {};

        if (initialPinState === 1) {
            //Set pin low
            pin.Gpio.writeSync(0);
        } else {
            //Set pin high
            pin.Gpio.writeSync(1);
        }

        // final state
        pin.State = pin.Gpio.readSync();

        if (pin.State === 1) {
            pin.DateActivated = new Date(Date.now());
            finalStateString = "On";
        } else {
            pin.DateDeactivated = new Date(Date.now());
            finalStateString = "Off";
        }

        result = {
            Data: {
                State: pin.State,
                PinNumber: pin.PinNumber,
                DateActivated: pin.DateActivated,
                DateDeactivated: pin.DateDeactivated
            }
        };
        console.log("Request received: PIN " + pin.Name + " is now " + finalStateString);

        return result;
    }

    get Pool(): PiPin {
        return this.poolPin;
    }
    get Spa(): PiPin {
        return this.spaPin;
    }
    get Booster(): PiPin {
        return this.boosterPin;
    }
    get PoolLight(): PiPin {
        return this.poolLightPin;
    }
    get SpaLight(): PiPin {
        return this.spaLightPin;
    }
    get GroundLights(): PiPin {
        return this.groundLightsPin;
    }
    get Heater(): PiPin {
        return this.heaterPin;
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

