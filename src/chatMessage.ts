import {$app} from "./api/$app";
import {$callback} from "./api/$callback";
import {$kv} from "./api/$kv";
import {$limitcam} from "./api/$limitcam";
import {$message, Message} from "./api/$message";
import {$room, Room} from "./api/$room";
import {$user, User} from "./api/$user";
import {$settings} from "./api/$settings";
import {mainCommandSystem} from "./sharedCode";
import {CommandSystem} from "./CommandSystem";
// import "./sharedCode";


// The logic of this file need to be wrapped in a function in order to be testable.
function chatMessage(mainCommandSystem: CommandSystem, $message: Message, $room: Room, $user: User) {
    const parsedCommand = mainCommandSystem.parse($message.body);
    if (parsedCommand.valid) {
        // Hide the command from the chat.
        $message.setSpam(true);
        const commandResult = mainCommandSystem.execute(parsedCommand);
        if (commandResult.success) {
            $room.sendNotice(commandResult.message, {toUsername: $user.username});
            // Inform the room owner of the command.
            if ($room.owner !== $user.username) {
                $room.sendNotice(`${$user.username} ran the command "${$message.body}".`, {toUsername: $room.owner});
                $room.sendNotice(commandResult.message, {toUsername: $room.owner});
            }
        } else {
            $room.sendNotice(commandResult.message, {toUsername: $user.username});
            // Inform the room owner of the attempted command.
            if ($room.owner !== $user.username) {
                $room.sendNotice(`${$user.username} ran the command "${$message.body}" but it failed.`, {toUsername: $room.owner});
                $room.sendNotice(commandResult.message, {toUsername: $room.owner});
            }
        }
    } else {
        // Not all messages are commands, so we don't want to send an error message for every message that isn't a command.
        if ('error' in parsedCommand && parsedCommand.error !== 'Invalid command prefix') {
            $message.setSpam(true);
            $room.sendNotice(parsedCommand.error, {toUsername: $user.username});
            // Inform the room owner of the attempted command.
            if ($room.owner !== $user.username) {
                $room.sendNotice(`"${$user.username}" tried to run the command "${$message.body}".`, {toUsername: $room.owner});
            }
        }
    }
}

chatMessage(mainCommandSystem, $message, $room, $user);


export {chatMessage};
