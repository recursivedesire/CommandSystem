"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatMessage = void 0;
const _message_1 = require("./api/$message");
const _room_1 = require("./api/$room");
const _user_1 = require("./api/$user");
const sharedCode_1 = require("./sharedCode");
// import "./sharedCode";
// The logic of this file need to be wrapped in a function in order to be testable.
function chatMessage(mainCommandSystem, $message, $room, $user) {
    const parsedCommand = mainCommandSystem.parse($message.body);
    if (parsedCommand.valid) {
        // Hide the command from the chat.
        $message.setSpam(true);
        const commandResult = mainCommandSystem.execute(parsedCommand);
        if (commandResult.success) {
            $room.sendNotice(commandResult.message, { toUsername: $user.username });
            // Inform the room owner of the command.
            if ($room.owner !== $user.username) {
                $room.sendNotice(`${$user.username} ran the command "${$message.body}".`, { toUsername: $room.owner });
                $room.sendNotice(commandResult.message, { toUsername: $room.owner });
            }
        }
        else {
            $room.sendNotice(commandResult.message, { toUsername: $user.username });
            // Inform the room owner of the attempted command.
            if ($room.owner !== $user.username) {
                $room.sendNotice(`${$user.username} ran the command "${$message.body}" but it failed.`, { toUsername: $room.owner });
                $room.sendNotice(commandResult.message, { toUsername: $room.owner });
            }
        }
    }
    else {
        // Not all messages are commands, so we don't want to send an error message for every message that isn't a command.
        if ('error' in parsedCommand && parsedCommand.error !== 'Invalid command prefix') {
            $message.setSpam(true);
            $room.sendNotice(parsedCommand.error, { toUsername: $user.username });
            // Inform the room owner of the attempted command.
            if ($room.owner !== $user.username) {
                $room.sendNotice(`"${$user.username}" tried to run the command "${$message.body}".`, { toUsername: $room.owner });
            }
        }
    }
}
exports.chatMessage = chatMessage;
chatMessage(sharedCode_1.mainCommandSystem, _message_1.$message, _room_1.$room, _user_1.$user);
