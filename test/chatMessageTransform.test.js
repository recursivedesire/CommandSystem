"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const proxyquire_1 = __importDefault(require("proxyquire"));
const { chatMessageTransform } = (0, proxyquire_1.default)('./chatMessageTransform', {
    './api/$message': { $message: {
            bgColor: '#ffffff', body: 'Hello world!', color: '#000000', font: 'Default', isSpam: false,
            setBgColor(color) {
            }, setBody(body) {
            }, setColor(color) {
            },
            setFont(font) {
            }, setSpam(spam) {
            }
        }
    },
    './api/$kv': { $kv: {
            get: (key, defaultValue) => defaultValue
        }
    }
});
(0, ava_1.default)('Apply default values if unset KV-values', t => {
    const $message = {
        bgColor: '#ffffff', body: 'Hello world!', color: '#000000', font: 'Default', isSpam: false,
        setBgColor(color) {
            this.bgColor = color;
        },
        setBody(body) {
            this.body = body;
        },
        setColor(color) {
            this.color = color;
        },
        setFont(font) {
            this.font = font;
        },
        setSpam(spam) {
            this.spam = spam;
        }
    };
    const $kv = {
        get(key, defaultValue) {
            return defaultValue;
        }
    };
    chatMessageTransform($message, $kv);
    t.is($message.bgColor, '#ffffff');
    t.is($message.body, 'Hello world!');
    t.is($message.color, '#000000');
    t.is($message.font, 'Default');
    t.is($message.isSpam, false);
});
(0, ava_1.default)('Apply KV-values if set', t => {
    const $message = {
        bgColor: '#ffffff', body: 'Hello world!', color: '#000000', font: 'Default', isSpam: false,
        setBgColor(color) {
            this.bgColor = color;
        },
        setBody(body) {
            this.body = body;
        },
        setColor(color) {
            this.color = color;
        },
        setFont(font) {
            this.font = font;
        },
        setSpam(isSpam) {
            this.isSpam = isSpam;
        }
    };
    const storeKV = {
        "$message.bgColor": '#000000',
        "$message.body": 'KV Store',
        "$message.color": '#ffffff',
        "$message.font": 'Arial',
        "$message.isSpam": 'true'
    };
    const $kv = {
        get(key, defaultValue) {
            return storeKV[key];
        }
    };
    chatMessageTransform($message, $kv);
    t.is($message.bgColor, '#000000');
    t.is($message.body, 'KV Store');
    t.is($message.color, '#ffffff');
    t.is($message.font, 'Arial');
    t.is($message.isSpam, true);
});
