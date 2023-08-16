import {$app} from "./api/$app";
import {$kv, KV} from "./api/$kv";
import {$limitcam} from "./api/$limitcam";
import {$room, Room} from "./api/$room";
import {$user} from "./api/$user";
import {$settings} from "./api/$settings";
import "./sharedCode";


// The logic of this file need to be wrapped in a function in order to be testable.
function broadcastPanelUpdate($kv: KV, $room: Room) {
  const panelTemplate = $kv.get("$room.panelTemplate", null);
  if (panelTemplate !== null) {
    $room.setPanelTemplate(JSON.parse(panelTemplate));
  }
}

broadcastPanelUpdate($kv, $room);


export {broadcastPanelUpdate};
