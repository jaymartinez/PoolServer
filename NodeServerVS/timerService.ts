export class TimerService {
    private timer: NodeJS.Timeout;
    
    constructor() { }

    startTimer(interval: any, handler: any) {
        this.timer = setInterval(handler, interval);
    }

}