/*:
 * @target MV
 * @plugindesc [RMMV] 显示获得物品、武器、防具或金钱时的提示 / Show pop-up notifications when gaining items, weapons, armors, or gold.
 * @author CFpanda
 *
 * @help
 * ============================================================================
 * 📌 插件说明 (RPG Maker MV)
 * ============================================================================
 * 本插件用于 RPG Maker MV，当玩家获得物品、武器、防具或金钱时，
 * 在画面上显示提示信息，包括图标、名称与数量，增强玩家反馈体验。
 *
 * 功能包括：
 * - 获取道具时自动弹出提示
 * - 显示图标、物品名与数量
 * - 支持获取金币提示
 *
 * 使用方法：
 * 1. 将插件放入项目的 js/plugins 文件夹
 * 2. 打开插件管理器启用该插件
 * 3. （如有插件参数，可在此处列出说明）
 *
 * ============================================================================
 * 📌 Plugin Description (For RPG Maker MV)
 * ============================================================================
 * This plugin is designed for **RPG Maker MV**.
 * It displays a pop-up notification on the screen whenever the player
 * obtains items, weapons, armors, or gold, showing the icon, name, and amount.
 *
 * Features:
 * - Automatic pop-up when items are acquired
 * - Shows icon, item name, and quantity
 * - Also supports gold gain notifications
 *
 * Usage:
 * 1. Place the plugin in your project's `js/plugins` folder.
 * 2. Enable it via the Plugin Manager.
 * 3. Configure plugin parameters if available.
 *
 * Author: CFpanda
 * License: Free for commercial/non-commercial use. Credit is appreciated.
 */


(function() {
var _Game_Party_gainItem = Game_Party.prototype.gainItem;
Game_Party.prototype.gainItem = function(item, amount, includeEquip) {
_Game_Party_gainItem.call(this, item, amount, includeEquip);
if (item && amount > 0 && !includeEquip && !this._equipNotification) {
        this._addNotification(item.name + ' x' + amount, 'gain');
    }
        this._equipNotification = false;
};

var _Game_Party_gainGold = Game_Party.prototype.gainGold;
Game_Party.prototype.gainGold = function(amount) {
_Game_Party_gainGold.call(this, amount);
if (amount > 0) {
this._addNotification(' 金币' + amount, 'gain');
   }
};

Game_Party.prototype._notifications = [];
Game_Party.prototype._notificationIndex = 0;
Game_Party.prototype._equipNotification = false;
Game_Party.prototype._equipNotificationDisplayed = false;
Game_Party.prototype._notificationTimer = 0;

Game_Party.prototype._addNotification = function(text, type) {
    if (type !== 'gain' && type !== 'equip') return;
    if (this._equipNotificationDisplayed) {
        this._equipNotificationDisplayed = false;
        return;
    }
    this._notifications.push(text);
    if (!NotificationLock.isLocked) { // 如果没有锁定，立即显示通知
        this._displayNotification();
    }
};

var _Game_Party_lossGold = Game_Party.prototype.lossGold;
Game_Party.prototype.lossGold = function(amount) {
    _Game_Party_lossGold.call(this, amount);
    if (amount > 0) {
        this._addNotification('金币 - ' + amount, 'loss');  // 丢失金币的格式
    }
};

var _Game_Party_lossItem = Game_Party.prototype.lossItem;
Game_Party.prototype.lossItem = function(item, amount, includeEquip) {
    _Game_Party_lossItem.call(this, item, amount, includeEquip);
    if (item && amount > 0 && !includeEquip && !this._equipNotification) {
        this._addNotification(item.name + ' - ' + amount, 'loss');
    }
    this._equipNotification = false;
};

Game_Party.prototype._addNotification = function(text, type) {
    if (type !== 'gain' && type !== 'loss' && type !== 'equip') return;
    this._notifications.push(text);
    if (!NotificationLock.isLocked) {
        this._displayNotification();
    }
};

Game_Party.prototype._displayNotification = function() {
    if (this._notifications.length === 0) return;
    NotificationLock.lockNotification();// 如果通知已被锁定，直接返回
    var text = this._notifications.shift(); // 取出队列中的第一个通知
    var notification = new Sprite(new Bitmap(Graphics.width, 40));
    notification.bitmap.fontSize = 24;
    notification.bitmap.textColor = '#FFFFFF';
    notification.bitmap.outlineColor = '#000000';
    notification.bitmap.outlineWidth = 2;
    notification.x = 20;
    notification.y = 520 - this._notificationIndex * 40;
    notification.opacity = 255;
    SceneManager._scene.addChild(notification);
    this._notificationIndex++;
    // 获取物品图标
    var itemName = text.split(' x')[0];
    var item = $dataItems.find(i => i && i.name === itemName) ||
               $dataWeapons.find(i => i && i.name === itemName) ||
               $dataArmors.find(i => i && i.name === itemName);
    if (item) {
        var iconIndex = item.iconIndex;
        var iconBitmap = ImageManager.loadSystem('IconSet');
        notification.bitmap.blt(iconBitmap, iconIndex % 16 * 32, Math.floor(iconIndex / 16) * 32, 32, 32, 0, 4, 32, 32);
        var colorIndex = item.meta.color ? Number(item.meta.color) : 1;
        var color = Window_Base.prototype.itemColor(colorIndex);
        notification.bitmap.textColor = color;
    }
    notification.bitmap.drawText('获得 ' + text, 36, 0, Graphics.width - 36, 40, 'left');
    SceneManager._scene.addChild(notification);
    var party = this; // 保存当前上下文
    var duration = 150; // 通知显示的持续帧数
    var fadeOutStart = 120; // 通知开始淡出的帧数
    var moveSpeed = 2; // 通知上升速度，每帧上升的像素数
    notification.update = function() {
        if (duration > 0) {
            if (duration <= fadeOutStart) {
                this.opacity -= 255 / fadeOutStart; // 渐隐效果
            }
            if (!this.soundPlayed) { 
    if (text.includes('金币')) {
        // Delay the sound effect by 500ms (0.5 seconds)
        setTimeout(function() {
            AudioManager.playSe({
                name: 'coin1',
                volume: 90,
                pitch: 130,
                pan: 0
            });
        }, 800); 
                } else if (item) {
                    if (DataManager.isArmor(item)) {
                        AudioManager.playSe({
                            name: 'Item1',
                            volume: 40,
                            pitch: 110,
                            pan: 0
                        });
                    } else if (DataManager.isWeapon(item)) {
                        AudioManager.playSe({
                            name: 'Item1',
                            volume: 50,
                            pitch: 140,
                            pan: 0
                        });
                    } else {
                        AudioManager.playSe({
                            name: 'Item1',
                            volume: 50,
                            pitch: 120,
                            pan: 0
                        });
                    }
                }
                this.soundPlayed = true;
            }
            this.y -= moveSpeed; // 每帧上升
            duration--;
        } else {
            SceneManager._scene.removeChild(this); // 从当前场景移除通知      
            party._notificationIndex++; // 队列索引递增
            if (party._notifications.length > 0) {
                party._displayNotification(); // 显示下一条通知
            }
            NotificationLock.unlockNotification(); // 解锁通知
        }
    }
    SceneManager._scene.addChild(notification);
    notification.y = 520;
};

var _Game_Party_changeEquipment = Game_Party.prototype.changeEquipment;
Game_Party.prototype.changeEquipment = function(actorId, slotId, itemId) {
_Game_Party_changeEquipment.call(this, actorId, slotId, itemId);
if (itemId > 0) {
var item = $dataItems[itemId];
this._displayEquipMessage(item.name + '装备');
this._equipNotificationDisplayed = true;
}
};

Game_Party.prototype._displayEquipMessage = function(text) {
this._addNotification(text, 'equip');
};

var NotificationLock = {};
NotificationLock.name = 'Notification Lock';
NotificationLock.version = '1.0';
NotificationLock.isLocked = false; // 初始状态未锁定

// 锁定通知
NotificationLock.lockNotification = function() {
    this.isLocked = true;
   // console.log('Notification locked');
};

// 解锁通知
NotificationLock.unlockNotification = function() {
    this.isLocked = false;
   // console.log('Notification unlocked');
};

Game_Party.prototype.resumeNotifications = function() {
    if (this._notifications.length > 0) {
        this._displayNotification();
        // 手动恢复通知的显示状态
        var notification = SceneManager._scene.children[SceneManager._scene.children.length - 1];
        if (notification && notification.update) {
            notification.update();
        }
    }
};

var _SceneManager_onSceneCreate = SceneManager.onSceneCreate;
SceneManager.onSceneCreate = function() {
    _SceneManager_onSceneCreate.call(this);
    if ($gameParty) {
        $gameParty.resumeNotifications();
    } else {
        setTimeout(function() {
            if ($gameParty) {
                $gameParty.resumeNotifications();
            }
        }, 100);
    }
};

})();