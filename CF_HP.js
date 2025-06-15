/*:
 * @plugindesc 状态窗口插件 – 在地图上显示HP与MP条
 * @author CFpanda
 *
 * @help
 * 本插件在地图画面上显示主角的 HP 和 MP 条，方便查看状态。
 * 
 * 可搭配公共事件使用，在左下角显示角色头像。
 * 只需通过公共事件显示图片（图片建议为头像图），位置设在左下角。
 * 
 * This plugin displays the main actor’s HP and MP gauges directly on the map.
 * 
 * Can be combined with common events to show a character portrait.
 * Just use a common event to display a picture in the bottom-left corner.
 * 
 * ✦ 适用于动作战斗或需要实时监控状态的玩法。
 * ✦ Useful for ABS or real-time exploration UI.
 * 
 * 无需插件指令。No plugin commands required.
 * 适用于 RPG Maker MV。For RPG Maker MV.
 */


var plugins = $plugins.filter(function(plugin) {
  return plugin.status;
});

var LOG_STATUS_WINDOW = false;

if (plugins && plugins['CF_HP']) {
  LOG_STATUS_WINDOW = plugins['CF_HP'].parameters['LOG_STATUS_WINDOW'] === 'true';
}

(function() {
  var _Scene_Map_prototype_createAllWindows = Scene_Map.prototype.createAllWindows;
  Scene_Map.prototype.createAllWindows = function() {
    _Scene_Map_prototype_createAllWindows.call(this);
    this.createHpWindow();
    this.createMpWindow();
  };

  Scene_Map.prototype.createHpWindow = function() {
  var window = new Window_Base(120, 660, 240, 70);
  window.windowskin = new Bitmap(1, 1); // Create a new Bitmap object
  window.opacity = 0; // Make window background transparent
  this._hpWindow = window;
  this.addChild(window);
};

Scene_Map.prototype.createMpWindow = function() {
  var window = new Window_Base(130,710, 240, 70);
  window.windowskin = new Bitmap(1, 1); // Create a new Bitmap object
  window.opacity = 0; // Make window background transparent
  this._mpWindow = window;
  this.addChild(window);
};

  Scene_Map.prototype.updateHpWindow = function() {
    var window = this._hpWindow;
    var actor = $gameParty.leader();
    if (actor && actor.isActor()) { 
      var hp = actor.hp;
      var maxHp = actor.mhp;
      if (typeof hp === 'number' && typeof maxHp === 'number') {
        window.contents.clear();
        window.drawGauge(0, -2, 180, hp / maxHp, '#FF0000', '#FFFFFF');
        window.contents.fontSize = 28;
        window.drawText('生命', 0, -6);
        window.contents.fontSize = 28;
        window.drawText('' + hp + '/' + maxHp, 60, -5);
      } else {
        console.error('Invalid data:', hp, maxHp);
      }
    }
  };

  Scene_Map.prototype.updateMpWindow = function() {
    var window = this._mpWindow;
    var actor = $gameParty.leader();
    if (actor && actor.isActor()) { 
      var mp = actor.mp;
      var maxMp = actor.mmp;
      if (typeof mp === 'number' && typeof maxMp === 'number') {
        window.contents.clear();
        window.drawGauge(0, -2, 180, mp / maxMp, '#0000FF', '#FFFFFF');
        window.contents.fontSize = 28;
        window.drawText('精力', 0, -6);
        window.contents.fontSize = 28;
        window.drawText('' + mp + '/' + maxMp, 60, -5);
      } else {
        console.error('Invalid data:', mp, maxMp);
      }
    }
  };

  var alias_Scene_Map_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function() {
    alias_Scene_Map_update.call(this);
    this.updateHpWindow();
    this.updateMpWindow();
  };
})();