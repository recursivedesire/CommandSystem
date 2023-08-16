import {$app} from "./api/$app";
import {$callback} from "./api/$callback";
import {$kv, KV} from "./api/$kv";
import {$limitcam} from "./api/$limitcam";
import {$room, Room} from "./api/$room";
import {$user} from "./api/$user";
import {$settings} from "./api/$settings";
import "./sharedCode";


// The logic of this file need to be wrapped in a function in order to be testable.
function tipDialogOpen($room: Room, $kv: KV) {
    $room.setTipOptions(JSON.parse($kv.get("$room.tipOptions", "{}")));
}

tipDialogOpen($room, $kv);


export {tipDialogOpen};
