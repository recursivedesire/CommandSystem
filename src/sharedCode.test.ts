import test, {ExecutionContext} from 'ava';
import proxyquire from 'proxyquire';
import {User} from "./api/$user";
import {CommandSystem} from "./CommandSystem";
import {Callback} from "./api/$callback";
import {KV, KvIterator} from "./api/$kv";
import {Limitcam} from "./api/$limitcam";
import {Room, RoomTipOptions} from "./api/$room";
import {Message} from "./api/$message";

function user(username: string, colorGroup: string): User {
    return {username, colorGroup} as User;
}

function callback(
    t: ExecutionContext,
    cancel?: (label: string) => void,
    create?: (label: string, delay?: number, repeating?: boolean) => void
): Callback {
    cancel = cancel ?? ((label: string) => t.fail("Should not be called"));
    create = create ?? ((label: string, delay: number = 1, repeating: boolean = false) => t.fail("Should not be called"));
    return {cancel, create} as Callback;
}

function kv(
    t: ExecutionContext,
    clear?: () => boolean,
    decr?: (key: string, amount?: number) => boolean,
    get?: (key: string, defaultValue?: string) => any,
    incr?: (key: string, amount?: number) => boolean,
    iter?: (prefix?: string) => KvIterator,
    remove?: (key: string) => void,
    set?: (key: string, value: any) => boolean
): KV {
    clear = clear ?? (() => t.fail("Should not be called"));
    decr = decr ?? ((key: string, amount: number = 1) => t.fail("Should not be called"));
    get = get ?? ((key: string, defaultValue: string = '') => t.fail("Should not be called"));
    incr = incr ?? ((key: string, amount: number = 1) => t.fail("Should not be called"));
    iter = iter ?? ((prefix: string = '') => {
        t.fail("Should not be called");
        return null;
    });
    remove = remove ?? ((key: string) => t.fail("Should not be called"));
    set = set ?? ((key: string, value: any) => t.fail("Should not be called"));

    return {clear, decr, get, incr, iter, remove, set} as KV;
}

function limitcam(
    t: ExecutionContext,
    active: boolean = false,
    users: string[] = [],
    add?: (users: string[]) => void,
    hasAccess?: (username: string) => boolean,
    remove?: (users: string[]) => void,
    removeAll?: () => void,
    start?: (message: string, users?: string[]) => void,
    stop?: () => void
): Limitcam {
    add = add ?? ((users: string[]) => t.fail("Should not be called"));
    hasAccess = hasAccess ?? ((username: string) => t.fail("Should not be called"));
    remove = remove ?? ((users: string[]) => t.fail("Should not be called"));
    removeAll = removeAll ?? (() => t.fail("Should not be called"));
    start = start ?? ((message: string, users: string[] = []) => t.fail("Should not be called"));
    stop = stop ?? (() => t.fail("Should not be called"));

    return {active, users, add, hasAccess, remove, removeAll, start, stop} as Limitcam;
}

function room(
    t: ExecutionContext,
    reloadPanel?: () => void,
    sendNotice?: (message: string, options?: any) => void,
    setPanelTemplate?: (options: object) => void,
    setSubject?: (subject: string) => void,
    setTipOptions?: (options: RoomTipOptions) => void
): Room {
    reloadPanel = reloadPanel ?? (() => t.fail("Should not be called"));
    sendNotice = sendNotice ?? ((message: string, options?: any) => t.fail("Should not be called"));
    setPanelTemplate = setPanelTemplate ?? ((options: Object) => t.fail("Should not be called"));
    setSubject = setSubject ?? ((subject: string) => t.fail("Should not be called"));
    setTipOptions = setTipOptions ?? ((options: RoomTipOptions) => t.fail("Should not be called"));

    return {
        reloadPanel,
        sendNotice,
        setPanelTemplate,
        setSubject,
        setTipOptions
    } as Room;
}

function commandSystem(t: ExecutionContext, $callback?: Callback, $kv?: KV, $limitcam?: Limitcam, $room?: Room): CommandSystem {
    const $user = user('user', 'm')
    $callback = $callback ?? callback(t);
    $kv = $kv ?? kv(t);
    $limitcam = $limitcam ?? limitcam(t);
    $room = $room ?? room(t);

    const {CommandSystem} = proxyquire('./CommandSystem', {
        './api/$user': {$user}
    });
    const {mainCommandSystem} = proxyquire('./sharedCode', {
        './CommandSystem': {CommandSystem},
        './api/$callback': {$callback},
        './api/$kv': {$kv},
        './api/$limitcam': {$limitcam},
        './api/$room': {$room}
    });
    return mainCommandSystem;
}

test('/api callback cancel', t => {
    const $callback = callback(
        t,
        (label) => t.is(label, 'label')
    );

    const mainCommandSystem = commandSystem(t, $callback);
    mainCommandSystem.execute('/api callback cancel label');
});

test('/api callback create', t => {
    let $callback = callback(
        t, undefined,
        (label, delay, repeating) => {
            t.is(label, 'label');
            t.is(delay, 1);
            t.is(repeating, false);
        }
    );

    let mainCommandSystem = commandSystem(t, $callback);
    mainCommandSystem.execute('/api callback create label');

    $callback = callback(
        t, undefined,
        (label, delay, repeating) => {
            t.is(label, 'label');
            t.is(delay, 2);
            t.is(repeating, true);
        }
    );

    mainCommandSystem = commandSystem(t, $callback);
    mainCommandSystem.execute('/api create label --delay 2 --repeating true');
});

test('/api kv clear', t => {
    const $kv = kv(
        t,
        () => t.pass()
    );

    const mainCommandSystem = commandSystem(t, undefined, $kv);
    mainCommandSystem.execute('/api kv clear');
});

test('/api kv decr', t => {
    let $kv = kv(
        t,
        undefined,
        (key, amount) => {
            t.is(key, 'key');
            t.is(amount, 1);
            return true;
        }
    );

    let mainCommandSystem = commandSystem(t, undefined, $kv);
    mainCommandSystem.execute('/api kv decr key');

    $kv = kv(
        t,
        undefined,
        (key, amount) => {
            t.is(key, 'key');
            t.is(amount, 2);
            return true;
        }
    );

    mainCommandSystem = commandSystem(t, undefined, $kv);
    mainCommandSystem.execute('/api kv decr key --amount 2');
});

test('/api kv get', t => {
    let $kv = kv(
        t, undefined, undefined,
        (key, defaultValue) => {
            t.is(key, 'key');
            t.is(defaultValue, undefined);
            return defaultValue;
        }
    );

    let mainCommandSystem = commandSystem(t, undefined, $kv);
    mainCommandSystem.execute('/api kv get key');

    $kv = kv(
        t, undefined, undefined,
        (key, defaultValue) => {
            t.is(key, 'key');
            t.is(defaultValue, 'defaultValue');
            return defaultValue;
        }
    );

    mainCommandSystem = commandSystem(t, undefined, $kv);
    mainCommandSystem.execute('/api kv get key --defaultValue defaultValue');
});

test('/api kv incr', t => {
    let $kv = kv(
        t,
        undefined, undefined, undefined,
        (key, amount) => {
            t.is(key, 'key');
            t.is(amount, 1);
            return true;
        }
    );

    let mainCommandSystem = commandSystem(t, undefined, $kv);
    mainCommandSystem.execute('/api kv incr key');

    $kv = kv(
        t,
        undefined, undefined, undefined,
        (key, amount) => {
            t.is(key, 'key');
            t.is(amount, 2);
            return true;
        }
    );

    mainCommandSystem = commandSystem(t, undefined, $kv);
    mainCommandSystem.execute('/api kv incr key --amount 2');
});

test('/api kv list', t => {
    let $kv = kv(
        t, undefined, undefined, undefined, undefined,
        (prefix?: string) => {
            t.is(prefix, undefined);
            return {
                next: () => {
                    t.pass();
                    return null;
                }
            } as KvIterator;
        }
    );

    let mainCommandSystem = commandSystem(t, undefined, $kv);
    mainCommandSystem.execute('/api kv list');

    $kv = kv(
        t, undefined, undefined, undefined, undefined,
        (prefix?: string) => {
            t.is(prefix, 'prefix');
            return {
                next: () => {
                    t.pass();
                    return null;
                }
            } as KvIterator;
        }
    );

    mainCommandSystem = commandSystem(t, undefined, $kv);
    mainCommandSystem.execute('/api kv list --prefix prefix');
});

test('/api kv remove', t => {
    const $kv = kv(
        t, undefined, undefined, undefined, undefined, undefined,
        (key) => {
            t.is(key, 'key');
        }
    );

    const mainCommandSystem = commandSystem(t, undefined, $kv);
    mainCommandSystem.execute('/api kv remove key');
});

test('/api kv set', t => {
    const $kv = kv(
        t, undefined, undefined, undefined, undefined, undefined, undefined,
        (key, value) => {
            t.is(key, 'key');
            t.is(value, 'value');
            return true;
        }
    );

    const mainCommandSystem = commandSystem(t, undefined, $kv);
    mainCommandSystem.execute('/api kv set key value');
});

test('/api limitcam status', t => {
    const $limitcam = limitcam(t);

    const mainCommandSystem = commandSystem(t, undefined, undefined, $limitcam);
    mainCommandSystem.execute('/api limitcam status');
    t.pass();
});

test('/api limitcam list', t => {
    const $limitcam = limitcam(t);

    const mainCommandSystem = commandSystem(t, undefined, undefined, $limitcam);
    mainCommandSystem.execute('/api limitcam list');
    t.pass();
});

test('/api limitcam add', t => {
    let $limitcam = limitcam(
        t, undefined, undefined,
        (users: string[]) => {
            t.is(users.length, 1);
            t.is(users[0], 'user');
        }
    );

    let mainCommandSystem = commandSystem(t, undefined, undefined, $limitcam);
    mainCommandSystem.execute('/api limitcam add user');

    $limitcam = limitcam(
        t, undefined, undefined,
        (users: string[]) => {
            t.is(users.length, 2);
            t.is(users[0], 'user1');
            t.is(users[1], 'user2');
        }
    );

    mainCommandSystem = commandSystem(t, undefined, undefined, $limitcam);
    mainCommandSystem.execute('/api limitcam add user1,user2');
});

test('/api limitcam hasAccess', t => {
    const $limitcam = limitcam(
        t, undefined, undefined, undefined,
        (username: string) => {
            t.is(username, 'user');
            return true;
        }
    );

    const mainCommandSystem = commandSystem(t, undefined, undefined, $limitcam);
    mainCommandSystem.execute('/api limitcam hasAccess user');
});

test('/api limitcam remove', t => {
    let $limitcam = limitcam(
        t, undefined, undefined, undefined, undefined,
        (users: string[]) => {
            t.is(users.length, 1);
            t.is(users[0], 'user');
        }
    );

    let mainCommandSystem = commandSystem(t, undefined, undefined, $limitcam);
    mainCommandSystem.execute('/api limitcam remove user');

    $limitcam = limitcam(
        t, undefined, undefined, undefined, undefined,
        (users: string[]) => {
            t.is(users.length, 2);
            t.is(users[0], 'user1');
            t.is(users[1], 'user2');
        }
    );

    mainCommandSystem = commandSystem(t, undefined, undefined, $limitcam);
    mainCommandSystem.execute('/api limitcam remove user1,user2');
});

test('/api limitcam removeAll', t => {
    const $limitcam = limitcam(
        t, undefined, undefined, undefined, undefined, undefined,
        () => t.pass()
    );

    const mainCommandSystem = commandSystem(t, undefined, undefined, $limitcam);
    mainCommandSystem.execute('/api limitcam removeAll');
});

test('/api limitcam start', t => {
    let $limitcam = limitcam(
        t, undefined, undefined, undefined, undefined, undefined, undefined,
        (message: string, users: string[]) => {
            t.is(message, 'message');
            t.is(users.length, 1);
            t.is(users[0], 'user');
        }
    );

    let mainCommandSystem = commandSystem(t, undefined, undefined, $limitcam);
    mainCommandSystem.execute('/api limitcam start message user');

    $limitcam = limitcam(
        t, undefined, undefined, undefined, undefined, undefined, undefined,
        (message: string, users: string[]) => {
            t.is(message, 'message');
            t.is(users.length, 2);
            t.is(users[0], 'user1');
            t.is(users[1], 'user2');
        }
    );

    mainCommandSystem = commandSystem(t, undefined, undefined, $limitcam);
    mainCommandSystem.execute('/api limitcam start message user1,user2');
});

test('/api limitcam stop', t => {
    const $limitcam = limitcam(
        t, undefined, undefined, undefined, undefined, undefined, undefined, undefined,
        () => t.pass()
    );

    const mainCommandSystem = commandSystem(t, undefined, undefined, $limitcam);
    mainCommandSystem.execute('/api limitcam stop');
});

test('/api message bgColor', t => {
    const $kv = kv(
        t, undefined, undefined, undefined, undefined, undefined, undefined,
        (key, value) => {
            t.is(key, '$message.bgColor');
            t.is(value, 'value');
            return true;
        });

    const mainCommandSystem = commandSystem(t, undefined, $kv);
    mainCommandSystem.execute('/api message bgColor value');
});

test('/api message body', t => {
    const $kv = kv(
        t, undefined, undefined, undefined, undefined, undefined, undefined,
        (key, value) => {
            t.is(key, '$message.body');
            t.is(value, 'value');
            return true;
        });

    const mainCommandSystem = commandSystem(t, undefined, $kv);
    mainCommandSystem.execute('/api message body value');
});

test('/api message color', t => {
    const $kv = kv(
        t, undefined, undefined, undefined, undefined, undefined, undefined,
        (key, value) => {
            t.is(key, '$message.color');
            t.is(value, 'value');
            return true;
        });

    const mainCommandSystem = commandSystem(t, undefined, $kv);
    mainCommandSystem.execute('/api message color value');
});

test('/api message font', t => {
    const $kv = kv(
        t, undefined, undefined, undefined, undefined, undefined, undefined,
        (key, value) => {
            t.is(key, '$message.font');
            t.is(value, 'Default');
            return true;
        });

    const mainCommandSystem = commandSystem(t, undefined, $kv);
    mainCommandSystem.execute('/api message font Default');
});

test('/api message isSpam', t => {
    const $kv = kv(
        t, undefined, undefined, undefined, undefined, undefined, undefined,
        (key, value) => {
            t.is(key, '$message.isSpam');
            t.is(value, 'true');
            return true;
        });

    const mainCommandSystem = commandSystem(t, undefined, $kv);
    mainCommandSystem.execute('/api message isSpam true');
});

test('/api room reloadPanel', t => {
    const $room = room(
        t,
        () => t.pass()
    );

    const mainCommandSystem = commandSystem(t, undefined, undefined, undefined, $room);
    mainCommandSystem.execute('/api room reloadPanel');
});

test('/api room sendNotice', t => {
    let $room = room(
        t, undefined,
        (message: string, options?: any) => {
            t.is(message, 'message');
            t.is(options, undefined);
        }
    );

    let mainCommandSystem = commandSystem(t, undefined, undefined, undefined, $room);
    mainCommandSystem.execute('/api room sendNotice message');

    $room = room(
        t, undefined,
        (message: string, options?: any) => {
            t.is(message, 'message');
            t.is(options, 'options');
        }
    );

    mainCommandSystem = commandSystem(t, undefined, undefined, undefined, $room);
    mainCommandSystem.execute('/api room sendNotice message --options options');
});

test('/api room panelTemplate', t => {
    const $kv = kv(
        t, undefined, undefined, undefined, undefined, undefined, undefined,
        (key, value) => {
            t.is(key, '$room.panelTemplate');
            t.is(value, 'value');
            return true;
        }
    );

    const mainCommandSystem = commandSystem(t, undefined, $kv);
    mainCommandSystem.execute('/api room panelTemplate value');
});

test('/api room subject', t => {
    const $room = room(
        t, undefined, undefined, undefined,
        (subject: string) => {
            t.is(subject, 'subject');
        }
    );

    const mainCommandSystem = commandSystem(t, undefined, undefined, undefined, $room);
    mainCommandSystem.execute('/api room subject subject');
});

test('/api room tipOptions', t => {
    const $kv = kv(
        t, undefined, undefined, undefined, undefined, undefined, undefined,
        (key, value) => {
            t.is(key, '$room.tipOptions');
            t.is(value, 'value');
            return true;
        }
    );

    const mainCommandSystem = commandSystem(t, undefined, $kv);
    mainCommandSystem.execute('/api room tipOptions value');
});
