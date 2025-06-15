/*:
 * @plugindesc Press the C key to alternately trigger two common events.
 * @author CFpanda
 * 
 * @help
 * This plugin allows the player to press the C key to alternately trigger two common events.
 * 
 * === Plugin Parameters ===
 * - Set the first common event ID in `Common Event ID 1`
 * - Set the second common event ID in `Common Event ID 2`
 * 
 * === Instructions ===
 * 1. Install this plugin in the Plugin Manager.
 * 2. Set the IDs of the two common events.
 * 3. Make sure the corresponding common events exist in the database.
 * 4. In-game, press the C key (Enter by default) to alternately trigger the two events.
 * 
 * === Notes ===
 * - If the IDs are not set or the events do not exist, nothing will be triggered.
 * - The C key corresponds to the Enter key on the keyboard, or the A button on gamepads.
 * 
 * @param commonEventId1
 * @text Common Event ID 1
 * @type common_event
 * @desc The ID of the first common event
 * @default 9
 * 
 * @param commonEventId2
 * @text Common Event ID 2
 * @type common_event
 * @desc The ID of the second common event
 * @default 10
 */


(function() {
    const parameters = PluginManager.parameters('按C键轮流触发两个公共事件');
    const COMMON_EVENT_ID_1 = Number(parameters['commonEventId1'] || 9);
    const COMMON_EVENT_ID_2 = Number(parameters['commonEventId2'] || 10);

    // 用于切换公共事件的标志
    let toggle = true;

    // 更新场景，监听按键
    const alias_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        alias_update.call(this);
        // 检测是否按下 C 键
        if (Input.isTriggered('c')) { // 默认 C 键绑定为 "c"
            // 根据标志触发公共事件
            if (toggle) {
                $gameTemp.reserveCommonEvent(COMMON_EVENT_ID_1);
            } else {
                $gameTemp.reserveCommonEvent(COMMON_EVENT_ID_2);
            }
            toggle = !toggle;
        }
    };
})();