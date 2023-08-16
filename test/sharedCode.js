"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainCommandSystem = void 0;
const _callback_1 = require("./api/$callback");
const _kv_1 = require("./api/$kv");
const _limitcam_1 = require("./api/$limitcam");
const _room_1 = require("./api/$room");
const CommandSystem_1 = require("./CommandSystem");
function arrayRegex(arr) {
    return new RegExp(`^(${arr.join('|')})$`);
}
// Callback Handlers
const callbackCancelHandler = (args) => {
    _callback_1.$callback.cancel(args.label);
    return { success: true, message: `Callback ${args.label} is canceled` };
};
const callbackCreateHandler = (args, opts) => {
    _callback_1.$callback.create(args.label, opts.delay, opts.repeating);
    const delayMsg = opts.delay ? ` with a delay of ${opts.delay}ms` : '';
    const repeatingMsg = opts.repeating ? ', set to repeat' : '';
    return { success: true, message: `Callback ${args.label} is created${delayMsg}${repeatingMsg}.` };
};
// Callback Commands
const callbackCancelCommand = new CommandSystem_1.Command("cancel", "Cancels a callback", ['o', 'm'], callbackCancelHandler, [new CommandSystem_1.Parameter("label")]);
const callbackCreateCommand = new CommandSystem_1.Command("create", "Creates a callback", ['o', 'm'], callbackCreateHandler, [new CommandSystem_1.Parameter("label")], [
    new CommandSystem_1.Parameter("delay", 1, /\d+/),
    new CommandSystem_1.Parameter("repeating", false)
]);
// Callback System
const callbackSystem = new CommandSystem_1.CommandSystem('callback');
callbackSystem.register(callbackCancelCommand, callbackCreateCommand);
// KV Handlers
const kvClearHandler = () => {
    const success = _kv_1.$kv.clear();
    return { success, message: success ? `Key-Value storage cleared.` : `Failed to clear Key-Value storage.` };
};
const kvDecrHandler = (args, opts) => {
    const success = _kv_1.$kv.decr(args.key, Number(opts.amount));
    return { success, message: success ? `Decremented value of key ${args.key} by ${opts.amount || 1}.` : `Failed to decrement value of key ${args.key}.` };
};
const kvGetHandler = (args, opts) => {
    const value = _kv_1.$kv.get(args.key, opts.defaultValue);
    return { success: true, message: `Retrieved value for key ${args.key}: ${value}`, data: value };
};
const kvIncrHandler = (args, opts) => {
    const success = _kv_1.$kv.incr(args.key, Number(opts.amount));
    return { success, message: success ? `Incremented value of key ${args.key} by ${opts.amount || 1}.` : `Failed to increment value of key ${args.key}.` };
};
const kvListHandler = (args, opts) => {
    const list = {};
    const iter = _kv_1.$kv.iter(opts.prefix);
    while (iter.next()) {
        list[iter.key()] = iter.value();
    }
    const stringified = JSON.stringify(list);
    return { success: true, message: `Listing keys with prefix ${opts.prefix || ''}: ${stringified}`, data: list };
};
const kvRemoveHandler = (args) => {
    _kv_1.$kv.remove(args.key);
    return { success: true, message: `Removed key ${args.key} from storage.` };
};
const kvSetHandler = (args) => {
    const success = _kv_1.$kv.set(args.key, args.value);
    return { success, message: success ? `Set value for key ${args.key} to ${args.value}.` : `Failed to set value for key ${args.key}.` };
};
// KV Commands
const kvClearCommand = new CommandSystem_1.Command("clear", "Clears the Key-Value storage", ['o', 'm'], kvClearHandler);
const kvDecrCommand = new CommandSystem_1.Command("decr", "Decrements the value of a key", ['o', 'm'], kvDecrHandler, [new CommandSystem_1.Parameter("key")], [new CommandSystem_1.Parameter("amount", 1, /\d+/)]);
const kvGetCommand = new CommandSystem_1.Command("get", "Gets the value of a key", ['o', 'm'], kvGetHandler, [new CommandSystem_1.Parameter("key")], [new CommandSystem_1.Parameter("defaultValue")]);
const kvIncrCommand = new CommandSystem_1.Command("incr", "Increments the value of a key", ['o', 'm'], kvIncrHandler, [new CommandSystem_1.Parameter("key")], [new CommandSystem_1.Parameter("amount", 1, /\d+/)]);
const kvListCommand = new CommandSystem_1.Command("list", "Lists all keys with an optional prefix", ['o', 'm'], kvListHandler, [], [new CommandSystem_1.Parameter("prefix")]);
const kvRemoveCommand = new CommandSystem_1.Command("remove", "Removes a key from storage", ['o', 'm'], kvRemoveHandler, [new CommandSystem_1.Parameter("key")]);
const kvSetCommand = new CommandSystem_1.Command("set", "Sets the value of a key", ['o', 'm'], kvSetHandler, [new CommandSystem_1.Parameter("key"), new CommandSystem_1.Parameter("value")]);
// KV System
const kvSystem = new CommandSystem_1.CommandSystem('kv');
kvSystem.register(kvClearCommand, kvDecrCommand, kvGetCommand, kvIncrCommand, kvListCommand, kvRemoveCommand, kvSetCommand);
// Handlers for LimitCam system:
const limitcamStatusHandler = () => {
    return { success: true, message: `LimitCam is ${_limitcam_1.$limitcam.active ? 'active' : 'inactive'}.` };
};
const limitcamListHandler = () => {
    return { success: true, message: `LimitCam access list: ${_limitcam_1.$limitcam.users.join(', ')}.` };
};
const limitcamAddHandler = (args) => {
    if (typeof args.users === 'string') {
        args.users = args.users.split(',').map((u) => u.trim());
    }
    _limitcam_1.$limitcam.add(args.users);
    return { success: true, message: `Added users to LimitCam access list.` };
};
const limitcamHasAccessHandler = (args) => {
    const hasAccess = _limitcam_1.$limitcam.hasAccess(args.username);
    return { success: true, message: `User ${args.username} has ${hasAccess ? '' : 'no'} access to LimitCam.`, data: hasAccess };
};
const limitcamRemoveHandler = (args) => {
    if (typeof args.users === 'string') {
        args.users = args.users.split(',').map((u) => u.trim());
    }
    _limitcam_1.$limitcam.remove(args.users);
    return { success: true, message: `Removed users from LimitCam access list.` };
};
const limitcamRemoveAllHandler = () => {
    _limitcam_1.$limitcam.removeAll();
    return { success: true, message: `Removed all users from LimitCam access list.` };
};
const limitcamStartHandler = (args) => {
    if (typeof args.users === 'string') {
        args.users = args.users.split(',').map((u) => u.trim());
    }
    _limitcam_1.$limitcam.start(args.message, args.users);
    return { success: true, message: `LimitCam started with message: ${args.message}.` };
};
const limitcamStopHandler = () => {
    _limitcam_1.$limitcam.stop();
    return { success: true, message: `LimitCam stopped.` };
};
// Commands for LimitCam system:
const limitcamStatusCommand = new CommandSystem_1.Command("status", "Checks if LimitCam is active", ['o', 'm'], limitcamStatusHandler);
const limitcamListCommand = new CommandSystem_1.Command("list", "Lists all users with access to LimitCam", ['o', 'm'], limitcamListHandler);
const limitcamAddCommand = new CommandSystem_1.Command("add", "Adds users to the LimitCam access list", ['o', 'm'], limitcamAddHandler, [new CommandSystem_1.Parameter("users", undefined, /.+/, true)]);
const limitcamHasAccessCommand = new CommandSystem_1.Command("hasAccess", "Checks if a user has access to LimitCam", ['o', 'm'], limitcamHasAccessHandler, [new CommandSystem_1.Parameter("username")]);
const limitcamRemoveCommand = new CommandSystem_1.Command("remove", "Removes users from the LimitCam access list", ['o', 'm'], limitcamRemoveHandler, [new CommandSystem_1.Parameter("users", undefined, /.+/, true)]);
const limitcamRemoveAllCommand = new CommandSystem_1.Command("removeAll", "Removes all users from the LimitCam access list", ['o', 'm'], limitcamRemoveAllHandler);
const limitcamStartCommand = new CommandSystem_1.Command("start", "Starts LimitCam with a specified message", ['o', 'm'], limitcamStartHandler, [new CommandSystem_1.Parameter("message"), new CommandSystem_1.Parameter("users", undefined, /.*?/, true)]);
const limitcamStopCommand = new CommandSystem_1.Command("stop", "Stops the LimitCam", ['o', 'm'], limitcamStopHandler);
// LimitCam System:
const limitcamSystem = new CommandSystem_1.CommandSystem('limitcam');
limitcamSystem.register(limitcamStatusCommand, limitcamListCommand, limitcamAddCommand, limitcamHasAccessCommand, limitcamRemoveCommand, limitcamRemoveAllCommand, limitcamStartCommand, limitcamStopCommand);
// Handlers for Message system:
const messageBgColorHandler = (args) => {
    _kv_1.$kv.set('$message.bgColor', args.color);
    return { success: true, message: `Background color set to: ${args.color}.` };
};
const messageBodyHandler = (args) => {
    _kv_1.$kv.set('$message.body', args.body);
    return { success: true, message: `Message body set.` };
};
const messageColorHandler = (args) => {
    _kv_1.$kv.set('$message.color', args.color);
    return { success: true, message: `Text color set to: ${args.color}.` };
};
const messageFontHandler = (args) => {
    _kv_1.$kv.set('$message.font', args.font);
    return { success: true, message: `Font set to: ${args.font}.` };
};
const messageIsSpamHandler = (args) => {
    _kv_1.$kv.set('$message.isSpam', args.isSpam);
    return { success: true, message: args.isSpam ? `Message marked as spam.` : `Message unmarked as spam.` };
};
// Commands for Message system:
const messageBgColorCommand = new CommandSystem_1.Command("bgColor", "Sets the background color of the message", ['o', 'm'], messageBgColorHandler, [new CommandSystem_1.Parameter("color", '#000000')]);
const messageBodyCommand = new CommandSystem_1.Command("body", "Sets the body of the message", ['o', 'm'], messageBodyHandler, [new CommandSystem_1.Parameter("body")]);
const messageColorCommand = new CommandSystem_1.Command("color", "Sets the text color of the message", ['o', 'm'], messageColorHandler, [new CommandSystem_1.Parameter("color")]);
const messageFontCommand = new CommandSystem_1.Command("font", "Sets the font of the message", ['o', 'm'], messageFontHandler, [new CommandSystem_1.Parameter("font", false, arrayRegex(["Default", "Arial", "Bookman Old Style", "Comic Sans", "Courier", "Lucida", "Palantino", "Tahoma", "Times New Roman"]))]);
const messageIsSpamCommand = new CommandSystem_1.Command("isSpam", "Marks or unmarks the message as spam", ['o', 'm'], messageIsSpamHandler, [new CommandSystem_1.Parameter("isSpam", false, arrayRegex(["true", "false"]))]);
// Message System:
const messageSystem = new CommandSystem_1.CommandSystem('message');
messageSystem.register(messageBgColorCommand, messageBodyCommand, messageColorCommand, messageFontCommand, messageIsSpamCommand);
// Handlers for Room system:
const roomReloadPanelHandler = () => {
    _room_1.$room.reloadPanel();
    return { success: true, message: `Room panel reloaded.` };
};
const roomSendNoticeHandler = (args, opts) => {
    _room_1.$room.sendNotice(args.message, opts.options);
    return { success: true, message: `Notice sent: ${args.message}.` };
};
const roomPanelTemplateHandler = (args) => {
    _kv_1.$kv.set('$room.panelTemplate', args.options);
    return { success: true, message: `Room panel template set. Call reloadPanel to apply.` };
};
const roomSubjectHandler = (args) => {
    _room_1.$room.setSubject(args.subject);
    return { success: true, message: `Room subject set to: ${args.subject}.` };
};
const roomTipOptionsHandler = (args) => {
    _kv_1.$kv.set('$room.tipOptions', args.options);
    return { success: true, message: `Room tip options set.` };
};
// Commands for Room system:
const roomReloadPanelCommand = new CommandSystem_1.Command("reloadPanel", "Reloads the room panel", ['o', 'm'], roomReloadPanelHandler);
const roomSendNoticeCommand = new CommandSystem_1.Command("sendNotice", "Sends a notice with optional parameters", ['o', 'm'], roomSendNoticeHandler, [new CommandSystem_1.Parameter("message"), new CommandSystem_1.Parameter("options", false)]);
const roomPanelTemplateCommand = new CommandSystem_1.Command("panelTemplate", "Sets the panel template with the given options", ['o', 'm'], roomPanelTemplateHandler, [new CommandSystem_1.Parameter("options")]);
const roomSubjectCommand = new CommandSystem_1.Command("subject", "Sets the room subject", ['o', 'm'], roomSubjectHandler, [new CommandSystem_1.Parameter("subject")]);
const roomTipOptionsCommand = new CommandSystem_1.Command("tipOptions", "Sets the room tip options", ['o', 'm'], roomTipOptionsHandler, [new CommandSystem_1.Parameter("options")]);
// Room System:
const roomSystem = new CommandSystem_1.CommandSystem('room');
roomSystem.register(roomReloadPanelCommand, roomSendNoticeCommand, roomPanelTemplateCommand, roomSubjectCommand, roomTipOptionsCommand);
// Define the main command system.
const mainCommandSystem = new CommandSystem_1.CommandSystem("/api");
exports.mainCommandSystem = mainCommandSystem;
// Register all subsystems to the main command system.
mainCommandSystem.register(callbackSystem, kvSystem, limitcamSystem, roomSystem, messageSystem);
