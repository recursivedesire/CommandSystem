"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callback = void 0;
const _callback_1 = require("./api/$callback");
const _room_1 = require("./api/$room");
require("./sharedCode");
// The logic of this file need to be wrapped in a function in order to be testable.
function callback($room, $callback) {
    $room.sendNotice(`Callback '${$callback.label}' triggered!`);
}
exports.callback = callback;
callback(_room_1.$room, _callback_1.$callback);
