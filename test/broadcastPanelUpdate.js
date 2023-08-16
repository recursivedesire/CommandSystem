"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastPanelUpdate = void 0;
const _kv_1 = require("./api/$kv");
const _room_1 = require("./api/$room");
require("./sharedCode");
// The logic of this file need to be wrapped in a function in order to be testable.
function broadcastPanelUpdate($kv, $room) {
    const panelTemplate = $kv.get("$room.panelTemplate", null);
    if (panelTemplate !== null) {
        $room.setPanelTemplate(JSON.parse(panelTemplate));
    }
}
exports.broadcastPanelUpdate = broadcastPanelUpdate;
broadcastPanelUpdate(_kv_1.$kv, _room_1.$room);
