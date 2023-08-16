"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tipDialogOpen = void 0;
const _kv_1 = require("./api/$kv");
const _room_1 = require("./api/$room");
require("./sharedCode");
// The logic of this file need to be wrapped in a function in order to be testable.
function tipDialogOpen($room, $kv) {
    $room.setTipOptions(JSON.parse($kv.get("$room.tipOptions", "{}")));
}
exports.tipDialogOpen = tipDialogOpen;
tipDialogOpen(_room_1.$room, _kv_1.$kv);
