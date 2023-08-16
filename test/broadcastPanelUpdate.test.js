"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const proxyquire_1 = __importDefault(require("proxyquire"));
const { broadcastPanelUpdate } = (0, proxyquire_1.default)('./broadcastPanelUpdate', {
    './api/$kv': { $kv: { get: (key) => { return null; } } },
    './api/$room': { $room: { setPanelTemplate: (panelTemplate) => { return false; } } }
});
(0, ava_1.default)('Executes setPanelTemplate if KV-value set', t => {
    const $kv = {
        get(key, defaultValue) {
            return "{}";
        }
    };
    let didRun = false;
    const $room = {
        setPanelTemplate(panelTemplate) {
            didRun = true;
            return true;
        }
    };
    broadcastPanelUpdate($kv, $room);
    t.true(didRun);
});
(0, ava_1.default)('Skips setPanelTemplate if KV-value unset', t => {
    const $kv = {
        get(key, defaultValue) {
            return defaultValue;
        }
    };
    let didRun = false;
    const $room = {
        setPanelTemplate(panelTemplate) {
            didRun = true;
            return true;
        }
    };
    broadcastPanelUpdate($kv, $room);
    t.false(didRun);
});
