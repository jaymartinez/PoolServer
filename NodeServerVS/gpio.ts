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
        return new onoff.Gpio(pin, direction);
    }

    pinStatus(pin: string): PiPin {
        switch (pin) {
            case "5":
                this.poolPin.State = this.poolPin.Gpio.readSync();
                return this.poolPin;
            case "6":
                this.spaPin.State = this.spaPin.Gpio.readSync();
                return this.spaPin;
            case "17":
                this.heaterPin.State = this.heaterPin.Gpio.readSync();
                return this.heaterPin;
            case "13":
                this.boosterPin.State = this.boosterPin.Gpio.readSync();
                return this.boosterPin;
            case "19":
                this.poolLightPin.State = this.poolLightPin.Gpio.readSync();
                return this.poolLightPin;
            case "20":
                this.spaLightPin.State = this.spaLightPin.Gpio.readSync();
                return this.spaLightPin;
            case "21":
                this.groundLightsPin.State = this.groundLightsPin.Gpio.readSync();
                return this.groundLightsPin;
            default:
                throw "Unsupported pin number";
        }
    }

    allStatuses(): Array<PiPin> {
        this.poolPin.State = this.poolPin.Gpio.readSync();
        this.spaPin.State = this.spaPin.Gpio.readSync();
        this.heaterPin.State = this.heaterPin.Gpio.readSync();
        this.boosterPin.State = this.boosterPin.Gpio.readSync();
        this.poolLightPin.State = this.poolLightPin.Gpio.readSync();
        this.spaLightPin.State = this.spaLightPin.Gpio.readSync();
        this.groundLightsPin.State = this.groundLightsPin.Gpio.readSync();

        return [
            this.Pool,
            this.Spa,
            this.Heater,
            this.Booster,
            this.PoolLight,
            this.SpaLight,
            this.GroundLights
        ];
    }

    readPin(pin: PiPin): void {
        pin.State = pin.Gpio.readSync();
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
            console.log(pin.Name + " active at " + pin.DateActivated.toLocaleString());
        } else {
            pin.DateDeactivated = new Date(Date.now());
            finalStateString = "Off";
            console.log(pin.Name + " deactivated at " + pin.DateDeactivated.toLocaleString());
        }

        result = {
            Data: {
                State: pin.State,
                PinNumber: pin.PinNumber,
                DateActivated: pin.DateActivated,
                DateDeactivated: pin.DateDeactivated
            }
        };

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

