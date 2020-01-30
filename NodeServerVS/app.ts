import * as http from "http";
import * as express from "express";
import { Controller } from "./controller";
import { GPIO } from "./gpio";
import { _ } from "underscore";
import * as https from "https";
import * as fs from "fs";

var app = express();

module.exports = app;

const _gpio = new GPIO();

const options: any = {
    gpio: _gpio
};

const controller = new Controller(options); 

app.set('port', process.env.PORT || 9000);
app.get('/ping', _.bind(controller.ping, controller));
app.get('/login', _.bind(controller.login, controller));
app.get('/poolPump', _.bind(controller.togglePoolPump, controller));
app.get('/boosterPump', _.bind(controller.toggleBoosterPump, controller));
app.get('/spaPump', _.bind(controller.toggleSpaPump, controller));
app.get('/spaLight', _.bind(controller.toggleSpaLight, controller));
app.get('/poolLight', _.bind(controller.togglePoolLight, controller));
app.get('/groundLights', _.bind(controller.toggleGroundLights, controller));
app.get('/heater', _.bind(controller.toggleHeater, controller));
app.get('/setSchedule', _.bind(controller.setSchedule, controller));
app.get('/getSchedule', _.bind(controller.getSchedule, controller));
app.get('/status', _.bind(controller.pinStatus, controller));
app.get('/allStatuses', _.bind(controller.allStatuses, controller));
app.get('/toggleMasterSwitch', _.bind(controller.toggleMasterSwitch, controller));
app.get('/masterSwitchStatus', _.bind(controller.masterSwitchStatus, controller));

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

/*
https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
}, app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
*/

/*
var _masterSwitchState = MasterSwitchState.OFF;
export module MasterSwitchState {
    export var ON = 1;
    export var OFF = 0;
}
*/
