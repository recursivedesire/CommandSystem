import test from 'ava';
import proxyquire from 'proxyquire';
import {Room} from './api/$room';
import {CommandSystem, Command} from "./CommandSystem";
import {Message} from "./api/$message";
import {User} from "./api/$user";


function user(username: string, colorGroup: string): User {
    return {username, colorGroup} as User;
}

function commandSystem($user: User): CommandSystem {
    const {CommandSystem} = proxyquire('./CommandSystem', {
        './api/$user': {$user}
    });

    const commandSystem = new CommandSystem('/main');
    commandSystem.register(new Command('successful', 'Demo command.', ['o'],() => ({success: true, message: 'Demo command result.'})));
    commandSystem.register(new Command('fail', 'Demo command.', ['o'],() => ({success: false, message: 'Demo command result.'})));
    return commandSystem;
}

function message(body: string, setSpam: (isSpam: boolean) => void = (isSpam: boolean) => {}): Message {
    return {body, setSpam} as Message;
}

function room(test: (message: string, toUsername: string) => void): Room {
    return {
        owner: 'mocked',
        sendNotice(message: string, options?: object) {
            test(message, options['toUsername']);
        }
    } as Room;
}

function chatMessage(mainCommandSystem: CommandSystem, $message: Message, $room: Room, $user: User) {
    const {chatMessage} = proxyquire('./chatMessage', {
        './sharedCode': {mainCommandSystem},
        './api/$message': {$message},
        './api/$room': {$room},
        './api/$user': {$user}
    });
    return chatMessage;
}

test('Normal message gets ignored.', t => {
    const $user = user('mocked', 'o');
    const $message = message('Hello world!', (isSpam: boolean) => {
       t.false(isSpam);
    });
    const $room = room((message, toUsername) => {
        t.fail('Should not send a notice.');
    });
    const mainCommandSystem = commandSystem($user);
    chatMessage(mainCommandSystem, $message, $room, $user);
    t.pass();
});

test('Missing permissions gets reported.', t => {
    const $user = user('user', 'm');
    const $message = message('/main successful', (isSpam: boolean) => {
        t.true(isSpam);
    });
    const $room = room((message, toUsername) => {
        if (toUsername === 'user') {
            t.is(message, 'You do not have permission to execute the "successful" command.');
        } else {
            t.is(message, '"user" tried to run the command "/main successful".');
        }
    });
    const mainCommandSystem = commandSystem($user);
    chatMessage(mainCommandSystem, $message, $room, $user);
});
