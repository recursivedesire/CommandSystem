import {$app} from "./api/$app";
import {$callback, Callback} from "./api/$callback";
import {$kv} from "./api/$kv";
import {$limitcam} from "./api/$limitcam";
import {$room, Room} from "./api/$room";
import {$settings} from "./api/$settings";
import "./sharedCode";


// The logic of this file need to be wrapped in a function in order to be testable.
function callback($room: Room, $callback: Callback) {
    $room.sendNotice(`Callback '${$callback.label}' triggered!`);
}

callback($room, $callback);


export {callback};
