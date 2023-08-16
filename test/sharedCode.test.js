"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const proxyquire_1 = __importDefault(require("proxyquire"));
function user(username, colorGroup) {
    return { username, colorGroup };
}
function callback(t, cancel, create) {
    cancel = cancel !== null && cancel !== void 0 ? cancel : ((label) => t.fail("Should not be called"));
    create = create !== null && create !== void 0 ? create : ((label, delay = 1, repeating = false) => t.fail("Should not be called"));
    return { cancel, create };
}
function kv(t, clear, decr, get, incr, iter, remove, set) {
    clear = clear !== null && clear !== void 0 ? clear : (() => t.fail("Should not be called"));
    decr = decr !== null && decr !== void 0 ? decr : ((key, amount = 1) => t.fail("Should not be called"));
    get = get !== null && get !== void 0 ? get : ((key, defaultValue = '') => t.fail("Should not be called"));
    incr = incr !== null && incr !== void 0 ? incr : ((key, amount = 1) => t.fail("Should not be called"));
    iter = iter !== null && iter !== void 0 ? iter : ((prefix = '') => {
        t.fail("Should not be called");
        return null;
    });
    remove = remove !== null && remove !== void 0 ? remove : ((key) => t.fail("Should not be called"));
    set = set !== null && set !== void 0 ? set : ((key, value) => t.fail("Should not be called"));
    return { clear, decr, get, incr, iter, remove, set };
}
function limitcam(t, active = false, users = [], add, hasAccess, remove, removeAll, start, stop) {
    add = add !== null && add !== void 0 ? add : ((users) => t.fail("Should not be called"));
    hasAccess = hasAccess !== null && hasAccess !== void 0 ? hasAccess : ((username) => t.fail("Should not be called"));
    remove = remove !== null && remove !== void 0 ? remove : ((users) => t.fail("Should not be called"));
    removeAll = removeAll !== null && removeAll !== void 0 ? removeAll : (() => t.fail("Should not be called"));
    start = start !== null && start !== void 0 ? start : ((message, users = []) => t.fail("Should not be called"));
    stop = stop !== null && stop !== void 0 ? stop : (() => t.fail("Should not be called"));
    return { active, users, add, hasAccess, remove, removeAll, start, stop };
}
function room(t, reloadPanel, sendNotice, setPanelTemplate, setSubject, setTipOptions) {
    reloadPanel = reloadPanel !== null && reloadPanel !== void 0 ? reloadPanel : (() => t.fail("Should not be called"));
    sendNotice = sendNotice !== null && sendNotice !== void 0 ? sendNotice : ((message, options) => t.fail("Should not be called"));
    setPanelTemplate = setPanelTemplate !== null && setPanelTemplate !== void 0 ? setPanelTemplate : ((options) => t.fail("Should not be called"));
    setSubject = setSubject !== null && setSubject !== void 0 ? setSubject : ((subject) => t.fail("Should not be called"));
    setTipOptions = setTipOptions !== null && setTipOptions !== void 0 ? setTipOptions : ((options) => t.fail("Should not be called"));
    return {
        reloadPanel,
        sendNotice,
        setPanelTemplate,
        setSubject,
        setTipOptions
    };
}
function commandSystem(t, $callback, $kv, $limitcam, $room) {
    const $user = user('user', 'm');
    $callback = $callback !== null && $callback !== void 0 ? $callback : callback(t);
    $kv = $kv !== null && $kv !== void 0 ? $kv : kv(t);
    $limitcam = $limitcam !== null && $limitcam !== void 0 ? $limitcam : limitcam(t);
    $room = $room !== null && $room !== void 0 ? $room : room(t);
    const { CommandSystem } = (0, proxyquire_1.default)('./CommandSystem', {
        './api/$user': { $user }
    });
    const { mainCommandSystem } = (0, proxyquire_1.default)('./sharedCode', {
        './CommandSystem': { CommandSystem },
        './api/$callback': { $callback },
        './api/$kv': { $kv },
        './api/$limitcam': { $limitcam },
        './api/$room': { $room }
    });
    return mainCommandSystem;
}
(0, ava_1.default)('/api callback cancel', t => {
    const $callback = callback(t, (label) => t.is(label, 'label'));
    const mainCommandSystem = commandSystem(t, $callback);
    mainCommandSystem.execute('/api callback cancel label');
});
(0, ava_1.default)('/api callback create', t => {
    let $callback = callback(t, undefined, (label, delay, repeating) => {
        t.is(label, 'label');
        t.is(delay, 1);
        t.is(repeating, false);
    });
    let mainCommandSystem = commandSystem(t, $callback);
    mainCommandSystem.execute('/api callback create label');
    $callback = callback(t, undefined, (label, delay, repeating) => {
        t.is(label, 'label');
        t.is(delay, 2);
        t.is(repeating, true);
    });
    mainCommandSystem = commandSystem(t, $callback);
    mainCommandSystem.execute('/api create label --delay 2 --repeating true');
});
(0, ava_1.default)('/api kv clear', t => {
    const $kv = kv(t, () => t.pass());
    const mainCommandSystem = commandSystem(t, undefined, $kv);
    mainCommandSystem.execute('/api kv clear');
});
(0, ava_1.default)('/api kv decr', t => {
    let $kv = kv(t, undefined, (key, amount) => {
        t.is(key, 'key');
        t.is(amount, 1);
        return true;
    });
    let mainCommandSystem = commandSystem(t, undefined, $kv);
    mainCommandSystem.execute('/api kv decr key');
    $kv = kv(t, undefined, (key, amount) => {
        t.is(key, 'key');
        t.is(amount, 2);
        return true;
    });
    mainCommandSystem = commandSystem(t, undefined, $kv);
    mainCommandSystem.execute('/api kv decr key --amount 2');
});
(0, ava_1.default)('/api kv get', t => {
    let $kv = kv(t, undefined, undefined, (key, defaultValue) => {
        t.is(key, 'key');
        t.is(defaultValue, undefined);
        return defaultValue;
    });
    let mainCommandSystem = commandSystem(t, undefined, $kv);
    mainCommandSystem.execute('/api kv get key');
    $kv = kv(t, undefined, undefined, (key, defaultValue) => {
        t.is(key, 'key');
        t.is(defaultValue, 'defaultValue');
        return defaultValue;
    });
    mainCommandSystem = commandSystem(t, undefined, $kv);
    mainCommandSystem.execute('/api kv get key --defaultValue defaultValue');
});
(0, ava_1.default)('/api kv incr', t => {
    let $kv = kv(t, undefined, undefined, undefined, (key, amount) => {
        t.is(key, 'key');
        t.is(amount, 1);
        return true;
    });
    let mainCommandSystem = commandSystem(t, undefined, $kv);
    mainCommandSystem.execute('/api kv incr key');
    $kv = kv(t, undefined, undefined, undefined, (key, amount) => {
        t.is(key, 'key');
        t.is(amount, 2);
        return true;
    });
    mainCommandSystem = commandSystem(t, undefined, $kv);
    mainCommandSystem.execute('/api kv incr key --amount 2');
});
(0, ava_1.default)('/api kv list', t => {
    let $kv = kv(t, undefined, undefined, undefined, undefined, (prefix) => {
        t.is(prefix, undefined);
        return {
            next: () => {
                t.pass();
                return null;
            }
        };
    });
    let mainCommandSystem = commandSystem(t, undefined, $kv);
    mainCommandSystem.execute('/api kv list');
    $kv = kv(t, undefined, undefined, undefined, undefined, (prefix) => {
        t.is(prefix, 'prefix');
        return {
            next: () => {
                t.pass();
                return null;
            }
        };
    });
    mainCommandSystem = commandSystem(t, undefined, $kv);
    mainCommandSystem.execute('/api kv list --prefix prefix');
});
(0, ava_1.default)('/api kv remove', t => {
    const $kv = kv(t, undefined, undefined, undefined, undefined, undefined, (key) => {
        t.is(key, 'key');
    });
    const mainCommandSystem = commandSystem(t, undefined, $kv);
    mainCommandSystem.execute('/api kv remove key');
});
(0, ava_1.default)('/api kv set', t => {
    const $kv = kv(t, undefined, undefined, undefined, undefined, undefined, undefined, (key, value) => {
        t.is(key, 'key');
        t.is(value, 'value');
        return true;
    });
    const mainCommandSystem = commandSystem(t, undefined, $kv);
    mainCommandSystem.execute('/api kv set key value');
});
(0, ava_1.default)('/api limitcam status', t => {
    const $limitcam = limitcam(t);
    const mainCommandSystem = commandSystem(t, undefined, undefined, $limitcam);
    mainCommandSystem.execute('/api limitcam status');
    t.pass();
});
(0, ava_1.default)('/api limitcam list', t => {
    const $limitcam = limitcam(t);
    const mainCommandSystem = commandSystem(t, undefined, undefined, $limitcam);
    mainCommandSystem.execute('/api limitcam list');
    t.pass();
});
(0, ava_1.default)('/api limitcam add', t => {
    let $limitcam = limitcam(t, undefined, undefined, (users) => {
        t.is(users.length, 1);
        t.is(users[0], 'user');
    });
    let mainCommandSystem = commandSystem(t, undefined, undefined, $limitcam);
    mainCommandSystem.execute('/api limitcam add user');
    $limitcam = limitcam(t, undefined, undefined, (users) => {
        t.is(users.length, 2);
        t.is(users[0], 'user1');
        t.is(users[1], 'user2');
    });
    mainCommandSystem = commandSystem(t, undefined, undefined, $limitcam);
    mainCommandSystem.execute('/api limitcam add user1,user2');
});
(0, ava_1.default)('/api limitcam hasAccess', t => {
    const $limitcam = limitcam(t, undefined, undefined, undefined, (username) => {
        t.is(username, 'user');
        return true;
    });
    const mainCommandSystem = commandSystem(t, undefined, undefined, $limitcam);
    mainCommandSystem.execute('/api limitcam hasAccess user');
});
(0, ava_1.default)('/api limitcam remove', t => {
    let $limitcam = limitcam(t, undefined, undefined, undefined, undefined, (users) => {
        t.is(users.length, 1);
        t.is(users[0], 'user');
    });
    let mainCommandSystem = commandSystem(t, undefined, undefined, $limitcam);
    mainCommandSystem.execute('/api limitcam remove user');
    $limitcam = limitcam(t, undefined, undefined, undefined, undefined, (users) => {
        t.is(users.length, 2);
        t.is(users[0], 'user1');
        t.is(users[1], 'user2');
    });
    mainCommandSystem = commandSystem(t, undefined, undefined, $limitcam);
    mainCommandSystem.execute('/api limitcam remove user1,user2');
});
(0, ava_1.default)('/api limitcam removeAll', t => {
    const $limitcam = limitcam(t, undefined, undefined, undefined, undefined, undefined, () => t.pass());
    const mainCommandSystem = commandSystem(t, undefined, undefined, $limitcam);
    mainCommandSystem.execute('/api limitcam removeAll');
});
(0, ava_1.default)('/api limitcam start', t => {
    let $limitcam = limitcam(t, undefined, undefined, undefined, undefined, undefined, undefined, (message, users) => {
        t.is(message, 'message');
        t.is(users.length, 1);
        t.is(users[0], 'user');
    });
    let mainCommandSystem = commandSystem(t, undefined, undefined, $limitcam);
    mainCommandSystem.execute('/api limitcam start message user');
    $limitcam = limitcam(t, undefined, undefined, undefined, undefined, undefined, undefined, (message, users) => {
        t.is(message, 'message');
        t.is(users.length, 2);
        t.is(users[0], 'user1');
        t.is(users[1], 'user2');
    });
    mainCommandSystem = commandSystem(t, undefined, undefined, $limitcam);
    mainCommandSystem.execute('/api limitcam start message user1,user2');
});
(0, ava_1.default)('/api limitcam stop', t => {
    const $limitcam = limitcam(t, undefined, undefined, undefined, undefined, undefined, undefined, undefined, () => t.pass());
    const mainCommandSystem = commandSystem(t, undefined, undefined, $limitcam);
    mainCommandSystem.execute('/api limitcam stop');
});
(0, ava_1.default)('/api message bgColor', t => {
    const $kv = kv(t, undefined, undefined, undefined, undefined, undefined, undefined, (key, value) => {
        t.is(key, '$message.bgColor');
        t.is(value, 'value');
        return true;
    });
    const mainCommandSystem = commandSystem(t, undefined, $kv);
    mainCommandSystem.execute('/api message bgColor value');
});
(0, ava_1.default)('/api message body', t => {
    const $kv = kv(t, undefined, undefined, undefined, undefined, undefined, undefined, (key, value) => {
        t.is(key, '$message.body');
        t.is(value, 'value');
        return true;
    });
    const mainCommandSystem = commandSystem(t, undefined, $kv);
    mainCommandSystem.execute('/api message body value');
});
(0, ava_1.default)('/api message color', t => {
    const $kv = kv(t, undefined, undefined, undefined, undefined, undefined, undefined, (key, value) => {
        t.is(key, '$message.color');
        t.is(value, 'value');
        return true;
    });
    const mainCommandSystem = commandSystem(t, undefined, $kv);
    mainCommandSystem.execute('/api message color value');
});
(0, ava_1.default)('/api message font', t => {
    const $kv = kv(t, undefined, undefined, undefined, undefined, undefined, undefined, (key, value) => {
        t.is(key, '$message.font');
        t.is(value, 'Default');
        return true;
    });
    const mainCommandSystem = commandSystem(t, undefined, $kv);
    mainCommandSystem.execute('/api message font Default');
});
(0, ava_1.default)('/api message isSpam', t => {
    const $kv = kv(t, undefined, undefined, undefined, undefined, undefined, undefined, (key, value) => {
        t.is(key, '$message.isSpam');
        t.is(value, 'true');
        return true;
    });
    const mainCommandSystem = commandSystem(t, undefined, $kv);
    mainCommandSystem.execute('/api message isSpam true');
});
(0, ava_1.default)('/api room reloadPanel', t => {
    const $room = room(t, () => t.pass());
    const mainCommandSystem = commandSystem(t, undefined, undefined, undefined, $room);
    mainCommandSystem.execute('/api room reloadPanel');
});
(0, ava_1.default)('/api room sendNotice', t => {
    let $room = room(t, undefined, (message, options) => {
        t.is(message, 'message');
        t.is(options, undefined);
    });
    let mainCommandSystem = commandSystem(t, undefined, undefined, undefined, $room);
    mainCommandSystem.execute('/api room sendNotice message');
    $room = room(t, undefined, (message, options) => {
        t.is(message, 'message');
        t.is(options, 'options');
    });
    mainCommandSystem = commandSystem(t, undefined, undefined, undefined, $room);
    mainCommandSystem.execute('/api room sendNotice message --options options');
});
(0, ava_1.default)('/api room panelTemplate', t => {
    const $kv = kv(t, undefined, undefined, undefined, undefined, undefined, undefined, (key, value) => {
        t.is(key, '$room.panelTemplate');
        t.is(value, 'value');
        return true;
    });
    const mainCommandSystem = commandSystem(t, undefined, $kv);
    mainCommandSystem.execute('/api room panelTemplate value');
});
(0, ava_1.default)('/api room subject', t => {
    const $room = room(t, undefined, undefined, undefined, (subject) => {
        t.is(subject, 'subject');
    });
    const mainCommandSystem = commandSystem(t, undefined, undefined, undefined, $room);
    mainCommandSystem.execute('/api room subject subject');
});
(0, ava_1.default)('/api room tipOptions', t => {
    const $kv = kv(t, undefined, undefined, undefined, undefined, undefined, undefined, (key, value) => {
        t.is(key, '$room.tipOptions');
        t.is(value, 'value');
        return true;
    });
    const mainCommandSystem = commandSystem(t, undefined, $kv);
    mainCommandSystem.execute('/api room tipOptions value');
});
