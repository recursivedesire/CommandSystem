import {$app} from "./api/$app";
import {$kv, KV} from "./api/$kv";
import {$message, Message} from "./api/$message";
import {$user} from "./api/$user";
import {$settings} from "./api/$settings";
import "./sharedCode";


// The logic of this file need to be wrapped in a function in order to be testable.
function chatMessageTransform($message: Message, $kv: KV) {
    $message.setBgColor($kv.get("$message.bgColor", $message.bgColor));
    $message.setBody($kv.get("$message.body", $message.body));
    $message.setColor($kv.get("$message.color", $message.color));
    $message.setFont($kv.get("$message.font", $message.font));
    $message.setSpam($kv.get("$message.isSpam", "false") === "true");
}

chatMessageTransform($message, $kv);


export {chatMessageTransform};
