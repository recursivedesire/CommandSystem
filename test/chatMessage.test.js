"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const proxyquire_1 = __importDefault(require("proxyquire"));
const CommandSystem_1 = require("./CommandSystem");
function user(username, colorGroup) {
    return { username, colorGroup };
}
function commandSystem($user) {
    const { CommandSystem } = (0, proxyquire_1.default)('./CommandSystem', {
        './api/$user': { $user }
    });
    const commandSystem = new CommandSystem('/main');
    commandSystem.register(new CommandSystem_1.Command('successful', 'Demo command.', ['o'], () => ({ success: true, message: 'Demo command result.' })));
    commandSystem.register(new CommandSystem_1.Command('fail', 'Demo command.', ['o'], () => ({ success: false, message: 'Demo command result.' })));
    return commandSystem;
}
function message(body, setSpam = (isSpam) => { }) {
    return { body, setSpam };
}
function room(test) {
    return {
        owner: 'mocked',
        sendNotice(message, options) {
            test(message, options['toUsername']);
        }
    };
}
function chatMessage(mainCommandSystem, $message, $room, $user) {
    const { chatMessage } = (0, proxyquire_1.default)('./chatMessage', {
        './sharedCode': { mainCommandSystem },
        './api/$message': { $message },
        './api/$room': { $room },
        './api/$user': { $user }
    });
    return chatMessage;
}
(0, ava_1.default)('Normal message gets ignored.', t => {
    const $user = user('mocked', 'o');
    const $message = message('Hello world!', (isSpam) => {
        t.false(isSpam);
    });
    const $room = room((message, toUsername) => {
        t.fail('Should not send a notice.');
    });
    const mainCommandSystem = commandSystem($user);
    chatMessage(mainCommandSystem, $message, $room, $user);
    t.pass();
});
(0, ava_1.default)('Missing permissions gets reported.', t => {
    const $user = user('user', 'm');
    const $message = message('/main successful', (isSpam) => {
        t.true(isSpam);
    });
    const $room = room((message, toUsername) => {
        if (toUsername === 'user') {
            t.is(message, 'You do not have permission to execute the "successful" command.');
        }
        else {
            t.is(message, '"user" tried to run the command "/main successful".');
        }
    });
    const mainCommandSystem = commandSystem($user);
    chatMessage(mainCommandSystem, $message, $room, $user);
});
