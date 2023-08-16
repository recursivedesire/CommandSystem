import test from 'ava';
import proxyquire from 'proxyquire';
import {Room, RoomTipOptions} from './api/$room';
import {KV} from "./api/$kv";

const {tipDialogOpen} = proxyquire('./tipDialogOpen', {
    './api/$room': {$room: {setTipOptions(options: object) {}}},
    './api/$kv': {$kv: {get: (key: string, defaultValue?: string): any => defaultValue}}
});

test('KV-value unset', t => {
    const $room: Room = {
        setTipOptions(options: RoomTipOptions) {
            t.deepEqual(options, {});
        }
    } as Room;

    const $kv: KV = {
        get: (key: string, defaultValue?: string): any => defaultValue
    } as KV;

    tipDialogOpen($room, $kv);
});

test('Valid json is set as KV-value', t => {
    const $room: Room = {
        setTipOptions(options: RoomTipOptions) {
            t.deepEqual(options, {label: "mocked", options:[{label: "mocked"}]});
        }
    } as Room;

    const $kv: KV = {
        get(key: string, defaultValue?: string): any {
            return '{"label": "mocked", "options":[{"label": "mocked"}]}';
        }
    } as KV;

    tipDialogOpen($room, $kv);
});
