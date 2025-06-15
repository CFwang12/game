/*:
 * @plugindesc Save event positions – Only affects marked events, does not interfere with other event behavior.
 * @author CFpanda
 *
 * @help
 * This plugin prevents specified events from resetting to their original positions 
 * after switching scenes (e.g., leaving and returning to the map).
 * 
 * Events must be marked with the <SaveEvent> note tag to enable this behavior.
 *
 * Usage:
 * - Add <SaveEvent> to the note field of any event that should retain its position.
 *
 * Plugin Command:
 * - ResetEventLocations: Resets all saved events back to their original positions.
 *
 * Notes:
 * - Only events with <SaveEvent> will be affected.
 * - Other events function normally.
 */


(function() {
  'use strict';

  const eventData = {};

  /**
   * 判断事件是否需要保存
   * @param {Game_Event} event
   * @returns {boolean}
   */
  function isEventSaveable(event) {
    return event.event().note && event.event().note.includes("<SaveEvent>");
  }

  /**
   * 保存指定事件的位置、方向和动画状态
   */
  function saveEventPositions() {
    const mapId = $gameMap.mapId();
    if (!eventData[mapId]) eventData[mapId] = {};

    $gameMap.events().forEach(event => {
      if (isEventSaveable(event)) {
        const eventId = event.eventId();
        eventData[mapId][eventId] = {
          x: event.x,
          y: event.y,
          dir: event.direction(),
          anim: event._pattern // 保存动画状态
        };
      }
    });
  }

  /**
   * 恢复指定事件的位置、方向和动画状态
   */
  function restoreEventPositions() {
    const mapId = $gameMap.mapId();
    if (!eventData[mapId]) return;

    $gameMap.events().forEach(event => {
      const eventId = event.eventId();
      if (isEventSaveable(event) && eventData[mapId][eventId]) {
        const data = eventData[mapId][eventId];
        event.setPosition(data.x, data.y);
        event.setDirection(data.dir);
        event._pattern = data.anim; // 恢复动画状态
        event.refresh(); // 刷新事件
      }
    });
  }

  /**
   * 在场景切换时保存需要保存的事件状态
   */
  const _Scene_Map_terminate = Scene_Map.prototype.terminate;
  Scene_Map.prototype.terminate = function() {
    saveEventPositions(); // 保存事件位置
    _Scene_Map_terminate.call(this);
  };

  /**
   * 在场景加载时恢复需要保存的事件状态
   */
  const _Scene_Map_start = Scene_Map.prototype.start;
  Scene_Map.prototype.start = function() {
    _Scene_Map_start.call(this);
    restoreEventPositions(); // 恢复事件位置
  };

  /**
   * 插件命令
   */
  const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);

    if (command === "ResetEventLocations") {
      const mapId = $gameMap.mapId();
      $gameMap.events().forEach(event => {
        if (isEventSaveable(event)) {
          const original = event.event();
          event.setPosition(original.x, original.y);
          event.setDirection(original.direction);
          event.refresh(); // 刷新事件状态
        }
      });
      delete eventData[mapId]; // 清空保存的数据
    }
  };
})();
