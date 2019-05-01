import * as http from "http";
import * as express from "express";
import { Controller } from "./controller";
import { Pool } from "./gpio";

var app = express();

module.exports = app;

const _gpio = new Pool.GPIO();

// This does all the work. Creates gpio objects using the onoff library
//_gpio.init();

const options: any = {
    gpio: _gpio
};

const controller = new Controller(options); 

app.set('port', process.env.PORT || 8585);
app.get("/ping", controller.ping);
app.get("/login", controller.login);
app.get('/poolPump', controller.togglePoolPump);
app.get('/boosterPump', controller.toggleBoosterPump);
app.get('/spaPump', controller.toggleSpaPump);
app.get('/spaLight', controller.toggleSpaLight);
app.get('/poolLight', controller.togglePoolLight);
app.get('/groundLights', controller.toggleGroundLights);
app.get('/heater', controller.toggleHeater);
app.get('/setSchedule', controller.setSchedule);
app.get('/getSchedule', controller.getSchedule);
//this._app.get('/controller/analog', controller.analogPinCount);
app.get('/status', controller.pinStatus);
app.get('/toggleMasterSwitch', controller.toggleMasterSwitch);

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});


//var _masterSwitchState = MasterSwitchState.OFF;
/*
export module MasterSwitchState {
    export var ON = 1;
    export var OFF = 0;
}
*/
