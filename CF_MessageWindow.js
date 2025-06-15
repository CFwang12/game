/*:
 * @target MV
 * @plugindesc 可调控对话窗口大小和位置 / Adjustable message window size and position
 * @author CFpanda
 *
 * @help 可调控对话窗口大小和位置 / Adjustable message window size and position
 *
 * @param x
 * @text X坐标
 * @desc 对话窗口X坐标
 * @type number
 * @default 280
 *
 * @param y
 * @text Y坐标
 * @desc 对话窗口Y坐标
 * @type number
 * @default 490
 *
 * @param width
 * @text 宽度
 * @desc 对话窗口宽度
 * @type number
 * @default 720
 *
 * @param height
 * @text 高度
 * @desc 对话窗口高度
 * @type number
 * @default 180
 *
 */

(function() {
    var parameters = PluginManager.parameters('AdjustMessageWindowSizeAndPosition');
    var x = Number(parameters['x'] || 280);
    var y = Number(parameters['y'] || 490);
    var width = Number(parameters['width'] || 720);
    var height = Number(parameters['height'] || 180);

    Window_Message.prototype.windowWidth = function() {
        return width;
    };

    Window_Message.prototype.windowHeight = function() {
        return height;
    };

    Window_Message.prototype.updatePlacement = function() {
        this.x = x;
        this.y = y;
    };
})();