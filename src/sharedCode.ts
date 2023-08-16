import {$app} from "./api/$app";
import {$callback} from "./api/$callback";
import {$fanclub} from "./api/$fanclub";
import {$kv} from "./api/$kv";
import {$limitcam} from "./api/$limitcam";
import {$media} from "./api/$media";
import {$message} from "./api/$message";
import {$room} from "./api/$room";
import {$tip} from "./api/$tip";
import {$user} from "./api/$user";
import {$settings} from "./api/$settings";
import {Command, CommandSystem, Parameter, TCommandHandler} from "./CommandSystem";


function arrayRegex(arr: string[]): RegExp {
    return new RegExp(`^(${arr.join('|')})$`);
}

// Callback Handlers

const callbackCancelHandler: TCommandHandler = (args) => {
    $callback.cancel(args.label);
    return { success: true, message: `Callback ${args.label} is canceled` };
};

const callbackCreateHandler: TCommandHandler = (args, opts) => {
    $callback.create(args.label, opts.delay, opts.repeating);
    const delayMsg = opts.delay ? ` with a delay of ${opts.delay}ms` : '';
    const repeatingMsg = opts.repeating ? ', set to repeat' : '';
    return { success: true, message: `Callback ${args.label} is created${delayMsg}${repeatingMsg}.` };
};

// Callback Commands

const callbackCancelCommand = new Command("cancel", "Cancels a callback", ['o', 'm'], callbackCancelHandler, [new Parameter("label")]);

const callbackCreateCommand = new Command(
    "create",
    "Creates a callback",
    ['o', 'm'],
    callbackCreateHandler,
    [new Parameter("label")],
    [
        new Parameter("delay", 1, /\d+/),
        new Parameter("repeating", false)
    ]
);


// Callback System

const callbackSystem = new CommandSystem('callback');
callbackSystem.register(callbackCancelCommand, callbackCreateCommand);

// KV Handlers

const kvClearHandler: TCommandHandler = () => {
    const success = $kv.clear();
    return { success, message: success ? `Key-Value storage cleared.` : `Failed to clear Key-Value storage.` };
};

const kvDecrHandler: TCommandHandler = (args, opts) => {
    const success = $kv.decr(args.key, Number(opts.amount));
    return { success, message: success ? `Decremented value of key ${args.key} by ${opts.amount || 1}.` : `Failed to decrement value of key ${args.key}.` };
};

const kvGetHandler: TCommandHandler = (args, opts) => {
    const value = $kv.get(args.key, opts.defaultValue);
    return { success: true, message: `Retrieved value for key ${args.key}: ${value}`, data: value };
};

const kvIncrHandler: TCommandHandler = (args, opts) => {
    const success = $kv.incr(args.key, Number(opts.amount));
    return { success, message: success ? `Incremented value of key ${args.key} by ${opts.amount || 1}.` : `Failed to increment value of key ${args.key}.` };
};

const kvListHandler: TCommandHandler = (args, opts) => {
    const list: Record<string, any> = {};

    const iter = $kv.iter(opts.prefix);
    while (iter.next()) {
        list[iter.key()] = iter.value();
    }
    const stringified = JSON.stringify(list);

    return { success: true, message: `Listing keys with prefix ${opts.prefix || ''}: ${stringified}`, data: list };
};

const kvRemoveHandler: TCommandHandler = (args) => {
    $kv.remove(args.key);
    return { success: true, message: `Removed key ${args.key} from storage.` };
};

const kvSetHandler: TCommandHandler = (args) => {
    const success = $kv.set(args.key, args.value);
    return { success, message: success ? `Set value for key ${args.key} to ${args.value}.` : `Failed to set value for key ${args.key}.` };
};

// KV Commands

const kvClearCommand = new Command("clear", "Clears the Key-Value storage", ['o', 'm'], kvClearHandler);

const kvDecrCommand = new Command(
    "decr",
    "Decrements the value of a key",
    ['o', 'm'],
    kvDecrHandler,
    [new Parameter("key")],
    [new Parameter("amount", 1, /\d+/)]
);

const kvGetCommand = new Command(
    "get",
    "Gets the value of a key",
    ['o', 'm'],
    kvGetHandler,
    [new Parameter("key")],
    [new Parameter("defaultValue")]
);

const kvIncrCommand = new Command(
    "incr",
    "Increments the value of a key",
    ['o', 'm'],
    kvIncrHandler,
    [new Parameter("key")],
    [new Parameter("amount", 1, /\d+/)]
);

const kvListCommand = new Command(
    "list",
    "Lists all keys with an optional prefix",
    ['o', 'm'],
    kvListHandler,
    [],
    [new Parameter("prefix")]
);

const kvRemoveCommand = new Command(
    "remove",
    "Removes a key from storage",
    ['o', 'm'],
    kvRemoveHandler,
    [new Parameter("key")]
);

const kvSetCommand = new Command(
    "set",
    "Sets the value of a key",
    ['o', 'm'],
    kvSetHandler,
    [new Parameter("key"), new Parameter("value")]
);

// KV System

const kvSystem = new CommandSystem('kv');
kvSystem.register(kvClearCommand, kvDecrCommand, kvGetCommand, kvIncrCommand, kvListCommand, kvRemoveCommand, kvSetCommand);

// Handlers for LimitCam system:
const limitcamStatusHandler: TCommandHandler = () => {
    return { success: true, message: `LimitCam is ${$limitcam.active ? 'active' : 'inactive'}.` };
};

const limitcamListHandler: TCommandHandler = () => {
    return { success: true, message: `LimitCam access list: ${$limitcam.users.join(', ')}.` };
};

const limitcamAddHandler: TCommandHandler = (args) => {
    if (typeof args.users === 'string') {
        args.users = args.users.split(',').map((u: string) => u.trim());
    }
    $limitcam.add(args.users);
    return { success: true, message: `Added users to LimitCam access list.` };
};

const limitcamHasAccessHandler: TCommandHandler = (args) => {
    const hasAccess = $limitcam.hasAccess(args.username);
    return { success: true, message: `User ${args.username} has ${hasAccess ? '' : 'no'} access to LimitCam.`, data: hasAccess };
};

const limitcamRemoveHandler: TCommandHandler = (args) => {
    if (typeof args.users === 'string') {
        args.users = args.users.split(',').map((u: string) => u.trim());
    }
    $limitcam.remove(args.users);
    return { success: true, message: `Removed users from LimitCam access list.` };
};

const limitcamRemoveAllHandler: TCommandHandler = () => {
    $limitcam.removeAll();
    return { success: true, message: `Removed all users from LimitCam access list.` };
};

const limitcamStartHandler: TCommandHandler = (args) => {
    if (typeof args.users === 'string') {
        args.users = args.users.split(',').map((u: string) => u.trim());
    }
    $limitcam.start(args.message, args.users);
    return { success: true, message: `LimitCam started with message: ${args.message}.` };
};

const limitcamStopHandler: TCommandHandler = () => {
    $limitcam.stop();
    return { success: true, message: `LimitCam stopped.` };
};

// Commands for LimitCam system:

const limitcamStatusCommand = new Command(
    "status",
    "Checks if LimitCam is active",
    ['o', 'm'],
    limitcamStatusHandler
);

const limitcamListCommand = new Command(
    "list",
    "Lists all users with access to LimitCam",
    ['o', 'm'],
    limitcamListHandler
);

const limitcamAddCommand = new Command(
    "add",
    "Adds users to the LimitCam access list",
    ['o', 'm'],
    limitcamAddHandler,
    [new Parameter("users", undefined, /.+/, true)]
);

const limitcamHasAccessCommand = new Command(
    "hasAccess",
    "Checks if a user has access to LimitCam",
    ['o', 'm'],
    limitcamHasAccessHandler,
    [new Parameter("username")]
);

const limitcamRemoveCommand = new Command(
    "remove",
    "Removes users from the LimitCam access list",
    ['o', 'm'],
    limitcamRemoveHandler,
    [new Parameter("users", undefined, /.+/, true)]
);

const limitcamRemoveAllCommand = new Command(
    "removeAll",
    "Removes all users from the LimitCam access list",
    ['o', 'm'],
    limitcamRemoveAllHandler
);

const limitcamStartCommand = new Command(
    "start",
    "Starts LimitCam with a specified message",
    ['o', 'm'],
    limitcamStartHandler,
    [new Parameter("message"), new Parameter("users", undefined, /.*?/, true)]
);

const limitcamStopCommand = new Command(
    "stop",
    "Stops the LimitCam",
    ['o', 'm'],
    limitcamStopHandler
);

// LimitCam System:

const limitcamSystem = new CommandSystem('limitcam');
limitcamSystem.register(
    limitcamStatusCommand,
    limitcamListCommand,
    limitcamAddCommand,
    limitcamHasAccessCommand,
    limitcamRemoveCommand,
    limitcamRemoveAllCommand,
    limitcamStartCommand,
    limitcamStopCommand
);

// Handlers for Message system:

const messageBgColorHandler: TCommandHandler = (args) => {
    $kv.set('$message.bgColor', args.color);
    return { success: true, message: `Background color set to: ${args.color}.` };
};

const messageBodyHandler: TCommandHandler = (args) => {
    $kv.set('$message.body', args.body);
    return { success: true, message: `Message body set.` };
};

const messageColorHandler: TCommandHandler = (args) => {
    $kv.set('$message.color', args.color);
    return { success: true, message: `Text color set to: ${args.color}.` };
};

const messageFontHandler: TCommandHandler = (args) => {
    $kv.set('$message.font', args.font);
    return { success: true, message: `Font set to: ${args.font}.` };
};

const messageIsSpamHandler: TCommandHandler = (args) => {
    $kv.set('$message.isSpam', args.isSpam);
    return { success: true, message: args.isSpam ? `Message marked as spam.` : `Message unmarked as spam.` };
};

// Commands for Message system:

const messageBgColorCommand = new Command(
    "bgColor",
    "Sets the background color of the message",
    ['o', 'm'],
    messageBgColorHandler,
    [new Parameter("color", '#000000')]
);

const messageBodyCommand = new Command(
    "body",
    "Sets the body of the message",
    ['o', 'm'],
    messageBodyHandler,
    [new Parameter("body")]
);

const messageColorCommand = new Command(
    "color",
    "Sets the text color of the message",
    ['o', 'm'],
    messageColorHandler,
    [new Parameter("color")]
);

const messageFontCommand = new Command(
    "font",
    "Sets the font of the message",
    ['o', 'm'],
    messageFontHandler,
    [new Parameter("font", false, arrayRegex(["Default","Arial","Bookman Old Style","Comic Sans","Courier","Lucida","Palantino","Tahoma","Times New Roman"]))]
);

const messageIsSpamCommand = new Command(
    "isSpam",
    "Marks or unmarks the message as spam",
    ['o', 'm'],
    messageIsSpamHandler,
    [new Parameter("isSpam", false, arrayRegex(["true","false"]))]
);

// Message System:

const messageSystem = new CommandSystem('message');
messageSystem.register(
    messageBgColorCommand,
    messageBodyCommand,
    messageColorCommand,
    messageFontCommand,
    messageIsSpamCommand
);

// Handlers for Room system:

const roomReloadPanelHandler: TCommandHandler = () => {
    $room.reloadPanel();
    return { success: true, message: `Room panel reloaded.` };
};

const roomSendNoticeHandler: TCommandHandler = (args, opts) => {
    $room.sendNotice(args.message, opts.options);
    return { success: true, message: `Notice sent: ${args.message}.` };
};

const roomPanelTemplateHandler: TCommandHandler = (args) => {
    $kv.set('$room.panelTemplate', args.options);
    return { success: true, message: `Room panel template set. Call reloadPanel to apply.` };
};

const roomSubjectHandler: TCommandHandler = (args) => {
    $room.setSubject(args.subject);
    return { success: true, message: `Room subject set to: ${args.subject}.` };
};

const roomTipOptionsHandler: TCommandHandler = (args) => {
    $kv.set('$room.tipOptions', args.options);
    return { success: true, message: `Room tip options set.` };
};

// Commands for Room system:

const roomReloadPanelCommand = new Command(
    "reloadPanel",
    "Reloads the room panel",
    ['o', 'm'],
    roomReloadPanelHandler
);

const roomSendNoticeCommand = new Command(
    "sendNotice",
    "Sends a notice with optional parameters",
    ['o', 'm'],
    roomSendNoticeHandler,
    [new Parameter("message"), new Parameter("options")]
);

const roomPanelTemplateCommand = new Command(
    "panelTemplate",
    "Sets the panel template with the given options",
    ['o', 'm'],
    roomPanelTemplateHandler,
    [new Parameter("options")]
);

const roomSubjectCommand = new Command(
    "subject",
    "Sets the room subject",
    ['o', 'm'],
    roomSubjectHandler,
    [new Parameter("subject")]
);

const roomTipOptionsCommand = new Command(
    "tipOptions",
    "Sets the room tip options",
    ['o', 'm'],
    roomTipOptionsHandler,
    [new Parameter("options")]
);

// Room System:

const roomSystem = new CommandSystem('room');
roomSystem.register(
    roomReloadPanelCommand,
    roomSendNoticeCommand,
    roomPanelTemplateCommand,
    roomSubjectCommand,
    roomTipOptionsCommand
);

// Define the main command system.
const mainCommandSystem = new CommandSystem("/api");

// Register all subsystems to the main command system.
mainCommandSystem.register(callbackSystem, kvSystem, limitcamSystem, roomSystem, messageSystem);


export {mainCommandSystem};
