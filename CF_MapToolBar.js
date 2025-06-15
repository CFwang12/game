/*:
 * @plugindesc Toolbar Plugin – A toolbar with 6 item slots, hotkeys 1-6, and customizable item selection.
 * @author CFpanda
 * 
 * @help
 * This plugin creates a toolbar with 6 item slots.
 * You can assign items to each slot through an item selection menu.
 * Items can be used either by clicking the toolbar or pressing number keys 1–6.
 *
 * You can also trigger a common event by adding a tag in the item note:
 * <common_event: X>   (X = ID of the common event to run when the item is used)
 *
 * No plugin commands or script calls are required.
 * Designed for RPG Maker MV.
 */


(function() {
var CFToolBarItems = [null, null, null, null, null]; // 使用空值初始化
var CFToolBarCooldowns = [0, 0, 0, 0, 0, 0]; // 每个槽位初始CD为0
var iconSize = 32; // 将图标大小设置为 32x32
var padding = 18; // 窗户周围有填充
var spacing = 3; // 图标之间的距离


function Window_CFToolBar() {
this.initialize(...arguments);
}


Window_CFToolBar.prototype = Object.create(Window_Base.prototype);
Window_CFToolBar.prototype.constructor = Window_CFToolBar;


Window_CFToolBar.prototype.initialize = function() {
var width = (iconSize + spacing) * 6 - spacing + padding * 2;
var height = iconSize + padding * 2;
Window_Base.prototype.initialize.call(this, 505, 640, 280, 90);
this.refresh();
this.activate();
this.opacity = 0;
};

Window_CFToolBar.prototype.refresh = function() {
this.contents.clear();
for (var i = 0; i < 6; i++) {
var x = i * (iconSize + spacing) + padding;
var y = padding;
// 绘制插槽背景
this.drawEmptySlot(i);
// 始终绘制插槽按键数字 (1 - 6)，确保数字在背景上方显示
this.contents.fontSize = 12; // 设置字体大小
this.changeTextColor('#FFFFFF'); // 设置字体颜色为白色，确保在背景上可见
this.drawText(i + 1, x + 1, y - 10, 20, 'left'); // 在插槽左上角显示按键数字
if (CFToolBarItems[i] !== null && $dataItems[CFToolBarItems[i]]) {
var item = $dataItems[CFToolBarItems[i]];
var iconIndex = item.iconIndex;
this.drawIcon(iconIndex, x, y);
var itemCount = $gameParty.numItems(item);
this.contents.fontSize = 16; // 恢复字体大小
this.drawText(itemCount, x, y + iconSize - 24, iconSize, 'right'); // 在图标下方显示物品数量
            // 冷却效果处理
            if (CFToolBarCooldowns[i] > 0) {
                var maxCooldown = 300; // 设置冷却时间总帧数，与 useItem 方法中的冷却时间一致
                var cooldownProgress = CFToolBarCooldowns[i] / maxCooldown;

                // 绘制渐变层
                var ctx = this.contents._context;
                var gradient = ctx.createLinearGradient(x, y, x, y + iconSize);
                gradient.addColorStop(0, `rgba(255, 255, 255, ${cooldownProgress * 0.5})`); // 渐变从亮到暗
                gradient.addColorStop(1, `rgba(0, 0, 0, ${cooldownProgress * 0.5})`);
                ctx.fillStyle = gradient;
                ctx.fillRect(x, y, iconSize, iconSize);
            }
}
}
};

// 插槽背景绘制函数
Window_CFToolBar.prototype.drawEmptySlot = function(index) {
  var x = index * (iconSize + spacing) + padding;
  var y = padding;
  var slotWidth = iconSize;
  var slotHeight = iconSize;
  var cornerRadius = 5;
  var borderWidth = 2;
  var borderColor = '#FFFFC0';
  var backgroundColor = '#DDDDDD';

  // 绘制槽背景
  this.contents.paintOpacity = 100;
  this.contents.fillStyle = backgroundColor;

  // 绘制圆角矩形背景
  this.drawRoundedRect(x, y, slotWidth, slotHeight, cornerRadius);

  // 绘制槽边框
  this.contents.paintOpacity = 255;
  this.contents.strokeStyle = borderColor;

  // 绘制圆角矩形边框
  this.drawRoundedRectBorder(x, y, slotWidth, slotHeight, cornerRadius, borderWidth);
};

// 绘制圆角矩形背景
Window_CFToolBar.prototype.drawRoundedRect = function(x, y, width, height, cornerRadius) {
  var ctx = this.contents._context;
  ctx.beginPath();
  ctx.moveTo(x + cornerRadius, y);
  ctx.lineTo(x + width - cornerRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + cornerRadius);
  ctx.lineTo(x + width, y + height - cornerRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - cornerRadius, y + height);
  ctx.lineTo(x + cornerRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - cornerRadius);
  ctx.lineTo(x, y + cornerRadius);
  ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
  ctx.fill();
};

// 绘制圆角矩形边框
Window_CFToolBar.prototype.drawRoundedRectBorder = function(x, y, width, height, cornerRadius, borderWidth) {
  var ctx = this.contents._context;
  ctx.beginPath();
  ctx.moveTo(x + cornerRadius, y);
  ctx.lineTo(x + width - cornerRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + cornerRadius);
  ctx.lineTo(x + width, y + height - cornerRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - cornerRadius, y + height);
  ctx.lineTo(x + cornerRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - cornerRadius);
  ctx.lineTo(x, y + cornerRadius);
  ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
  ctx.lineWidth = borderWidth;
  ctx.stroke();
};


var _Window_ItemList_makeItemList = Window_ItemList.prototype.makeItemList;
Window_ItemList.prototype.makeItemList = function() {
if (SceneManager._scene instanceof Scene_Map && SceneManager._scene._CFToolBarWindow) {
// 插件逻辑，仅在工具栏窗口中应用
const addedItems = SceneManager._scene._CFToolBarWindow.getCFToolBarItems();
this._data = $gameParty.allItems().filter(item => !addedItems.includes(item.id));
} else {
// 恢复默认行为
_Window_ItemList_makeItemList.call(this);
}
};

Scene_Map.prototype.openItemWindow = function() {
this._itemWindow = new Window_ItemList();
this._itemWindow.setHandler('ok', this.onItemOk.bind(this));
this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
this.addWindow(this._itemWindow);

// 显示过滤后的物品选择窗口
this._itemWindow.refresh();
this._itemWindow.activate();
};

Window_CFToolBar.prototype.getCFToolBarItems = function() {
return CFToolBarItems;
};

Window_CFToolBar.prototype.addItemToSlot = function(item) {
const index = this._selectedSlot; // 假设你有一个变量指向当前选择的插槽
this._items[index] = item; // 将物品放入指定插槽
this.refresh(); // 刷新快捷栏

// 确保物品在物品窗口中被移除
if (SceneManager._scene._itemWindow) {
SceneManager._scene._itemWindow.refresh();
}
};

Window_CFToolBar.prototype.removeEmptyItems = function() {
for (let i = 0; i < CFToolBarItems.length; i++) {
const itemId = CFToolBarItems[i];
if (itemId && $gameParty.numItems($dataItems[itemId]) <= 0) {
CFToolBarItems[i] = null; // 清空快捷栏槽位
this.refresh(); // 刷新快捷栏
}
}
};

Window_CFToolBar.prototype.update = function() {
Window_Base.prototype.update.call(this);
this.checkHotkeys();
this.processMouseInput();
this.removeEmptyItems(); // 检查并移除数量为0的物品
this.refresh();
};

Window_CFToolBar.prototype.getAddedItems = function() {
return CFToolBarItems.filter(item => item !== null);
};

Window_CFToolBar.prototype.isSlotEmpty = function(index) {
    return CFToolBarItems[index] == null; // 检查指定槽位是否为空
};

// 检查快捷键的函数
Window_CFToolBar.prototype.checkHotkeys = function() {
    for (var i = 0; i < 5; i++) {
        if (Input.isPressed(String(i + 1))) {
            if (this.isSlotEmpty(i)) {  // 检查槽位是否为空
                this.openWindow();      // 如果为空，打开窗口
            } else {
                this.useItem(i);        // 使用物品
            }
        }
    }
};


// 添加快捷键支持
document.addEventListener('keydown', function(event) {
    if (event.key >= '1' && event.key <= '6') {
        const index = parseInt(event.key) - 1;
        const toolbar = SceneManager._scene._CFToolBar;
        if (toolbar) {
            if (toolbar.isSlotEmpty(index)) {
                toolbar.openItemSelectionWindow(index);
            } else {
                toolbar.useItem(index);
            }
        } else {
            console.error('Toolbar is not initialized.');
        }
    }
});


// -----------------------------------------------------------------
Window_CFToolBar.prototype.updateCooldowns = function() {
    for (let i = 0; i < CFToolBarCooldowns.length; i++) {
        if (CFToolBarCooldowns[i] > 0) {
            CFToolBarCooldowns[i]--; // 减少冷却时间
        }
    }
};

Window_CFToolBar.prototype.update = function() {
    Window_Base.prototype.update.call(this);
    this.checkHotkeys();
    this.processMouseInput();
    this.removeEmptyItems();
    this.updateCooldowns(); // 更新CD
    this.refresh();
};


Window_CFToolBar.prototype.useItem = function(index) {
    if (CFToolBarCooldowns[index] > 0) {
        console.log("物品还在冷却中:", CFToolBarCooldowns[index]);
        return; // 如果冷却中，则直接返回
    }
    var itemId = CFToolBarItems[index];
    var item = $dataItems[itemId];
    if (item && $gameParty.hasItem(item)) {
        var actor = $gameParty.leader();
        var action = new Game_Action(actor);
        action.setItemObject(item);
        action.apply(actor);
        // 调用公共事件
        if (item.meta.common_event) {
            const eventId = Number(item.meta.common_event);
            this.callCommonEvent(eventId);
        }
        // 消耗物品
        $gameParty.consumeItem(item);
        // 设置冷却时间
        CFToolBarCooldowns[index] = 600; // 冷却时间为 600 帧 (5 秒)
        // 显示物品动画
        if (item.animationId > 0) {
            var actorSprite = SceneManager._scene._spriteset._characterSprites.find(function(sprite) {
                return sprite._character === $gamePlayer;
            });
            if (actorSprite) {
                actorSprite.startAnimation($dataAnimations[item.animationId], false, 0);
            }
        }
    }
};


// 调用公共事件的函数
Window_CFToolBar.prototype.callCommonEvent = function(eventId) {
// console.log("准备调用公共事件 ID: ", eventId); // 调试信息
const commonEvent = $dataCommonEvents[eventId];
if (commonEvent) {
// console.log("公共事件内容: ", commonEvent); // 检查事件内容
const interpreter = new Game_Interpreter();
interpreter.setup(commonEvent.list, 0);
interpreter.update(); // 如果希望立即执行，可以在这里使用
} else {
// console.log("找不到公共事件 ID: ", eventId); // 如果未找到事件
}
};

Window_CFToolBar.prototype.processMouseInput = function() {
if (TouchInput.isTriggered()) {
var x = TouchInput.x - this.x - padding;
var y = TouchInput.y - this.y - padding;
if (this.isInsideWindow(x, y)) {
var index = Math.floor((x - padding) / (iconSize + spacing));
if (index >= 0 && index < 6) {
this.openItemSelectionWindow(index);
}
}
}
};

Window_CFToolBar.prototype.isInsideWindow = function(x, y) {
return x >= 0 && x <= this.width && y >= 0 && y <= this.height;
};

Window_CFToolBar.prototype.openItemSelectionWindow = function(index) {
    // 检查并创建物品选择窗口实例
    if (!this._itemSelectionWindow) {
        this._itemSelectionWindow = new Window_ItemSelection(this, index);
       SceneManager._scene.addWindow(this._itemSelectionWindow);
    } else {
        this._itemSelectionWindow.setup(this, index); // 更新窗口内容
    }
    this._itemSelectionWindow.open(); // 打开窗口
AudioManager.playSe({name: 'Decision1', volume: 50, pitch: 100, pan: 0});
  SceneManager._scene._active = false; // 禁用当前场景
};

Window_CFToolBar.prototype.assignItemToSlot = function(slotIndex, itemId) {
    // 检查物品是否已经分配到其他槽位
    if (CFToolBarItems.includes(itemId)) {
        console.error("该物品已经在其他槽位中！");
        AudioManager.playSe({name: 'Buzzer1', volume: 50, pitch: 100, pan: 0}); // 播放错误音效
        return; // 如果已经分配，直接返回
    }

    // 确保物品有效
    if ($dataItems[itemId]) {
        CFToolBarItems[slotIndex] = itemId; // 分配物品到指定槽位
        this.refresh(); // 刷新工具栏显示
    } else {
        console.error("无效的物品 ID:", itemId);
    }
};


function Window_ItemSelection(CFToolBar, slotIndex) {
this.initialize(CFToolBar, slotIndex);
}

Window_ItemSelection.prototype = Object.create(Window_Selectable.prototype);
Window_ItemSelection.prototype.constructor = Window_ItemSelection;

Window_ItemSelection.prototype.itemHeight = function() {
return 36; // 物品高度，可以根据实际需要调整
};

// 修改 Window_ItemSelection 类，处理物品帮助的显示
Window_ItemSelection.prototype.initialize = function(CFToolBar, slotIndex) {
var width = Graphics.boxWidth / 5.0;
var itemHeight = this.itemHeight();
var numItemsToShow = 8;
var height = (numItemsToShow * itemHeight) + 35;
var x = 518;
var y = 350;

Window_Selectable.prototype.initialize.call(this, x, y, width, height);
this._CFToolBar = CFToolBar;
this._slotIndex = slotIndex;
this._list = $gameParty.items();
this.refresh();
this.select(0);
this.activate();

// 设置帮助窗口的默认文本
this.updateHelp();
};

// 更新帮助窗口内容，当光标移动时调用
Window_ItemSelection.prototype.updateHelp = function() {
const item = this._list[this.index()]; // 获取当前选中的物品

// 确保 _itemHelpWindow 存在
if (SceneManager._scene._itemHelpWindow && item) {
SceneManager._scene._itemHelpWindow.setText(item.description); // 设置帮助窗口的文本为物品的描述
SceneManager._scene._itemHelpWindow.show(); // 确保帮助窗口可见
} else if (SceneManager._scene._itemHelpWindow) {
SceneManager._scene._itemHelpWindow.setText(''); // 如果没有物品，清空帮助窗口的内容
SceneManager._scene._itemHelpWindow.hide(); // 隐藏帮助窗口
}
};

Window_ItemSelection.prototype.refresh = function() {
this._list = this.getFilteredItems(); // 更新为带有 <show> 的物品
this.clearItemList();
this.drawAllItems();
};

Window_ItemSelection.prototype.getFilteredItems = function() {
    // 获取当前工具栏中已分配的物品 ID
    const assignedItems = CFToolBarItems.filter(itemId => itemId !== null);

    // 过滤物品：备注中包含 `<show>` 且未分配到槽位
    return $gameParty.items().filter(item => {
        return item.note.includes('<show>') && !assignedItems.includes(item.id);
    });
};

// 处理物品选择的确认
Window_ItemSelection.prototype.processOk = function() {
var item = this._list[this.index()];
if (item) {
this._CFToolBar.assignItemToSlot(this._slotIndex, item.id);
this.close();
SceneManager._scene._active = true;
AudioManager.playSe({name: 'Cursor3', volume: 50, pitch: 100, pan: 0});

// 关闭帮助窗口
if (SceneManager._scene._itemHelpWindow) {
SceneManager._scene._itemHelpWindow.hide(); // 确保帮助窗口隐藏
}
}
};

// 取消选择时处理
Window_ItemSelection.prototype.processCancel = function() {
if (Input.isTriggered('cancel') || Input.isTriggered("rightButton")) {
this.close();
SceneManager._scene._active = true;
AudioManager.playSe({name: 'Cancel2', volume: 50, pitch: 100, pan: 0});

// 关闭帮助窗口
if (SceneManager._scene._itemHelpWindow) {
SceneManager._scene._itemHelpWindow.hide(); // 确保帮助窗口隐藏
}
}
};


// 在选择后更新物品列表为所有物品
Window_ItemSelection.prototype.updateItemList = function() {
this._list = $gameParty.items(); // 更新为所有物品
this.refresh(); // 刷新窗口以显示更新后的物品
};

// 刷新窗口时绘制所有物品
Window_ItemSelection.prototype.drawAllItems = function() {
var topIndex = this.topIndex();
var maxItems = this.maxItems();
var visibleItems = Math.floor(this.height / this.itemHeight());

for (var i = topIndex; i < Math.min(topIndex + visibleItems, maxItems); i++) {
var item = this._list[i];
if (item) {
this.drawItem(item, 0, (i - topIndex) * this.itemHeight());
}
}
};

Window_ItemSelection.prototype.maxItems = function() {
return this._list ? this._list.length : 0;
};

Window_ItemSelection.prototype.clearItemList = function() {
this.contents.clear(); // 清除当前内容
};

// 确保只在选择窗口激活时显示带有 <show> 的物品
Window_ItemSelection.prototype.maxItems = function() {
return this._list ? this._list.length : 0;
};

Window_ItemSelection.prototype.setup = function(CFToolBar, slotIndex) {
this._CFToolBar = CFToolBar;
this._slotIndex = slotIndex;
this._list = $gameParty.items();
this.refresh();
};

Window_ItemSelection.prototype.update = function() {
Window_Selectable.prototype.update.call(this);
if (this.isOpenAndActive()) {
if (!this._inputHandled) { // 检查输入是否已处理
this.processCursorMove();
this.processTouch();
this._inputHandled = true; // 将输入标记为已处理
}
if (Input.isTriggered('ok')) {
this.processOk();
} else if (Input.isTriggered('cancel')) {
this.processCancel();
}
} else {
this._inputHandled = false; // 当窗口不活动时重置
}
};

Window_ItemSelection.prototype.processCursorMove = function() {
if (this.isOpenAndActive()) {
if (Input.isTriggered('up')) {
this.cursorUp(true);
AudioManager.playSe({name: 'Cursor2', volume: 50, pitch: 100, pan: 0});
}
if (Input.isTriggered('down')) {
this.cursorDown(true);
AudioManager.playSe({name: 'Cursor2', volume: 50, pitch: 100, pan: 0});
}
}
};

// 每次光标移动时调用 updateHelp
Window_ItemSelection.prototype.cursorDown = function(wrap) {
var maxItems = this._list ? this._list.length : 1;
if (maxItems > 0) {
var newIndex = this.index() + 1;
var visibleItems = Math.floor(this.height / this.itemHeight());
if (newIndex < maxItems) {
this.select(newIndex);
if (newIndex >= this.topIndex() + visibleItems) {
this.setTopRow(newIndex - visibleItems); // 确保当前选中物品可见
}
this.updateHelp(); // 更新帮助窗口内容
} else if (wrap) {
this.select(1);
this.setTopRow(1); // 循环回到第一个物品
this.updateHelp(); // 更新帮助窗口内容
}
}
};

Window_ItemSelection.prototype.cursorUp = function(wrap) {
var maxItems = this._list ? this._list.length : 1;
if (maxItems > 0) {
var newIndex = this.index() - 1;
var visibleItems = Math.floor(this.height / this.itemHeight());
if (newIndex >= 0) {
this.select(newIndex);
if (newIndex < this.topIndex()) {
this.setTopRow(newIndex); // 确保当前选中物品可见
}
this.updateHelp(); // 更新帮助窗口内容
} else if (wrap) {
this.select(maxItems);
this.setTopRow(Math.max(maxItems - visibleItems)); // 循环回到最后一个物品
this.updateHelp(); // 更新帮助窗口内容
}
}
};

Window_ItemSelection.prototype.drawAllItems = function() {
var topIndex = this.topIndex();
var maxItems = this.maxItems();
var visibleItems = Math.floor(this.height / this.itemHeight());

for (var i = topIndex; i < Math.min(topIndex + visibleItems, maxItems); i++) {
var item = this._list[i];
if (item) {
this.drawItem(item, 1, (i - topIndex) * this.itemHeight());
}
}
};

Window_ItemSelection.prototype.processTouch = function() {
if (this.isOpenAndActive()) {
// 处理左键点击以选择物品
if (TouchInput.isTriggered()) {
var x = TouchInput.x - this.x;
var y = TouchInput.y - this.y;
var hitIndex = this.hitTest(x, y);

if (hitIndex >= 0) {
this.select(hitIndex);
this.processOk();
}
}

// 处理右键点击以关闭窗口
if (TouchInput.isCancelled()) { // 判断是否是右键点击
this.close();
SceneManager._scene._active = true;
if (SceneManager._scene._itemHelpWindow) {
SceneManager._scene._itemHelpWindow.hide();
AudioManager.playSe({name: 'Cancel2', volume: 50, pitch: 100, pan: 0});
}
}
}
};

// 保留右键菜单的处理逻辑（如果需要）
document.oncontextmenu = function(e) {
e.preventDefault();
// 在这里你可以添加其他右键菜单逻辑，如果有的话
};


Window_ItemSelection.prototype.setTopRow = function(index) {
var rowHeight = this.itemHeight();
var maxItems = this._list ? this._list.length : 0;
var visibleItems = Math.floor(this.height / rowHeight);
this.setScrollY(Math.max(1, rowHeight * Math.min(index, maxItems - visibleItems)));
};

Window_ItemSelection.prototype.setScrollY = function(y) {
this._scrollY = y;
this.refresh();
};

Window_ItemSelection.prototype.drawItem = function(item, x, y) {
var iconIndex = item.iconIndex;
var itemHeight = 36;
this.drawIcon(iconIndex, x, y);
this.drawText(item.name, x + 36, y, this.contents.width - 36);
};


// 将 CFToolBar 添加到地图场景
var _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
Scene_Map.prototype.createAllWindows = function() {
_Scene_Map_createAllWindows.call(this);
        this.createCFToolBar();
};

// 确保帮助窗口在场景初始化时创建
Scene_Map.prototype.createCFToolBar = function() {
this._CFToolBar = new Window_CFToolBar();
this.addChild(this._CFToolBar);
this.createItemHelpWindow();
};


Scene_Map.prototype.updateItemSelection = function() {
this._itemWindow.refresh(); // 刷新物品选择窗口
this._itemWindow.activate(); // 激活窗口
this._CFToolBarWindow.refresh(); // 刷新快捷栏窗口
};

// 在选择物品时打开帮助窗口
Scene_Map.prototype.openItemSelectionWindow = function(CFToolBar, slotIndex) {
this._itemSelectionWindow = new Window_ItemSelection(CFToolBar, slotIndex);
this._itemSelectionWindow.setHandler('ok', this.onItemOk.bind(this));
this._itemSelectionWindow.setHandler('cancel', this.onItemCancel.bind(this));
this._itemSelectionWindow.activate();
this.addWindow(this._itemSelectionWindow);

// 显示帮助窗口
this._itemHelpWindow.show();
this._itemHelpWindow.updateHelp(); // 确保更新帮助内容
};

// 处理物品选择的确认
Scene_Map.prototype.onItemOk = function() {
const item = this._itemSelectionWindow.item(); // 获取选中的物品
if (item) {
// 将物品添加到快捷栏
this._CFToolBarWindow.addItemToSlot(item);
// 刷新物品选择窗口，确保该物品从列表中消失
this._itemSelectionWindow.refresh();
// 关闭帮助窗口
this.closeHelpWindow(); // 使用新函数来隐藏帮助窗口
this._itemSelectionWindow.close(); // 关闭物品选择窗口
}
};

// 取消选择后关闭帮助窗口
Scene_Map.prototype.onItemCancel = function() {
// 关闭帮助窗口
this.closeHelpWindow(); // 使用新函数来隐藏帮助窗口
this._itemSelectionWindow.close(); // 关闭物品选择窗口
};

// 关闭帮助窗口的统一方法
Scene_Map.prototype.closeHelpWindow = function() {
this._itemHelpWindow.hide(); // 隐藏窗口
this._itemHelpWindow.setText(''); // 清空帮助内容
};


var _Game_Party_gainItem = Game_Party.prototype.gainItem;
Game_Party.prototype.gainItem = function(item, amount, includeEquip) {
_Game_Party_gainItem.call(this, item, amount, includeEquip);

// 如果物品存在于工具栏中，更新工具栏
if (SceneManager._scene instanceof Scene_Map) {
if (SceneManager._scene._CFToolBarWindow) {
SceneManager._scene._CFToolBarWindow.refresh();
}
}
};

// 扩展或修改物品使用方法
Game_Item.prototype.useItem = function(item) {
// 确保调用物品的基本效果
this.applyBasicEffects(item);

// 检查物品是否有公共事件，并调用它
if (item.meta.common_event) {
const eventId = Number(item.meta.common_event);
this.callCommonEvent(eventId);
}
};

// 调用公共事件的函数
Game_Item.prototype.callCommonEvent = function(eventId) {
// 创建一个新的事件处理器
const commonEvent = $dataCommonEvents[eventId];
if (commonEvent) {
const interpreter = new Game_Interpreter();
interpreter.setup(commonEvent.list, 0);
// 确保在适当的上下文中运行
interpreter.update();
}
};

// 创建帮助窗口
Scene_Map.prototype.createItemHelpWindow = function() {
const width = Graphics.boxWidth / 5.0; // 设置帮助窗口宽度
const height = 120; // 设置帮助窗口高度
const x = 520; // 设置窗口居中
const y = 230; // 设置窗口靠下的位置

this._itemHelpWindow = new Window_Help(2); // 创建帮助窗口
this._itemHelpWindow.width = width; // 设置窗口宽度
this._itemHelpWindow.height = height; // 设置窗口高度
this._itemHelpWindow.x = x; // 设置窗口位置
this._itemHelpWindow.y = y; // 设置窗口位置
this._itemHelpWindow.hide(); // 初始时隐藏窗口
this.addWindow(this._itemHelpWindow);
};

// 原插件命令逻辑扩展
var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);   
    // 显示工具栏
    if (command === "C_show") {
        const toolbar = SceneManager._scene._CFToolBar;
        if (toolbar) {
            toolbar.visible = true;
            $gameSwitches.setValue(20, true); // 可选，触发相关开关
           // console.log("工具栏已显示");
        }
    }   
    // 隐藏工具栏
    if (command === "C_hide") {
        const toolbar = SceneManager._scene._CFToolBar;
        if (toolbar) {
            toolbar.visible = false;
            $gameSwitches.setValue(20, false); // 可选，触发相关开关
           // console.log("工具栏已隐藏");
        }
    }
};

// Tab 键监听扩展，用于切换 Toolbar 的显示与隐藏
document.addEventListener('keydown', function(event) {
    if (event.key === 'Tab') { // 检测是否按下 Tab 键
        event.preventDefault(); // 阻止默认 Tab 行为
        
        const toolbar = SceneManager._scene._CFToolBar; // 获取 Toolbar 实例
        if (toolbar) {
            toolbar.visible = !toolbar.visible; // 切换显示状态
            $gameSwitches.setValue(20, toolbar.visible); // 同步开关状态
            const state = toolbar.visible ? "显示" : "隐藏";
            console.log(`Tab 键切换：工具栏当前状态为 ${state}`);
            AudioManager.playSe({ name: 'Decision1', volume: 50, pitch: 100, pan: 0 }); // 播放提示音效
        }
    }
});

// 初始化工具栏状态，根据开关设置默认显示状态
Scene_Map.prototype.createCFToolBar = function() {
    this._CFToolBar = new Window_CFToolBar();
    this._CFToolBar.visible = $gameSwitches.value(20); // 根据开关值初始化
    this.addChild(this._CFToolBar);
};

})();