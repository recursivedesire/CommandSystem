"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const proxyquire_1 = __importDefault(require("proxyquire"));
const { callback } = (0, proxyquire_1.default)('./callback', {
    './api/$room': { $room: { sendNotice: (message, options) => { } } },
    './api/$callback': { $callback: { label: '' } },
});
(0, ava_1.default)('Outputs correct message as room notice', t => {
    const $room = {
        sendNotice(message, options) {
            t.is(message, "Callback 'mocked' triggered!");
        }
    };
    const $callback = {
        label: 'mocked'
    };
    callback($room, $callback);
});
