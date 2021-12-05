
import * as onoff from "onoff";

export class PiPin {

    private pinNumber: number;
    private dateActivated: Date;
    private dateDeactivated: Date;
    private state: onoff.BinaryValue;
    private gpio: onoff.Gpio;

    constructor(pinNumber: number) {
        this.pinNumber = pinNumber;
        this.dateActivated = null;
        this.dateDeactivated = null;
        this.state = 0;
        this.gpio = null;
    }

    get Name(): string {
        switch (this.pinNumber) {
            case 5:
            case 6:
                return "Pool Pump";
            case 12:
            case 13:
                return "Booster Pump";
            case 17:
                return "Heater";
            case 19:
                return "Pool Light";
            case 20:
                return "Spa Light";
            case 21:
                return "Ground Lights";
            case 23:
            case 24:
                return "Spa Pump"
            default:
                return "Unknown";
        }
    }

    get PinNumber(): number {
        return this.pinNumber;
    }
    get DateActivated(): Date {
        return this.dateActivated;
    }
    get DateDeactivated(): Date {
        return this.dateDeactivated;
    }
    get Gpio(): onoff.Gpio {
        return this.gpio;
    }
    get State(): onoff.BinaryValue {
        return this.state;
    }

    set PinNumber(pinNumber: number) {
        this.pinNumber = pinNumber;
    }
    set DateActivated(date: Date) {
        this.dateActivated = date;
    }
    set DateDeactivated(date: Date) {
        this.dateDeactivated = date;
    }
    set Gpio(gpio: onoff.Gpio) {
        this.gpio = gpio;
    }
    set State(state: onoff.BinaryValue) {
        this.state = state;
    }
}