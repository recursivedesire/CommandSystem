import test from 'ava';
import proxyquire from 'proxyquire';
import {KV} from './api/$kv';
import {Room} from './api/$room';

const {broadcastPanelUpdate} = proxyquire('./broadcastPanelUpdate', {
    './api/$kv': {$kv: {get: (key:string) => {return null}}},
    './api/$room': {$room: {setPanelTemplate: (panelTemplate: object) => {return false}}}
});

test('Executes setPanelTemplate if KV-value set', t => {
    const $kv: KV = {
        get(key: string, defaultValue?: string): any {
            return "{}";
        }
    } as KV;

    let didRun = false;
    const $room: Room = {
        setPanelTemplate(panelTemplate: any): boolean {
            didRun = true;
            return true;
        }
    } as Room;

    broadcastPanelUpdate($kv, $room);
    t.true(didRun);
});

test('Skips setPanelTemplate if KV-value unset', t => {
    const $kv: KV = {
        get(key: string, defaultValue?: string): any {
            return defaultValue;
        }
    } as KV;

    let didRun = false;
    const $room: Room = {
        setPanelTemplate(panelTemplate: any): boolean {
            didRun = true;
            return true;
        }
    } as Room;

    broadcastPanelUpdate($kv, $room);
    t.false(didRun);
});
