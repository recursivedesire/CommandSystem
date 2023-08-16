"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatMessageTransform = void 0;
const _kv_1 = require("./api/$kv");
const _message_1 = require("./api/$message");
require("./sharedCode");
// The logic of this file need to be wrapped in a function in order to be testable.
function chatMessageTransform($message, $kv) {
    $message.setBgColor($kv.get("$message.bgColor", $message.bgColor));
    $message.setBody($kv.get("$message.body", $message.body));
    $message.setColor($kv.get("$message.color", $message.color));
    $message.setFont($kv.get("$message.font", $message.font));
    $message.setSpam($kv.get("$message.isSpam", "false") === "true");
}
exports.chatMessageTransform = chatMessageTransform;
chatMessageTransform(_message_1.$message, _kv_1.$kv);
