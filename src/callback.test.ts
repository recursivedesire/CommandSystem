import test from 'ava';
import proxyquire from 'proxyquire';
import {Room} from './api/$room';
import {Callback} from "./api/$callback";

const {callback} = proxyquire('./callback', {
    './api/$room': {$room: {sendNotice: (message: string, options?: object) => {}}},
    './api/$callback': {$callback: {label: ''}},
});

test('Outputs correct message as room notice', t => {
    const $room: Room = {
        sendNotice(message: string, options?: object) {
            t.is(message, "Callback 'mocked' triggered!");
        }
    } as Room;

    const $callback = {
        label: 'mocked'
    } as Callback;

    callback($room, $callback);
});
