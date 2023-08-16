"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const proxyquire_1 = __importDefault(require("proxyquire"));
const { tipDialogOpen } = (0, proxyquire_1.default)('./tipDialogOpen', {
    './api/$room': { $room: { setTipOptions(options) { } } },
    './api/$kv': { $kv: { get: (key, defaultValue) => defaultValue } }
});
(0, ava_1.default)('KV-value unset', t => {
    const $room = {
        setTipOptions(options) {
            t.deepEqual(options, {});
        }
    };
    const $kv = {
        get: (key, defaultValue) => defaultValue
    };
    tipDialogOpen($room, $kv);
});
(0, ava_1.default)('Valid json is set as KV-value', t => {
    const $room = {
        setTipOptions(options) {
            t.deepEqual(options, { label: "mocked", options: [{ label: "mocked" }] });
        }
    };
    const $kv = {
        get(key, defaultValue) {
            return '{"label": "mocked", "options":[{"label": "mocked"}]}';
        }
    };
    tipDialogOpen($room, $kv);
});
