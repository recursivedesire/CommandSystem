import test from 'ava';
import proxyquire from 'proxyquire';
import {Message} from "./api/$message";
import {KV} from "./api/$kv";

const {chatMessageTransform} = proxyquire('./chatMessageTransform', {
    './api/$message': {$message: {
            bgColor: '#ffffff', body: 'Hello world!', color: '#000000', font: 'Default', isSpam: false,
            setBgColor(color: string) {
            }, setBody(body: string) {
            }, setColor(color: string) {
            },
            setFont(font: string) {
            }, setSpam(spam: boolean) {
            }
        }
    },
    './api/$kv': {$kv: {
            get: (key: string, defaultValue: string) => defaultValue
        }
    }
});

test('Apply default values if unset KV-values', t => {
    const $message = {
        bgColor: '#ffffff', body: 'Hello world!', color: '#000000', font: 'Default', isSpam: false,
        setBgColor(color: string) {
            this.bgColor = color
        },
        setBody(body: string) {
            this.body = body
        },
        setColor(color: string) {
            this.color = color
        },
        setFont(font: string) {
            this.font = font
        },
        setSpam(spam: boolean) {
            this.spam = spam
        }
    } as Message;

    const $kv = {
        get(key: string, defaultValue: string) {
            return defaultValue
        }
    } as KV;

    chatMessageTransform($message, $kv);
    t.is($message.bgColor, '#ffffff');
    t.is($message.body, 'Hello world!');
    t.is($message.color, '#000000');
    t.is($message.font, 'Default');
    t.is($message.isSpam, false);
});

test('Apply KV-values if set', t => {
    const $message = {
        bgColor: '#ffffff', body: 'Hello world!', color: '#000000', font: 'Default', isSpam: false,
        setBgColor(color: string) {
            this.bgColor = color;
        },
        setBody(body: string) {
            this.body = body;
        },
        setColor(color: string) {
            this.color = color;
        },
        setFont(font: string) {
            this.font = font;
        },
        setSpam(isSpam: boolean) {
            this.isSpam = isSpam;
        }
    } as Message;

    const storeKV = {
        "$message.bgColor": '#000000',
        "$message.body": 'KV Store',
        "$message.color": '#ffffff',
        "$message.font": 'Arial',
        "$message.isSpam": 'true'
    };
    const $kv = {
        get(key: string, defaultValue: string) {
            return storeKV[key];
        }
    } as KV;

    chatMessageTransform($message, $kv);
    t.is($message.bgColor, '#000000');
    t.is($message.body, 'KV Store');
    t.is($message.color, '#ffffff');
    t.is($message.font, 'Arial');
    t.is($message.isSpam, true);
});
