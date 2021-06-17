import * as onoff from "onoff";
import { PiPin } from "./piPin";

export class GPIO {
    private poolPin1: PiPin;
    private poolPin2: PiPin;
    private spaPin1: PiPin;
    private spaPin2: PiPin;
    private boosterPin1: PiPin;
    private boosterPin2: PiPin;
    private heaterPin: PiPin;
    private poolLightPin: PiPin;
    private spaLightPin: PiPin;
    private groundLightsPin: PiPin;

    constructor() {
        this.poolPin1 = new PiPin(5);
        this.poolPin2 = new PiPin(6);

        this.spaPin1 = new PiPin(23);
        this.spaPin2 = new PiPin(24);

        this.boosterPin1 = new PiPin(12);
        this.boosterPin2 = new PiPin(13);

        this.heaterPin = new PiPin(17);
        this.poolLightPin = new PiPin(19);
        this.spaLightPin = new PiPin(20);
        this.groundLightsPin = new PiPin(21);
    }

    init() {
        this.poolPin1.Gpio = this.createGpio(this.poolPin1.PinNumber, "out");
        this.poolPin2.Gpio = this.createGpio(this.poolPin2.PinNumber, "out");
        this.spaPin1.Gpio = this.createGpio(this.spaPin1.PinNumber, "out");
        this.spaPin2.Gpio = this.createGpio(this.spaPin2.PinNumber, "out");
        this.boosterPin1.Gpio = this.createGpio(this.boosterPin1.PinNumber, "out");
        this.boosterPin2.Gpio = this.createGpio(this.boosterPin2.PinNumber, "out");
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
                this.poolPin1.State = this.poolPin1.Gpio.readSync();
                return this.poolPin1;
            case "6":
                this.poolPin2.State = this.poolPin2.Gpio.readSync();
                return this.poolPin2;
            case "23":
                this.spaPin1.State = this.spaPin1.Gpio.readSync();
                return this.spaPin1;
            case "24":
                this.spaPin2.State = this.spaPin2.Gpio.readSync();
                return this.spaPin2;
            case "12":
                this.boosterPin1.State = this.boosterPin1.Gpio.readSync();
                return this.boosterPin1;
            case "13":
                this.boosterPin2.State = this.boosterPin2.Gpio.readSync();
                return this.boosterPin2;
            case "17":
                this.heaterPin.State = this.heaterPin.Gpio.readSync();
                return this.heaterPin;
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
        this.poolPin1.State = this.poolPin1.Gpio.readSync();
        this.poolPin2.State = this.poolPin2.Gpio.readSync();
        this.spaPin1.State = this.spaPin1.Gpio.readSync();
        this.spaPin2.State = this.spaPin2.Gpio.readSync();
        this.boosterPin1.State = this.boosterPin1.Gpio.readSync();
        this.boosterPin2.State = this.boosterPin2.Gpio.readSync();
        this.heaterPin.State = this.heaterPin.Gpio.readSync();
        this.poolLightPin.State = this.poolLightPin.Gpio.readSync();
        this.spaLightPin.State = this.spaLightPin.Gpio.readSync();
        this.groundLightsPin.State = this.groundLightsPin.Gpio.readSync();

        return [
            this.Pool_1,
            this.Pool_2,
            this.Spa_1,
            this.Spa_2,
            this.Booster_1,
            this.Booster_2,
            this.Heater,
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

    get Pool_1(): PiPin {
        return this.poolPin1;
    }
    get Pool_2(): PiPin {
        return this.poolPin2;
    }
    get Spa_1(): PiPin {
        return this.spaPin1;
    }
    get Spa_2(): PiPin {
        return this.spaPin2;
    }
    get Booster_1(): PiPin {
        return this.boosterPin1;
    }
    get Booster_2(): PiPin {
        return this.boosterPin2;
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

