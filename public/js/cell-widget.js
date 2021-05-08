/* global Cell, $c  */

Cell.Dialog = function Dialog() {
  /**
   * 建立 Dialog Element
   * @param {String} parent dialog 的父節點
   * @param {String} className dialog 的 Class name
   * @returns {Element} modal
   */
  var _createElement = (parent, className) => {
    let modal = document.createElement('div');
    $(modal).appendTo(parent)
            .addClass('modal')
            .addClass('cell-dialog')
            .addClass(className)
            .attr({
              'tabindex': -1,
              'role': 'dialog',
              'aria-hidden': true
            });
    return modal;
  };
  /**
   * 建立 Modal Content
   * @param {Element} modal
   */
  var _createModalContent = (modal) => {
    let modalDialog = document.createElement('div');
    $(modalDialog)
            .appendTo(modal._domNode)
            .addClass('modal-dialog')
            .addClass('modal-dialog-centered')
            .attr('role', 'document');
    modal._modalContent = $(document.createElement('div'))
            .appendTo(modalDialog)
            .addClass('modal-content');
  };
  /**
   * 建立 Modal Header
   * @param {Element} modal
   * @param {String} title 標題
   */
  var _createModalHeader = (modal, title) => {
    if (!title) {
      return;
    }
    let header = document.createElement('div');
    $(header).prependTo($(modal).find('.modal-content'))
            .addClass('modal-header');
    $(document.createElement('div')).appendTo(header)
            .addClass('modal-title')
            .html(title);
  };
  /**
   * 建立 Modal Body
   * @param {Element} modal
   */
  var _createModalBody = (modal) => {
    let body;
    if ($(modal.option.replaceTo).length > 0) {
      body = $(modal.option.replaceTo).removeClass('d-none');
    } else {
      body = document.createElement('div');
    }
    $(body).appendTo($(modal._domNode).find('.modal-content'))
            .addClass('modal-body');
    $(document.createElement('div')).appendTo(body)
            .addClass('modal-html');
  };
  /**
   * 建立ModalFooter
   * @param {Element} modal
   * @returns {Element}
   */
  var _createModalFooter = (modal) => {
    let footer = document.createElement('div');
    $(footer).appendTo($(modal).find('.modal-content'))
            .addClass('modal-footer');
    return footer;
  };
  /**
   * 建立 footer 的按鈕
   * @param {Element} modal
   */
  var _createFooterBtns = (modal) => {
    if (!modal.option.buttons) {
      return;
    }
    if (!Array.isArray(modal.option.buttons)) {
      modal.option.buttons = [modal.option.buttons];
    }
    $.each(modal.option.buttons, (idx, btn) => {
      _createFooterBtn(modal, btn);
    });
  };
  /**
   * 建立按鈕
   * @param {Element} modal
   * @param {Dialog.Button} btnData 按鈕
   */
  var _createFooterBtn = (modal, btnData) => {
    let $btn = $(document.createElement('button'));
    $btn.appendTo($(modal._modalContent).find('.modal-footer'))
            .addClass('btn')
            .addClass(btnData.type || 'btn-light')
            .addClass(btnData.className || '');
    if (btnData.dismiss !== false) {
      $btn.attr('data-dismiss', 'modal');
    }
    $.each(btnData.attrs, (attr, val) => {
      $btn.attr(attr, val);
    });
    if (btnData.faicon) {
      $(document.createElement('i')).appendTo($btn).addClass(btnData.faicon);
    }
    $(document.createElement('span')).appendTo($btn).html(btnData.label);
    if (btnData.onclick) {
      $btn.on('click', btnData.onclick);
    }
  };
  /**
   * 設定按鈕事件
   * @param {Element} modal
   * @param {Selector} selector 選擇器
   * @param {String} event 事件
   * @param {Function} handler  監聽器
   */
  var _setEvent = function (modal, selector, event, handler) {
    let target = (selector) ? $(modal).find(selector) : modal;
    $(target).off(event).on(event, handler);
  };

  /**
   * 取得 Icon 名稱
   * @param {string|number} type 類型
   * @return {String}
   */
  var _getTypeIcon = function (type) {
    switch (type) {
      case 1:
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 2:
      case 'success':
        return 'fas fa-check-circle';
      case 3:
      case 'info':
        return 'fas fa-info-circle';
      case 4:
      case 'error':
        return 'fas fa-times-circle';
      default:
        return '';
    }
  };
  /**
   * 設定 Icon
   * @param {Element} modal
   * @param {String} iconClass
   * @param {String} faicon 
   * @returns {Dialog}
   */
  var _setIcon = function (modal, iconClass, faicon) {
    let $domNode = $(modal._modalContent);
    $domNode.find('.modal-icon').remove();
    $(document.createElement('i'))
            .prependTo($domNode.find('.modal-body'))
            .addClass('modal-icon')
            .addClass(iconClass || modal.option.iconClass || null)
            .addClass(faicon || modal.option.faicon || null);
    return this;
  };

  /**
   * 設定 Modal
   * @param {type} dialog
   * @param {type} option
   * @returns {Cell.Dialog}
   */
  var _setupModal = function (dialog, option) {
    $(dialog._modal).off('shown.bs.modal').on('shown.bs.modal', function (e) {
      let onshowbefore = option.onshowbefore || dialog.option.onshowbefore;
      (onshowbefore) && (onshowbefore.call(dialog));
      clearTimeout(dialog._showTimer);
      dialog._showTimer = setTimeout(function () {
        $(dialog._modal).find('[autofocus]').focus().length !== 0 || $(dialog._modal).find('.btn-primary').focus();
        let onshow = option.onshow || dialog.option.onshow;
        (onshow) && (onshow.call(dialog));
      }, 100);
    }).off('hidden.bs.modal').on('hidden.bs.modal', function () {
      clearTimeout(dialog._closeTimer);
      dialog._closeTimer = setTimeout(function () {
        let onclose = option.onclose || dialog.option.onclose;
        (onclose) && (onclose.call(dialog));
      }, 100);
    });
    return this;
  };
  /**
   * 按鈕物件
   * @typedef {Object} Cell.Dialog.button
   * @property {String} [type] bootstrap button class
   * @property {String} [faicon] font-awesome icon class
   * @property {String} [className] class in html
   * @property {String} [label] 按鈕標籤
   * @property {Object} [attrs] attr in html
   * @property {Function} [onclick] click handler
   * @property {Boolean} [dismiss=true] 點擊按鈕之後是否關閉Dialog
   */
  /**
   * 事件物件
   * @typedef {Object} Cell.Dialog.event
   * @property {String} selector 選擇器
   * @property {String} event 事件
   * @property {Function} handler event's handler
   */
  /**
   * Cell.Dialog.<br/>
   * 不建議同時顯示兩個以上的 Dialog 會造成使用者體驗不佳
   * @param {Object} option 初始化設置
   * @param {String} [option.appendTo='.cell-main-container'] dialog的父節點
   * @param {String} [option.className] dialog的class name
   * @param {String} [option.title=null] 標題 (為 null時不顯示標題)
   * @param {String} [option.replaceTo] 取代節點 (可將已存在的 HTML 直接轉換成 Dialog)
   * @param {String} [option.iconClass] dialog 的 icon class
   * @param {String} [option.faicon]  font awesome icon，參考 font awesome
   * @param {String} [option.content] dialog 的內容
   * @param {Array<Cell.Dialog.button>} [option.buttons] 按鈕
   * @param {Array<Cell.Dialog.event>} [option.events] 事件
   * @param {String|Boolean} [option.backdrop=true] Bootstrap's Modal.backdrop
   * @param {Function} [option.onshowbefore] 當 Dialog 顯示前的handler
   * @param {Function} [option.onshow] 當 Dialog 顯示後的handler
   * @param {Function} [option.onclose] 當 Dialog 關閉後的handler
   * @memberOf Cell
   * @namespace Dialog
   * @class Cell.Dialog
   * @version 1.0.0
   * @author Lruihao
   */
  function Dialog(option = {}) {
    var _proto = Dialog.prototype;
    this.option = option;
    this.option.backdrop = this.option.backdrop === undefined ? true : this.option.backdrop;
    this._modal = _createElement(this.option.appendTo || '.cell-main-container', this.option.className);
    this._domNode = this._modal;
    _createModalContent(this);
    _createModalHeader(this._modal, (this.option.title || null));
    _createModalBody(this);
    _createModalFooter(this._modal);
    _createFooterBtns(this);
    /*
     *  找尋元件
     * @param {Selector} selector 選擇器
     * @returns {Element}
     * @name Cell.Dialog#find
     * @function
     */
    _proto.find = function (selector) {
      return $(this._modal).find(selector);
    };
    /**
     * 設定標題
     * @param {String} title 標題
     * @returns {Cell.Dialog}
     * @name Cell.Dialog#setTitle
     * @function
     */
    _proto.setTitle = function (title) {
      this.find('.modal-title').html(title || this.option.title);
      return this;
    };
    /**
     * 設定內容
     * @param {String} [content] 內容
     * @returns {Cell.Dialog}
     * @name Cell.Dialog#setContent
     * @function
     */
    _proto.setContent = function (content) {
      this.find('.modal-html').html(content || this.option.content);
      return this;
    };
    /**
     * 設定內容Class
     * @param {String} [contentClass] 內容的 className in HTML
     * @returns {Cell.Dialog}
     * @name Cell.Dialog#setContentClass
     * @function
     */
    _proto.setContentClass = function (contentClass) {
      this.find('.modal-html').addClass(contentClass || this.option.contentClass || '');
      return this;
    };
    /**
     * 設定事件
     * @param {Array<Cell.Dialog.event>} [events] 事件設定
     * @returns {Cell.Dialog}
     * @name Cell.Dialog#setEvents
     * @function
     */
    _proto.setEvents = function (events) {
      if (!events) {
        return this;
      }
      if (!Array.isArray(events)) {
        events = [events];
      }
      let dialog = this;
      $.each(events, function (idx, e) {
        _setEvent(dialog._modal, e.selector, e.event, e.handler);
      });
      return this;
    };
    /**
     * 設定 Dialog icon
     * @param {String} [iconClass] icon's className in HTML
     * @param {String} [faicon] font-awesome's icon
     * @returns {Cell.Dialog}
     * @name Cell.Dialog#setIcon
     * @function
     */
    _proto.setIcon = function (iconClass, faicon) {
      _setIcon(this, iconClass, faicon);
      return this;
    };
    /**
     * 更新 Dialog
     * @param {Object} option 選項，當不帶入任何值時以初始化設置為主
     * @param {String} [option.title] 標題
     * @param {String} [option.iconClass] icon's className in HTML
     * @param {String} [option.faicon] font-awesome's icon
     * @param {String} [option.content] 內容
     * @param {String} [option.contentClass] 內容的 className in HTML
     * @param {Array<Cell.Dialog.event>} [option.events] 事件設定
     * @returns {Cell.Dialog}
     * @name Cell.Dialog#render
     * @function
     */
    _proto.render = function (option) {
      this.setTitle(option.title)
              .setIcon(option.iconClass, option.faicon || _getTypeIcon(option.type || 0))
              .setContent(option.content)
              .setContentClass(option.contentClass)
              .setEvents(option.events);
      _setupModal(this, option);
      return this;
    };
    /**
     * 顯示 Dialog
     * @param {Object} option 選項，當不帶入任何值時以初始化設置為主
     * @param {String} [option.title] 標題
     * @param {String} [option.iconClass] icon's className
     * @param {String} [option.faicon] font-awesome's icon
     * @param {String} [option.content] 內容
     * @param {String} [option.contentClass] 內容的 className in HTML
     * @param {Array<Cell.Dialog.event>} [option.events] 事件設定
     * @param {String|Boolean} [option.backdrop=true] Bootstrap's Modal.backdrop
     * @returns {Cell.Dialog}
     * @name Cell.Dialog#show
     * @function
     */
    _proto.show = function (option = {}) {
      this.render(option);
      $(this._modal).modal({
        'show': true,
        'backdrop': (option.backdrop === undefined ? this.option.backdrop : option.backdrop)
      });
      $(this._modal).modal('handleUpdate');
      return this;
    };
    /**
     * 關閉 Dialog
     * @name Cell.Dialog#hide
     * @function
     */
    _proto.hide = function () {
      $(this._modal).modal('hide');
      return this;
    };
    _setupModal(this, this.option);
    this.render(this.option);
  }
  return Dialog;
}();

Cell.Tooltip = function Tooltip() {

  /**
   * 創建元素
   * @param {Selector} parent = 'body' 父節點
   * @return {Element}
   */
  var _createElement = function (parent = 'body') {
    return $(document.createElement('div')).appendTo(parent)
            .addClass('cell-tooltip alert alert-dismissible')
            .attr({
              'tabindex': '-1',
              'role': 'alert',
              'aria-hidden': true
            })
            .css('display', 'none');
  };

  /**
   * 創建 Tootip 內容節點
   * @param {Element} tooltip
   */
  var _createTooltipContent = function (tooltip) {
    $(document.createElement('div')).appendTo($(tooltip))
            .addClass('tooltip-content');
  };

  /**
   * 創建 Tootip 關閉按鈕節點
   * @param {type} tooltip _proto
   */
  var _createTooltipClosebtn = function (tooltip) {
    tooltip._closebtn = document.createElement('button');
    $(tooltip._closebtn).appendTo($(tooltip._tooltip))
            .addClass('close')
            .html('&times;')
            .attr({
              'type': 'button',
              'aria-label': 'Close'
            });
  };

  /**
   * 設置 Tooltip 關閉事件監聽
   * @param {type} tooltip _proto
   * @return {Cell.Tooltip}
   * @function
   */
  var _setEventListener = function (tooltip) {
    $(tooltip._closebtn).on('click', function () {
      tooltip.hide();
    });
    return this;
  };

  /**
   * 設定 關閉狀態
   * @param {type} tooltip _proto
   * @param {Boolean} closeable 是否可關閉
   */
  var _setCloseBtn = function (tooltip, closeable) {
    $(tooltip._tooltip).toggleClass('alert-dismissible', closeable);
    closeable ? $(tooltip._closebtn).show() : $(tooltip._closebtn).hide();
  };

  /**
   * 取得Tooltip類型 Icon 名稱
   * @param {string|number} type tooltip類型
   * @return {String}
   */
  var _getTypeIcon = function (type) {
    switch (type) {
      case 1:
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 2:
      case 'success':
        return 'fas fa-check-circle';
      case 3:
      case 'info':
        return 'fas fa-info-circle';
      case 4:
      case 'error':
        return 'fas fa-times';
      default:
        return '';
    }
  };

  /**
   * 設定 Icon
   * @param {type} tooltip _proto
   * @param {String} iconClass icon's className
   * @param {String} faicon font-awesome's className
   * @return {Cell.Tooltip}
   */
  var _setIcon = function (tooltip, iconClass, faicon) {
    let $domNode = $(tooltip._tooltip);
    $domNode.find('.tooltip-icon').remove();
    $(document.createElement('i'))
            .prependTo($domNode)
            .addClass('tooltip-icon')
            .addClass(iconClass || tooltip.option.iconClass || null)
            .addClass(faicon || tooltip.option.faicon || null);
    return this;
  };

  /**
   * 設置 Tooltip 關閉延遲時間
   * @param {type} tooltip _proto
   * @param {Number} delay 延遲關閉時間
   * @return {Cell.Tooltip}
   * @function
   */
  var _setDelayTime = function (tooltip, delay) {
    if (tooltip.timeout) {
      clearTimeout(tooltip.timeout);
    }
    tooltip.timeout = setTimeout(() => {
      tooltip.hide();
    }, delay);
    return this;
  };

  /**
   * Cell.Tooltip.<br/>
   * Cell.Tooltip 已經實體化於 $c.tooltip
   * @param {Selector} [option.appendTo = 'body'] 父節點
   * @param {String} [option.className = 'alert-light'] tooltip className in HTML
   * @param {String} [option.iconClass] icon's className
   * @param {String} [option.faicon] fontAwesome icon
   * @param {String} [option.content] tooltip's content
   * @param {String} [option.contentClass] content's className
   * @param {Boolean} [option.closeable = true] 是否可關閉
   * @param {Number} [option.delay = 3000] 延遲時間 單位ms
   * @param {Object} option 初始化設置
   * @return {Tooltip.Tooltip}
   * @memberOf Cell
   * @namespace Tooltip
   * @class Cell.Tooltip
   * @author Lruihao
   */
  function Tooltip(option = {}) {
    var _proto = Tooltip.prototype;
    this.option = option;
    this.option.closeable = this.option.closeable === undefined ? true : this.option.closeable;
    this._tooltip = _createElement(this.option.appendTo);
    _createTooltipContent(this._tooltip);
    _createTooltipClosebtn(this);
    _setEventListener(this);

    /**
     * 找尋元件
     * @param {Selector} selector 選擇器
     * @returns {Element}
     * @name Cell.Tooltip#find
     * @function
     */
    _proto.find = function (selector) {
      return $(this._tooltip).find(selector);
    };

    /**
     * 設置 Tooltip 類名
     * @param {String} className = 'alert-light' tooltip's className in HTML
     * @returns {Cell.Tooltip}
     * @name Cell.Tooltip#setClassName
     * @function
     */
    _proto.setClassName = function (className) {
      $(this._tooltip).removeClass()
              .addClass('cell-tooltip alert alert-dismissible')
              .addClass(className || this.option.className || 'alert-light');
      return this;
    };

    /**
     * 設定內容
     * @param {String} [content] 內容
     * @returns {Cell.Tooltip}
     * @name Cell.Tooltip#setContent
     * @function
     */
    _proto.setContent = function (content) {
      this.find('.tooltip-content').html(content || this.option.content);
      return this;
    };

    /**
     * 設定內容Class
     * @param {String} [contentClass] 內容的 className in HTML
     * @returns {Cell.Tooltip}
     * @name Cell.Tooltip#setContentClass
     * @function
     */
    _proto.setContentClass = function (contentClass) {
      this.find('.tooltip-content').removeClass()
              .addClass('tooltip-content')
              .addClass(contentClass || this.option.contentClass || '');
      return this;
    };

    /**
     * 設定 Tooltip icon
     * @param {String} [iconClass] icon's className in HTML
     * @param {String} [faicon] font-awesome's icon
     * @returns {Cell.Tooltip}
     * @name Cell.Tooltip#setIcon
     * @function
     */
    _proto.setIcon = function (iconClass, faicon) {
      _setIcon(this, iconClass, faicon);
      return this;
    };

    /**
     * 顯示 Tooltip 提示
     * @param {String} [option.className = 'alert-light'] tooltip className in HTML
     * @param {String} [option.iconClass] icon's className
     * @param {String|Number} [option.type] faicon 類型,預設('warning','info','success','error')
     * @param {String} [option.faicon] fontAwesome icon
     * @param {String} [option.content] tooltip's content
     * @param {String} [option.contentClass] content's className
     * @param {Boolean} [option.closeable = true] 是否可關閉
     * @param {Number} [option.delay = 3000] 延遲時間 單位ms
     * @param {Object} option 選項，當不帶入任何值時以初始化設置為主
     * @return {Tooltip.Tooltip}
     * @name Cell.Tooltip#show
     * @function
     */
    _proto.show = function (option = {}) {
      option.closeable = option.closeable === undefined ? this.option.closeable : option.closeable;
      //更新內容
      this.setIcon(option.iconClass, option.faicon || _getTypeIcon(option.type || 0))
              .setContent(option.content)
              .setContentClass(option.contentClass)
              .setClassName(option.className);
      _setDelayTime(this, option.delay || this.option.delay || 3000);
      _setCloseBtn(this, option.closeable);
      $(this._tooltip).fadeIn();
      return this;
    };

    /**
     * 關閉Tooltip提示
     * @function
     * @name Cell.Tooltip#hide
     */
    _proto.hide = () => {
      $(this._tooltip).fadeOut();
      clearTimeout(this.timeout);
      return this;
    };
  }
  return Tooltip;
}();

Cell.Message = function Message() {

  /**
   * 顯示OK按鈕
   * @param {Message} message
   */
  var _showOkBtn = function (message) {
    message._dialog.find('.btn-primary').show().focus();
  };

  /**
   * 隱藏OK按鈕
   * @param {Message} message
   */
  var _hideOkBtn = function (message) {
    message._dialog.find('.btn-primary').hide();
  };

  /**
   * Cell.Message.<br/>
   * Cell.Message 已經實體化於 $c.message
   * @memberOf Cell
   * @namespace Message
   * @class Cell.Message
   * @author Lruihao
   */
  function Message() {
    var _proto = Message.prototype;
    this._dialog = new Cell.Dialog({
      'appendTo': document.body,
      'className': 'cell-message',
      'buttons': {
        'label': 'OK',
        'faicon': 'fas fa-check',
        'type': 'btn-primary',
        'attrs': {
          'autofocus': true
        }}});
    /**
     * 設定按鈕標籤
     * @param {String} label 標籤
     * @returns {Cell.Message}
     * @name Cell.Message#setLabel
     * @function
     */
    _proto.setLabel = function (label) {
      $(this._dialog._modalContent).find('.btn-primary').find('span').html(label || this.option && this.option.label || 'OK');
      return this;
    };
    /**
     * 顯示訊息框
     * @param {Object} option 顯示選項 (more see {@link Cell.Dialog#show})
     * @param {String|Number} [option.type] 訊息框類型 ('warning', 'success', 'info')
     * @param {String} [option.label='OK'] 按鈕標籤
     * @param {Function} [option.ok] 按下確認時的handler
     * @param {Bool} [option.noButton=false] 不顯示按鈕
     * @returns {Cell.Message}
     * @name Cell.Message#show
     * @function
     */
    _proto.show = function (option) {
      this.setLabel(option.label);
      option.content = option.content || '';
      option.onclose = option.ok;
      option.backdrop = option.backdrop === undefined ? 'static' : option.backdrop;
      if (option.noButton === true) {
        _hideOkBtn(this);
      } else {
        _showOkBtn(this);
      }
      this._dialog.show(option);
      return this;
    };

    /**
     * 隱藏訊息框
     * @returns {Cell.Message}
     * @name Cell.Message#hide
     * @function
     */
    _proto.hide = () => {
      this._dialog.hide();
    };
  }
  return Message;
}();

Cell.Confirm = function Confirm() {
  /**
   * @typedef Cell.Confirm.Button
   * @property {String} [label='OK'] 按鈕名稱
   * @property {String} [faicon] Font-awesome's icon
   * @property {String} [type] Bootstraps's Button type
   * @property {Boolean} [autoFocus] 是否自動 focus 按鈕
   * @property {Function} [click] 按下 OK 後的 handler
   */
  /**
   * Cell.Confirm. 
   * Cell.Confirm 已經實體化於 $c.confirm
   * @param {Object} options 初始化設置
   * @param {Selector} [options.replaceTo] 取代已存在的節點
   * @param {Selector} [options.appendTo] 添加到已存在的節點下
   * @memberOf Cell
   * @namespace Confirm
   * @class Cell.Confirm
   */
  function Confirm(options = {}) {
    var _proto = Confirm.prototype;
    this._dialog = new Cell.Dialog({
      'appendTo': (options.replaceTo) ? null : options.appendTo || document.body,
      'replaceTo': options.replaceTo,
      'className': 'cell-confirm',
      'buttons': [{
          'className': 'cancel',
          'attrs': {
            'autofocus': true
          }
        }, {
          'className': 'ok'
        }]});
    /**
     * 設定按鈕
     * @param {String} btnName 按鈕 (ok, cancel)
     * @param {Cell.Confirm.Button} option 按鈕設定
     * @returns {Cell.Confirm}
     * @name Cell.Confirm#setButton
     * @function
     */
    _proto.setButton = function (btnName, option) {
      let confirm = this;
      let $domNode = $(this._dialog._modalContent);
      let $btn = $domNode.find(`.${btnName}`);
      $btn.removeAttr('class')
              .addClass('btn')
              .addClass(btnName)
              .addClass(option.type)
              .find('span')
              .html(option.label || '');
      $btn.find('.svg-inline--fa').remove();
      $(document.createElement('i'))
              .prependTo($btn)
              .addClass('fas')
              .addClass(option.faicon);
      if (option.autoFocus === true) {
        $($btn).attr('autofocus', true);
      } else {
        $($btn).removeAttr('autofocus');
      }
      if (option.click) {
        $($btn).unbind('click').on('click', function () {
          setTimeout(option.click.call(confirm), 300);
        });
      }
      return this;
    };
    /**
     * 顯示確認框
     * @param {Object} option 顯示選項 (more see {@link Cell.Dialog#show})
     * @param {String|Number} [option.type] 訊息框類型 ('warning', 'success', 'info')
     * @param {Cell.Confirm.Button} [option.ok] OK 按鈕設定
     * @param {Cell.Confirm.Button} [option.cancel] Cancel 按鈕設定
     * @returns {Cell.Confirm}
     * @name Cell.Confirm#show
     * @function
     */
    _proto.show = function (option) {
      this.setButton('ok', $().extend({
        'label': 'OK',
        'faicon': 'fa-check',
        'type': 'btn-primary'
      }, option.ok));
      this.setButton('cancel', $().extend({
        'label': 'Cancel',
        'faicon': 'fa-times',
        'type': 'btn-light'
      }, option.cancel));
      option.content = option.content || '';
      option.backdrop = option.backdrop === undefined ? 'static' : option.backdrop;
      this._dialog.show(option);
      return this;
    };
  }
  return Confirm;
}();

Cell.Tab = function Tab() {
  /**
   * 建立元素
   * @param {Cell.Tab} self
   */
  var _createMenuElement = (self) => {
    let tabMenu;
    if (self.options.replaceTo) {
      tabMenu = $(self.options.replaceTo);
    } else {
      tabMenu = document.createElement('div');
      $(tabMenu).appendTo(self.options.appendTo || '.cell-main-container');
    }
    $(tabMenu).addClass('cell-tab-menu');
    self._domNode = tabMenu;
  };

  /**
   * 建立菜單
   * @param {Cell.Tab} self
   */
  var _createMenus = (self) => {
    self._tabSetting = [];
    self.options.tabs.forEach(function (tabSetting, idx) {
      _createMenu(self, tabSetting);
      self._tabSetting[tabSetting.target] = tabSetting;
    });
  };

  /**
   * 建立單一菜單
   * @param {Cell.Tab} self
   * @param {Object} tabSetting
   */
  var _createMenu = (self, tabSetting) => {
    let target = '#' + (tabSetting.target || '');
    $(document.createElement('a')).appendTo(self._domNode)
            .addClass('cell-tab-menu-item')
            .addClass(tabSetting.faicon || '')
            .addClass(tabSetting.className || '')
            .html(tabSetting.label)
            .attr('href', target)
            .on('click', function (event) {
              event.preventDefault();
              //Didn't trigger hashchange so as not to push history.
              $c.replaceHistory(location.pathname + location.search + target);
              _selectItem(self);
            });
  };

  /**
   * 建立下滑線
   * @param {Cell.Tab} self
   */
  var _createUnderline = (self) => {
    $(document.createElement('hr')).appendTo(self._domNode).addClass('cell-tab-menu-underline');
  };

  /**
   * 選擇Tab
   * Tips: 不應使用JQuery的選擇器，因為找不到帶小數點的ID
   * @param {Cell.Tab} self
   */
  var _selectItem = (self) => {
    $('.cell-tab.show').removeClass('show');
    let target = location.hash.toString().replace('#', '');
    let tabId;
    if (target === '') {
      tabId = self.options.defaultTab;
    } else {
      //自頂向下依次查找，直到滿足的menu選單
      for (let idx in self._tabSetting) {
        if (target === idx || $(document.getElementById(idx)).find(document.getElementById(target)).length) {
          tabId = idx;
          break;
        }
      }
      tabId = tabId || target;
    }
    let item = $(self._domNode).find(`[href="#${tabId}"]`);
    if (item.length === 0) {
      return;
    }
    let tabsetting = self._tabSetting[tabId] || {};
    //show
    $(self._domNode).find('.cell-tab-menu-underline').width($(item).outerWidth()).css('left', $(item).position().left);
    $(self._domNode).find('.cell-tab-menu-item.selected').removeClass('selected');
    $(document.getElementById(tabId)).addClass('show');
    $(item).addClass('selected');
    //scroll
    if (target && target !== tabId) {
      let root = document.getElementById(tabId);
      let $cagetElement = $(document.getElementById(target));
      let $lastStickyElement = $(root).scrollParent()
              .find('.position-sticky:visible, .sticky-top:visible, .position-fixed:visible')
              .filter(function (index, element) {
                return $(element).css('top') !== 'auto';
              });
      let scrollHeight = $cagetElement.offset().top - $(root).offset().top;
      if ($lastStickyElement.length) {
        scrollHeight -= parseInt($lastStickyElement.css('top')) + $lastStickyElement.outerHeight();
      }
      scrollHeight > 0 && $(window).scrollTop(scrollHeight);
    }
    //initialize
    if ($(item).attr('data-initialized') !== 'true') {
      $(item).attr('data-initialized', true);
      tabsetting.init && tabsetting.init.call(self);
      self.options.autoSticky !== false && $c.stackSticky('top', `#${tabId}`);
    }
    tabsetting.onshow && tabsetting.onshow.call(this);
    $(document.getElementById(tabId)).find('[autofocus]').focus();
  };

  /**
   * 設定事件
   * @param {Cell.Tab} self
   */
  let _setupEvent = (self) => {
    $(window).off('hashchange').on('hashchange', function (e) {
      _selectItem(self);
    });
  };

  /**
   * @typedef Cell.Tab.Tab
   * @property {String} label 標籤名稱
   * @property {String} className 類名
   * @property {String} faicon icon
   * @property {String} target 目標ID
   * @property {Function} onshow 顯示時的handler
   * @property {Function} init 初始化的handler
   */
  /**
   * Cell.Tab
   * @param {Object} options
   * @param {Selector} [options.replaceTo] 取代已存在的節點
   * @param {Selector} [options.appendTo] 添加到已存在的節點下
   * @param {String} [options.defaultTab] 預設顯示的 tab ID
   * @param {Bool} [options.autoSticky=true] 自動計算 sticky top
   * @param {Array<Cell.Tab.Tab>} [options.tabs] tab
   * @memberOf Cell
   * @namespace Tab
   * @class Cell.Tab
   * @author Lruihao
   */
  function Tab(options) {
    var _proto = Tab.prototype;
    this.options = options || {};
    _createMenuElement(this);
    _createMenus(this);
    _createUnderline(this);
    _setupEvent(this);
    _selectItem(this);

    /**
     * 顯示Tab
     * @param {String} target TabID || Anchor
     * @returns {Cell.Tab}
     * @name Cell.Tab#show
     * @function
     */
    _proto.show = function (target) {
      $c.replaceHistory(location.pathname + location.search + `#${target}`);
      _selectItem(this);
      return this;
    };
  }
  return Tab;
}();

Cell.Searchbar = function Searchbar() {
  var DOM = 'cell-searchbar';
  var FORM = 'cell-searchbar-form';
  var FORM_DISPLAY_INPUT = 'cell-searchbar-display-input';
  var INPUT = 'cell-searchbar-input';
  var BTN_EMPTY = 'cell-searchbar-btn-empty';
  var SEARCH_RESULT = 'cell-searchbar-result';
  var SEARCH_PROPOSE = 'cell-searchbar-propose';
  var PROPOSE_LABEL = 'data-label';
  var PROPOSE_VALUE = 'data-value';
  var PROPOSE_KEYWORD = 'data-keyword';
  var SEARCH_EMPTY = 'cell-searchbar-empty-message';
  var SEARCH_NOTFIND = 'cell-searchbar-notfind-message';
  var SEARCH_LOADER = 'cell-searchbar-loader';

  /**
   * 建立節點 - Searchbar
   * @param {Cell.Searchbar} self Searchbar
   */
  var _createDom = (self) => {
    let $sbDom;
    if (self.options.replaceTo) {
      $sbDom = $(self.options.replaceTo).attr('class', '');
    } else {
      $sbDom = $(document.createElement('div'));
      $sbDom.appendTo(self.options.appendTo || '.cell-main-container');
    }
    $sbDom.attr('tabindex', '-1').addClass(DOM);
    return $sbDom[0];
  };

  /**
   * 建立節點 - 表單
   * @param {Cell.Searchbar} self Searchbar
   */
  var _createDomForm = (self) => {
    let divForm = document.createElement('div');
    $(divForm).appendTo(self._domNode)
            .addClass(FORM)
            .attr('tabindex', '-1');
    if (self.options.faicon !== false) {
      $(document.createElement('i')).appendTo(divForm)
              .addClass('fas ' + (self.options.faicon || 'fa-search'));
    }
    //display input
    var displayInput = document.createElement('input');
    $(displayInput).appendTo(divForm)
            .addClass(FORM_DISPLAY_INPUT)
            .attr('type', 'text')
            .attr('placeholder', self.options.placeholder || 'Search')
            .attr('autofocus', self.options.autofocus || false)
            .attr('autocomplete', 'off')
            .attr('name', self.options.displayName || null);
    if (self.options.required === true) {
      $(displayInput).attr('required', self.options.required || null);
    }
    //value
    $(document.createElement('input')).appendTo(divForm)
            .addClass(INPUT)
            .attr('type', 'hidden')
            .attr('name', self.options.name);
    //clean button
    let $btnEmpty = $(document.createElement('span'));
    $btnEmpty.appendTo(divForm)
            .addClass(BTN_EMPTY)
            .attr('tabindex', '-1');
    $(document.createElement('i')).appendTo($btnEmpty)
            .addClass('fas fa-times');
  };

  /**
   * 建立節點 - 搜尋建議
   * @param {Cell.Searchbar} self Searchbar
   */
  var _createDomPropose = (self) => {
    if (typeof self.options.searchUrl !== 'string') {
      return;
    }
    let result = document.createElement('div');
    $(result).appendTo(self._domNode)
            .addClass(SEARCH_RESULT)
            .css('top', $(self._domNode).find('.' + FORM).outerHeight());
    $(document.createElement('ul')).appendTo(result)
            .addClass(SEARCH_PROPOSE);
    let loader = document.createElement('div');
    $(loader).appendTo(result)
            .addClass(SEARCH_LOADER);
    $(document.createElement('span')).appendTo(loader)
            .addClass('fad fa-spinner-third fa-spin m-r-1');
    $(document.createElement('span')).appendTo(loader)
            .html(self.options.loadingMessage || 'Loding');
    $(document.createElement('div')).appendTo(result)
            .addClass(SEARCH_EMPTY)
            .html(self.options.emptyMessage || 'No any propose');
    $(document.createElement('div')).appendTo(result)
            .addClass(SEARCH_NOTFIND)
            .html(self.options.notfindMessage || 'Not find relative propose');
  };

  /**
   * 設定預設值
   * @param {Cell.Searchbar} self Searchbar
   * @param {Object} propose
   * @returns {Searchbar}
   */
  var _setDefaultValue = (self, propose) => {
    self.resetPropose();
    let displayValue = propose[self.options.labelName];
    let value = propose[self.options.valueName];
    self.addPropose(propose);
    _setValue(self, displayValue, value, true);
    return this;
  };

  /**
   * 設定值
   * @param {Cell.Searchbar} self Searchbar
   * @param {String} displayValue
   * @param {String} value
   * @param {Bool} [change=false] do change handle
   * @param {object} [data]
   * @returns {Searchbar}
   */
  var _setValue = (self, displayValue, value, change = false, data) => {
    $(self._domNode).find(`.${FORM_DISPLAY_INPUT}`).val(displayValue || value || '');
    let $input = $(self._domNode).find(`.${INPUT}`).val(value);
    if (change === true) {
      $input.trigger('change', data);
    }
    _checkValue(self);
    return this;
  };

  /**
   * 檢查是否有值
   * @param {Cell.Searchbar} self Searchbar
   * @returns {Boolean}
   */
  var _checkValue = (self) => {
    let $btnEmpty = $(self._domNode).find(`.${BTN_EMPTY}`);
    if (self.getDisplayValue().length > 0) {
      $btnEmpty.css('display', 'inline-flex');
    } else {
      $btnEmpty.css('display', 'none');
    }
    return _isMatchPropose(self);
  };

  /**
   * 設置 form
   * @param {Cell.Searchbar} self Searchbar
   */
  var _setupForm = (self) => {
    let $domNode = $(self._domNode);
    $domNode.on('focusout', function (e) {
      $domNode.removeClass('focused');
      if (e.relatedTarget === this || e.target === $domNode.find('.cell-searchbar-form')[0]) {
        return;
      }
      _setMarkValue(self, true) || _setMatchValue(self, true) || (!self.options.matchPropose && _setValue(self, self.getDisplayValue(), self.getDisplayValue(), true));
      (self.options.onblur && self.options.onblur.call(self, self.getDisplayValue(), self.getValue()));
      if (self.options.completeClean === true) {
        _setValue(self, null, null);
      }
    }).on('focusin', function () {
      $domNode.addClass('focused');
      self.options.focusClean === true && _setValue(self, null, null);
    }).find('.' + FORM_DISPLAY_INPUT).off('focus').on('focus', function (event) {
      event.stopPropagation();
      event.preventDefault();
      $domNode.removeClass('using');
      $(this).select();
      if (self.options.onfocus && self.options.onfocus.call(self, event, self.getDisplayValue(), self.getValue()) === false) {
        return;
      }
      self.options.autoSearch === true && _search(self, true);
    }).on('input', function () {
      $domNode.find('.' + INPUT).val('');
      _checkValue(self);
      _search(self);
    }).on('keydown', function (evt) {
      if (evt.keyCode === 38) {
        _markPropose(self, -1);
      }
      if (evt.keyCode === 40) {
        _markPropose(self, 1);
      }
    }).on('keyup', function (evt) {
      if (evt.keyCode === 13) {
        return self.blur();
      }
      if (evt.keyCode === 27) {
        return self.reset();
      }
    }).on('valid', function () {
      _setValidation(self, true);
    }).on('invalid', function () {
      _setValidation(self, false);
    });
    $domNode.find('.' + INPUT).on('change', function (event, data) {
      _complete(self, data);
      self.options.onchange && self.options.onchange.call(self, self.getDisplayValue(), self.getValue(), data);
    });
    $domNode.find('.' + FORM).on('focus', function () {
      //不明原因，有會無法觸發focus，執行兩次可解決此問題
      $(self._domNode).find('.' + FORM_DISPLAY_INPUT).focus().focus();
    });
    $domNode.find('.' + BTN_EMPTY).on('focus, focusin', function (e) {
      e.stopPropagation();
    }).on('click', function () {
      self.reset(true);
    });
  };

  /**
   * 取得 pattern data
   * @param {Cell.Searchbar} self Searchbar
   */
  var _parsePattern = (self) => {
    if (!self.options.pattern) {
      return;
    }
    $(self.options.pattern).each(function (idx, pattern) {
      let keyword = pattern + ':';
      let regPattern = new RegExp(keyword + '[\\S]+', 'i');
      let value = self.getValue().match(regPattern);
      if (!value) {
        self.options.data[pattern] = undefined;
        return;
      }
      self.options.data[self.options.varName] = self.options.data[self.options.varName].replace(' ' + value, '').trim();
      self.options.data[pattern] = value.toString().replace(keyword, '').trim();
    });
    self.options.data[self.options.varName] = self.options.data[self.options.varName].trim().replace(' ', '|');
  };

  /**
   * 初始化搜尋 data、parse pattern
   * @param {Cell.Searchbar} self Searchbar
   */
  var _initQueryData = (self) => {
    self.options.data = self.options.data || {};
    self.options.data[self.options.varName] = self.getDisplayValue();
    self.options.data[self.options.valueName] = self.getValue();
    _parsePattern(self);
  };

  /**
   * 執行搜尋取得搜尋建議
   * @param {Cell.Searchbar} self Searchbar
   * @param {Boolean} anyway 無論如何都要搜尋
   * @param {Boolean} selectFirst 自動選擇第一個結果
   */
  var _search = (self, anyway = false, selectFirst = false) => {
    if (!self.options.searchUrl || (anyway !== true && self._lastDisplayValue === self.getDisplayValue())) {
      return;
    }
    self._lastDisplayValue = self.getDisplayValue();
    _initQueryData(self);
    self._xhr && self._xhr.abort();
    if (self.options.oninput && self.options.oninput.call(self, self.options.data) === false) {
      return;
    }
    let data = $.extend(self.options.searchData, self.options.data);
    if (data[self.options.varName] === '') {
      delete data[self.options.varName];
    }
    if (data[self.options.valueName] === '') {
      delete data[self.options.valueName];
    }
    self.resetPropose();
    self._xhr = $c.ajax.get({
      'url': self.options.searchUrl,
      'data': data,
      'success': function (proposes) {
        $(proposes).each(function (idx, propose) {
          self.addPropose(propose);
        });
        _checkPropose(self);
        self.renderPropose();
        selectFirst === true && _selectFirstPropose(self);
      }, 'error': function (e) {
      }
    });
  };
  /**
   * 選取第一個建議值
   * @param {Cell.Searchbar} self Searchbar
   */
  var _selectFirstPropose = (self) => {
    let $firstPropose = $(self._domNode).find(`.${SEARCH_PROPOSE} li:first-child`);
    if ($firstPropose.length === 1) {
      self.selectPropose($firstPropose, false);
    }
  };

  /**
   * 檢查是否有搜尋建議
   * @param {Cell.Searchbar} self Searchbar
   */
  var _checkPropose = (self) => {
    let $notFindMessager = $(self._domNode).find('.' + SEARCH_NOTFIND);
    let $emptyMessager = $(self._domNode).find('.' + SEARCH_EMPTY);
    $(self._domNode).find(`.${SEARCH_LOADER}`).hide();
    if ($(self._domNode).find('.cell-searchbar-propose li').length !== 0) {
      $emptyMessager.hide();
      $notFindMessager.hide();
      return;
    }
    if (self.getDisplayValue().length === 0) {
      $emptyMessager.show();
      $notFindMessager.hide();
    } else {
      $emptyMessager.hide();
      $notFindMessager.show();
    }
  };

  /**
   * 檢查是否至少符合一個條件
   * @param {Cell.Searchbar} self Searchbar
   */
  var _isMatchPropose = (self) => {
    if (!self.options.searchUrl || self.options.matchPropose === false) {
      return true;
    }
    let displayValue = self.getDisplayValue().replace('"', '\\\"');
    let fullMatchProposes = self._domNode.querySelectorAll(`li[${PROPOSE_LABEL}="${displayValue}" i], li[${PROPOSE_KEYWORD}="${displayValue}" i]`);
    if ((fullMatchProposes.length > 0 && displayValue.length > 0) || (self.options.required !== true && displayValue.length === 0)) {
      _setValidation(self, true);
      return true;
    }
    _setValidation(self, false);
    return false;
  };

  /**
   * 找到第一個符合的建議，並設為值
   * @param {Cell.Searchbar} self Searchbar
   * @param {Bool} change 
   */
  var _setMatchValue = (self, change = false) => {
    if (!self.options.searchUrl || self.options.matchPropose === false || self.getDisplayValue().length === 0) {
      return false;
    }
    let displayValue = self.getDisplayValue().replace('"', '\\\"');
    let matchProposes = self._domNode.querySelectorAll(`li[${PROPOSE_LABEL}*="${displayValue}" i], li[${PROPOSE_KEYWORD}*="${displayValue}" i]`);
    let fullMatchProposes = self._domNode.querySelectorAll(`li[${PROPOSE_LABEL}="${displayValue}" i], li[${PROPOSE_KEYWORD}="${displayValue}" i]`);
    if (fullMatchProposes.length !== 1 && matchProposes.length !== 1) {
      return false;
    }
    let $propose = $((fullMatchProposes.length === 1) ? fullMatchProposes : matchProposes);
    _setValue(self, $propose.attr(PROPOSE_LABEL), $propose.attr(PROPOSE_VALUE), change);
    return true;
  };
  /**
   * 設定選擇的值
   * @param {Cell.Searchbar} self Searchbar
   * @param {Bool} change 
   */
  var _setMarkValue = (self, change = false) => {
    let $proposes = $(self._domNode).find('.cell-searchbar-propose');
    let $hoverPropose = $proposes.find('li.hover');
    if ($hoverPropose.length === 0) {
      return false;
    }
    _setValue(self, $hoverPropose.attr(PROPOSE_LABEL), $hoverPropose.attr(PROPOSE_VALUE), change, $hoverPropose.data());
    return true;
  };

  /**
   * 選擇建議
   * @param {Cell.Searchbar} self Searchbar
   * @param {Number} position >1 往下, <1 往上
   */
  var _markPropose = (self, position) => {
    let $proposes = $(self._domNode).find('.cell-searchbar-propose');
    let $nowPropose = $proposes.find('li.hover').removeClass('hover');
    let $initPropose = (position > 0) ? $proposes.find('li:first-child') : $proposes.find('li:last-child');
    let $newPropose = ($nowPropose.length === 0) ? $initPropose : ((position > 0) ? $nowPropose.next() : $nowPropose.prev());
    if ($newPropose.length === 0) {
      $newPropose = $initPropose;
    }
    $newPropose.addClass('hover');
    let $parentNode = $proposes.scrollParent();
    let offest = 10;
    if ($newPropose.position().top < 0) {
      $parentNode.scrollTop($parentNode.scrollTop() + $newPropose.position().top);
    }
    if ($newPropose.position().top + $newPropose.height() + offest > $parentNode.height()) {
      $parentNode.scrollTop($parentNode.scrollTop() + $newPropose.position().top + $newPropose.height() + offest - $parentNode.height());
    }
  };

  /**
   * highlight keyword
   * @param {Cell.Searchbar} self Searchbar
   * @param {Element} element
   */
  var _highlightKeyword = (self, element) => {
    let $element = $(element);
    let keyword = self.getDisplayValue();
    if (!keyword) {
      return;
    }
    let pattern = new RegExp(`(${$c.pregQuote(keyword)})`, "gi");
    $element.html($element.html().replace(pattern, '<span class="highlight">$1</span>'));
  };

  /**
   * 完成搜尋
   * @param {Cell.Searchbar} self Searchbar
   * @param {Object} proposeData
   */
  var _complete = (self, proposeData) => {
    if (!_isMatchPropose(self) || !self.options.oncomplete || (!self.options.searchUrl && self._lastDisplayValue === self.getDisplayValue())) {
      return;
    }
    self._lastDisplayValue = self.getDisplayValue();
    _initQueryData(self);
    self.options.oncomplete.call(self, self.options.data, proposeData);
    if (self.options.completeClean === true) {
      _setValue(self, null, null);
      //_search(self, true);
    }
    if (self.options.changeUrl === true) {
      let url = $c.setUrlParam(window.location.pathname + window.location.search, self.options.varName, encodeURIComponent(self.options.data[self.options.varName]) || null);
      $c.pushHistory(url + window.location.hash);
    }
  };

  /**
   * 設定表單驗證
   * @param {Cell.Searchbar} self Searchbar
   * @param {bool} pass
   */
  var _setValidation = (self, pass) => {
    let $form = $(self._domNode).find('.' + FORM);
    let displayInput = $(self._domNode).find('.' + FORM_DISPLAY_INPUT)[0];
    if (pass === true) {
      $form.removeClass('invalid').addClass('valid');
      displayInput.setCustomValidity('');
    } else {
      $form.removeClass('valid').addClass('invalid');
      displayInput.setCustomValidity('error');
    }
    return self;
  };

  /**
   * @typedef {Object} Cell.Searchbar.Propose 也可以自己定義更多的內容
   * @param {string} value 值 (required)
   * @param {string} [label] 標籤
   */
  /**
   * @callback Cell.Searchbar.oninput
   * @param {Object} data 目前的查詢資料
   */
  /**
   * @callback Cell.Searchbar.onchange
   * @param {String} displayValue 目前標籤
   * @param {String} value 目前值
   */
  /**
   * @callback Cell.Searchbar.onblur
   * @param {String} displayValue 目前標籤
   * @param {String} value 目前值
   */
  /**
   * @callback Cell.Searchbar.onfocus
   * @param {Object} event event
   * @param {String} displayValue 目前標籤
   * @param {String} value 目前值
   */
  /**
   * @callback Cell.Searchbar.oncomplete
   * @param {String} value 目前值
   * @param {String} displayValue 目前標籤
   * @param {Object} data 目前的查詢資料
   */
  /**
   * @callback Cell.Searchbar.formatter
   * @param {Element} item 建議的節點
   * @param {Object} propose 建議
   */
  /**
   * Cell.Searchbar. 
   * @param {Object} options 選項
   * dom
   * @param {Selector} [options.replaceTo] 建立在已存在的節點
   * @param {Selector} [options.appendTo] 放在已存在的節點之下
   * icon
   * @param {String} [options.faicon='fa-search'] font awesome icon (false時取消顯示icon)
   * display input
   * @param {String} [options.placeholder] placeholder in HTML
   * @param {String} [options.displayValue] default value of display input
   * @param {String} [options.displayName] name of display input
   * @param {Cell.Searchbar.oninput} [options.oninput] 輸入時的 handler
   * @param {Cell.Searchbar.onchange} [options.onchange] 輸入時的 handler
   * @param {Cell.Searchbar.onfocus} [options.onchange] focus的 handler
   * @param {Boolean} [options.autofocus=false] 是否自動foucs
   * @param {Boolean} [options.focusClean=false] focus後是否清除值 (不會觸發change)
   * @param {Boolean} [options.required] 是否必填
   * form input
   * @param {String} [options.name] name of input
   * @param {String} [options.value] default value of input
   * search
   * @param {String} [options.searchUrl] 建議來源 從此URL取得搜尋建議
   * @param {String} [options.varName='q'] 變數名稱 使用者在input上輸入的值，會以這個變數名稱傳送到後端
   * @param {Array<String>} [options.pattern] 特徵 用於分割關鍵字
   * @param {Object} [options.searchData] 搜尋建議時送到後端的資料
   * @param {String} [options.emptyMessage] 當輸入框為空、搜尋結果為零時的提示訊息
   * @param {String} [options.notFindMessage] 當搜尋結果為零時的提示訊息
   * @param {Boolean} [options.autoFristPropose] 自動選取搜尋結果的第一個結果
   * propose
   * @param {Boolean} [options.autoSearch=false] 當 focus input 時是否立即顯示建議
   * @param {String} [options.labelName] 做為 Label 的欄位名稱
   * @param {String} [options.valueName] 做為 Value 的欄位名稱
   * @param {Cell.Searchbar.formatter} [options.formatter] 格式化搜尋建議
   * complete
   * @param {Cell.Searchbar.oncomplete} [options.oncomplete] 送出時的 handler
   * @param {Boolean} [options.changeUrl=false] 是否改變網址
   * @param {Object} [options.data] 完成時送到後端的資料
   * @param {Boolean} [options.matchPropose=true] 一定要符合至少一個搜尋結果，否則不執行 (只有在有提供建議時有效)
   * @param {Boolean} [options.completeClean=false] 完成後清空
   * @memberOf Cell
   * @namespace Searchbar
   * @class Cell.Searchbar
   * @author Lruihao
   */
  function Searchbar(options) {
    var _proto = Searchbar.prototype;
    this.options = options || {};
    this.options.valueName = this.options.valueName || 'value';
    this.options.labelName = this.options.labelName || 'label';
    this.options.varName = this.options.varName || 'q';
    this._lastDisplayValue = '';
    this._domNode = _createDom(this);
    _createDomForm(this);
    _createDomPropose(this);
    _setupForm(this);
    this._xhr = null;

    /**
     * 取得輸入值
     * @returns {String}
     * @name Cell.Searchbar#getValue
     * @function
     */
    _proto.getValue = function () {
      return $(this._domNode).find('.' + INPUT).val();
    };

    /**
     * 取得顯示值
     * @returns {String}
     * @name Cell.Searchbar#getDisplayValue
     * @function
     */
    _proto.getDisplayValue = function () {
      return $(this._domNode).find('.' + FORM_DISPLAY_INPUT).val();
    };

    /**
     * 修改值
     * @param {Object} propose 需符合建議
     * @returns {Cell.Searchbar}
     * @name Cell.Searchbar#setValue
     * @function
     */
    _proto.setValue = function (propose) {
      _setDefaultValue(this, propose);
      return this;
    };

    /**
     * 搜尋建議
     * @param {Bool} [selectFirst=true] 自動選擇第一個建議
     * @returns {Cell.Searchbar}
     * @name Cell.Searchbar#search
     * @function
     */
    _proto.search = function (selectFirst = true) {
      _search(this, true, selectFirst);
      return this;
    };

    /**
     * 選擇建議<br/>
     * 如果上層沒有 form，就 blur<br/>
     * 如果上層有 form，且有下一個 input 就 foucs 到下一個 input，否則 blur 
     * @param {Element} propose
     * @param {Bool} [triggerEnter=true] 是否觸發Enter
     * @returns {Cell.Searchbar}
     * @name Cell.Searchbar#selectPropose
     * @function
     */
    _proto.selectPropose = function (propose, triggerEnter = true) {
      $(propose).addClass('hover');
      let $domNode = $(this._domNode);
      if (triggerEnter === true) {
        $domNode.find(`.${FORM_DISPLAY_INPUT}`).trigger($.Event('keyup', {'keyCode': 13}));
      } else {
        $domNode.trigger('focusout');
      }
      return this;
    };

    /**
     * 增加搜尋建議
     * @param {Cell.Searchbar.Propose} propose 建議
     * @returns {Cell.Searchbar}
     * @name Cell.Searchbar#addPropose
     * @function
     */
    _proto.addPropose = function (propose) {
      let self = this;
      let divPropose = document.createElement('li');
      let $divPropose = $(divPropose);
      $divPropose.appendTo($(this._domNode).find('.' + SEARCH_PROPOSE))
              .attr(PROPOSE_LABEL, propose[self.options.labelName])
              .attr(PROPOSE_VALUE, propose[self.options.valueName])
              .attr(PROPOSE_KEYWORD, propose.keyword || null)
              .data(propose)
              .on('click', function () {
                self.selectPropose(this);
              });
      if (this.options.formatter) {
        this.options.formatter.call(this, divPropose, propose);
      } else {
        $divPropose.html(propose[self.options.labelName]);
      }
      let $children = $divPropose.children();
      if ($children.length === 0) {
        _highlightKeyword(self, $divPropose);
      } else {
        $.each($children, (idx, element) => {
          _highlightKeyword(self, element);
        });
      }
      return this;
    };

    /**
     * 重置搜尋建議
     * @returns {Cell.Searchbar}
     * @name Cell.Searchbar#resetPropose
     * @function
     */
    _proto.resetPropose = function () {
      $(this._domNode).find(`.${SEARCH_PROPOSE}`).empty();
      $(this._domNode).find(`.${SEARCH_LOADER}`).show();
      $(this._domNode).find(`.${SEARCH_EMPTY}`).hide();
      $(this._domNode).find(`.${SEARCH_NOTFIND}`).hide();
      return this;
    };

    /**
     * 重新排配建議位置
     * @returns {Cell.Searchbar}
     * @name Cell.Searchbar#resetPropose
     * @function
     */
    _proto.renderPropose = function () {
      let $domNode = $(this._domNode);
      let $proposeNode = $(this._domNode).find('.' + SEARCH_RESULT);
      if ($domNode.scrollParent().height() - $domNode.position().top - $domNode.outerHeight() - 100 < $proposeNode.height()) {
        $proposeNode.css({
          'bottom': $(this._domNode).find('.' + FORM).outerHeight(),
          'top': ''
        });
      } else {
        $proposeNode.css({
          'bottom': '',
          'top': $(this._domNode).find('.' + FORM).outerHeight()
        });
      }
      return this;
    };

    /**
     * 重置
     * @param {Boolean} doComplete 是否執行完成事件
     * @returns {Cell.Searchbar}
     * @name Cell.Searchbar#reset
     * @function
     */
    _proto.reset = function (doComplete) {
      this.resetPropose();
      _setValue(this, null, null, true);
      doComplete === true && _complete(this);
      $(this._domNode).find('.' + FORM_DISPLAY_INPUT).focus();
      return this;
    };

    /**
     * 完成
     * @returns {Cell.Searchbar}
     * @name Cell.Searchbar#complete
     * @function
     */
    _proto.complete = function () {
      _complete(this);
      return this;
    };
    /**
     * 設定搜尋URL
     * @param {string} url
     * @returns {Cell.Searchbar}
     * @name Cell.Searchbar#setSearchUrl
     * @function
     */
    _proto.setSearchUrl = function (url) {
      this.options.searchUrl = url;
      return this;
    };
    /**
     * 設定搜尋資料
     * @param {Object} data
     * @returns {Cell.Searchbar}
     * @name Cell.Searchbar#setSearchData
     * @function
     */
    _proto.setSearchData = function (data) {
      if (this.options.searchData) {
        $.extend(this.options.searchData, data);
      } else {
        this.options.searchData = data;
      }
      return this;
    };

    /**
     * 設定是否必填
     * @param {Bool} required
     * @returns {Cell.Searchbar}
     * @name Cell.Searchbar#setRequired
     * @function
     */
    _proto.setRequired = function (required) {
      this.options.required = required;
      if (this.options.required === true) {
        $(this._domNode).find('.' + FORM_DISPLAY_INPUT).attr('required', true);
      } else {
        $(this._domNode).find('.' + FORM_DISPLAY_INPUT).removeAttr('required');
      }
      _setValidation(this, true);
      return this;
    };

    /**
     * blur
     * @returns {Cell.Searchbar}
     * @name Cell.Searchbar#blur
     * @function
     */
    _proto.blur = function () {
      $(this._domNode).blur();
      return this;
    };

    /**
     * focus
     * @returns {Cell.Searchbar}
     * @name Cell.Searchbar#focus
     * @function
     */
    _proto.focus = function () {
      $(this._domNode).find('.' + FORM_DISPLAY_INPUT).focus();
      return this;
    };
    if (this.options.displayValue || this.options.value) {
      _setValue(this, this.options.displayValue, this.options.value, false);
      this._lastDisplayValue = this.options.displayValue;
    }
  }
  return Searchbar;
}();

Cell.Filter = function Filter() {
  /**
   * 建立元素
   * @param {Selector} [parent='.cell-main-container'] 父節點
   * @param {Selector} replaceTo 取代節點
   * @returns {Element}
   */
  var _createElement = (parent = '.cell-main-container', replaceTo) => {
    let filter;
    if (replaceTo) {
      filter = $(replaceTo).attr('class', '');
    } else {
      filter = document.createElement('div');
      $(filter).appendTo(parent);
    }
    $(filter).attr('tabindex', '1').addClass('cell-filter');
    let btn = document.createElement('div');
    $(btn).appendTo(filter)
            .addClass('cell-filter-btn');
    $(document.createElement('span')).appendTo(btn)
            .addClass('cell-filter-label');
    $(document.createElement('span')).appendTo(btn)
            .addClass('cell-filter-value');
    return filter;
  };

  /**
   * 取得選項
   * @param {Cell.Filter} filter filter
   */
  var _getOptions = (filter) => {
    if (!filter.options.url && filter.options.option) {
      _renderFilter(filter);
      return filter;
    }
    $c.ajax.get({
      'url': filter.options.url,
      'success': function (option) {
        filter.options.option = option;
        _renderFilter(filter);
      }
    });
    return filter;
  };

  /**
   * 初始化按鈕
   * @param {Cell.Filter} filter filter
   * @returns {Cell.Filter}
   */
  var _renderFilter = (filter) => {
    _createOption(filter);
    $(filter._label).html(filter.options.label);
    $(filter._value).html(filter.getItemLabel(filter.options.default));
    if (filter.options.changeUrl === true && filter.options.default) {
      let url = $c.setUrlParam(window.location.pathname + window.location.search, filter.options.name, filter.options.default)
              + window.location.hash;
      window.history.replaceState({
        'url': url
      }, null, url);
    }
    return filter;
  };

  /**
   * 建立選項節點
   * @param {Cell.Filter} filter filter
   */
  var _createOption = (filter) => {
    let divOptions = document.createElement('div');
    $(divOptions).appendTo(filter._filter)
            .addClass('cell-filter-option');
    $.each(filter.options.option, function (value, label) {
      _createItem(divOptions, filter.options.name, label, value);
    });
    _setupItem(filter);
    return filter;
  };

  /**
   * 建立選項中的 Item
   * @param {Element} options 選項節點
   * @param {String} name 參數名稱
   * @param {String} label 標籤
   * @param {String} value 值
   */
  var _createItem = (options, name, label, value) => {
    name = name.toString().replace(/_/g, '-');
    $(document.createElement('div'))
            .appendTo(options)
            .addClass('cell-filter-item')
            .addClass(value !== 'null' ? `${name}-${value}` : name)
            .html(String(label).toString().trim())
            .attr('value', value !== 'null' ? value : '');
  };

  /**
   * 初始化Item
   * @param {Cell.Filter} filter filter
   * @returns {Cell.Filter}
   */
  var _setupItem = (filter) => {
    $(filter._filter).find('.cell-filter-item').on('click', function () {
      filter.selectItem(this);
    });
    return filter;
  };
  /**
   * @callback Cell.Filter.onchange
   * @param {Element} item 選擇的 Item
   * @param {String} value 選擇的值
   */
  /**
   * Cell.Filter. updated on 2020/12/11.<br/>
   * @param {Object} options 選項
   * @param {Selector} [options.replaceTo] 建立在已存在的節點
   * @param {Selector} [options.appendTo] 放在已存在的節點之下
   * @param {Cell.Filter.onchange} [options.onchange] 值改變時的 handler
   * @param {String} [options.label] 標籤名稱
   * @param {String} [options.name='f'] 參數名稱
   * @param {Boolean} [options.changeUrl=false] 是否改變網址
   * @param {String} [options.default=null] 預設值
   * @param {String} [options.url] 選項來源 (回傳的格式與options相同)
   * @param {Object} [options.option] 選項
   * @memberOf Cell
   * @namespace Filter
   * @class Cell.Filter
   * @author Lruihao
   */
  function Filter(options) {
    var _proto = Filter.prototype;
    this.options = options || {};
    this.options.name = this.options.name || 'f';
    this.options.default = this.options.default || null;
    this._filter = _createElement(this.options.appendTo, this.options.replaceTo);
    this._label = $(this._filter).find('.cell-filter-label');
    this._value = $(this._filter).find('.cell-filter-value');
    this.value = null;

    /**
     * 取得 Item 的Label
     * @param {String} value 值
     * @returns {String}
     * @name Cell.Filter#getItemLabel
     * @function
     */
    _proto.getItemLabel = function (value) {
      if (value === 'null' || value === null) {
        return $(this._filter).find(`.cell-filter-item.${this.options.name.toString().replace(/_/g, '-')}`).html();
      }
      return $(this._filter).find(`[value="${value}"]`).html();
    };

    /**
     * 選擇 Item
     * @param {Element} item item
     * @returns {Cell.Filter}
     * @name Cell.Filter#selectItem
     * @function
     */
    _proto.selectItem = function (item) {
      let newValue = $(item).attr('value');
      if (this.value !== newValue) {
        this.value = newValue;
        $(this._value).html($(item).html());
        if (this.options.changeUrl === true) {
          let url = $c.setUrlParam(window.location.pathname + window.location.search, this.options.name, newValue || null);
          $c.pushHistory(url + window.location.hash);
        }
        this.options.onchange.call(this, item, this.value);
      }
      $(this._filter).blur();
      return this;
    };

    _getOptions(this);
  }
  return Filter;
}();

Cell.Uploader = function Uploader() {
  /**
   * 建立Dom
   * @param {Uploader} uploader
   */
  var _createDom = (uploader) => {
    if (uploader.options.replaceTo) {
      uploader._domNode = $(uploader.options.replaceTo);
    } else {
      uploader._domNode = document.createElement('div');
      $(uploader._domNode).appendTo(uploader.options.appendTo || document.querySelector('.cell-main-container') || document.body);
    }
    $(uploader._domNode).addClass('cell-uploader').addClass(uploader.options.className || '');
    uploader.options.dragPanel = uploader.options.dragPanel || uploader._domNode;
    uploader._idx = $('.cell-uploader').length;
    if (Array.isArray(uploader.options.accept)) {
      uploader.options.accept = `.${uploader.options.accept.join(',.')}`;
    }
    let input = document.createElement('input');
    $(input).appendTo(uploader._domNode)
            .addClass('cell-uploader-input')
            .attr('id', 'cell-uploader-input' + uploader._idx)
            .attr('type', 'file')
            .attr('accept', uploader.options.accept || null)
            .on('change', function (e) {
              uploader._droppedFiles = e.target.files;
              _upload(uploader);
            });
    if (uploader.options.multiple === true) {
      $(input).attr('multiple', true);
    }
    _getFileType(uploader);
    let label = document.createElement('label');
    $(label).appendTo(uploader._domNode)
            .attr('for', 'cell-uploader-input' + uploader._idx)
            .addClass('cell-uploader-label');
    $(document.createElement('strong')).appendTo(label)
            .addClass('cell-uploader-strong')
            .html(uploader.options.label || 'Choose a file');
    $(document.createElement('span')).appendTo(label)
            .addClass('cell-uploader-span')
            .html(uploader.options.dragLabel || 'or drop file to here.');
    $(document.createElement('span')).appendTo(label)
            .addClass('cell-uploader-filetype')
            .addClass('brackets');
    _createMessageDom(uploader);
    _createToolbarDom(uploader);
    _createListDom(uploader);
  };

  /**
   * 建立拖曳訊息框
   * @param {Uploader} uploader
   */
  var _createMessageDom = (uploader) => {
    $(uploader.options.dragPanel).addClass('cell-uploader-drag-panel');
    $(document.createElement('div')).appendTo(uploader.options.dragPanel)
            .addClass('cell-uploader-dragover-message')
            .html(uploader.options.dragMessage || 'Drop files here to upload.');
  };

  /**
   * 建立Toolbar
   * @param {Uploader} uploader
   */
  var _createToolbarDom = (uploader) => {
    if (uploader.options.disableRemove === true) {
      return;
    }
    let divTb = document.createElement('div');
    $(divTb).appendTo(uploader._domNode)
            .addClass('cell-grid-toolbar');
    let divTbR = document.createElement('div');
    $(divTbR).appendTo(divTb)
            .addClass('float-right');
    let btnTrash = document.createElement('span');
    $(btnTrash).appendTo(divTbR)
            .addClass('cell-btn-circle btn-remove-file d-none')
            .attr('data-toggle', 'tooltip')
            .attr('title', 'Delete file')
            .on('click', function () {
              _removeFile(uploader);
            }).tooltip();
    $(document.createElement('i')).appendTo(btnTrash)
            .addClass('fa fa-trash-alt');
  };

  /**
   * 建立清單
   * @param {Uploader} uploader
   */
  var _createListDom = (uploader) => {
    uploader.list = new Cell.Grid({
      'appendTo': uploader._domNode,
      'url': uploader.options.url,
      'query': uploader.options.query,
      'headerSticky': false,
      'identify': 'displayId',
      'selector': true,
      'fields': [{
          'name': 'displayId',
          'hidden': true
        }, {
          'name': 'id',
          'hidden': true
        }, {
          'name': 'size',
          'hidden': true
        }, {
          'name': 'name',
          'label': 'File',
          'formatter': function (item, col, name) {
            if (uploader.options.displaySize !== true) {
              return name;
            }
            let div = document.createElement('div');
            $(div).appendTo(col);
            $(document.createElement('span')).appendTo(div)
                    .html(name);
            $(document.createElement('span')).appendTo(div)
                    .addClass('size')
                    .html($c.file.formatBytes(this.getItemData(item, 'size')));
          }
        }, {
          'name': 'message',
          'label': 'Status',
          'formatter': function (item, col, status) {
            if (!status) {
              return;
            }
            let fileId = this.getItemData(item, 'id');
            $(col).html(status.message || _getErrMsg(status.code));
            $(col).removeClass('uploading');
            if (Number(status.code) > -1) {
              $(col).addClass('status-' + status.code);
            }
            if (status.code === 0 && fileId) {
              $(document.createElement('input'))
                      .appendTo(col)
                      .attr('type', 'hidden')
                      .attr('name', uploader.options.name + '[]')
                      .val(fileId);
            }
          }
        }],
      'emptyMessage': uploader.options.emptyMessage || 'No files.',
      'onselected': function (item) {
        $(uploader._domNode).find('.cell-grid-toolbar .cell-btn-circle')
                .toggleClass('d-none', !item.length);
      },
      'onload': function () {
        if (!uploader.options.multiple && this.getItemCount() > 1) {
          this.removeItems(this.getItemId(this.getFirstItem()));
        }
      }
    });
  };

  /**
   * 設置拖拉區
   * @param {Uploader} uploader
   */
  var _setupDragPanel = (uploader) => {
    $(uploader.options.dragPanel).on('drag dragstart dragend dragover dragenter dragleave drop', function (e) {
      e.preventDefault();
      e.stopPropagation();
    }).on('dragenter', function () {
      $(this).addClass('cell-uploader-dragover');
      uploader._dragCounter++;
    }).on('dragleave', function () {
      uploader._dragCounter--;
      if (uploader._dragCounter === 0) {
        $(this).removeClass('cell-uploader-dragover');
      }
    }).on('drop', function (e) {
      (uploader.options.clearOnDrag === true) && uploader.reload();
      uploader._dragCounter = 0;
      $(this).removeClass('cell-uploader-dragover');
      uploader._droppedFiles = e.originalEvent.dataTransfer.files;
      _upload(uploader);
    });
  };

  /**
   * 取得可以上傳的檔案類型
   * @param {Uploader} uploader
   */
  var _getFileType = (uploader) => {
    $c.ajax.get({
      'url': uploader.options.fileTypeUrl || $c.router('//file_manager/extensions'),
      'success': function (response) {
        $('#cell-uploader-input' + uploader._idx)
                .attr('accept', uploader.options.accept
                        ? `${uploader.options.accept},${response.types}`
                        : response.types);
        uploader.options.fileType = response.exts;
        if (Array.isArray(uploader.options.fileType)) {
          $(uploader._domNode).find('.cell-uploader-filetype').html(uploader.options.fileType.join(', '));
        }
      }
    });
  };

  /**
   * 上傳檔案
   * @param {Uploader} self
   */
  var _upload = (self) => {
    let ajaxData = new FormData(self.options.data);
    if (!self._droppedFiles) {
      return;
    }
    if (self.options.multiple !== true) {
      self.reload();
      self._droppedFiles = [self._droppedFiles[0]];
    }
    let dataIds = [];
    $.each(self._droppedFiles, (i, file) => {
      let displayId = self.list.addItem({
        'id': null,
        'name': file.name,
        'size': file.size
      }, true);
      dataIds.push(displayId);
      ajaxData.append('display_ids[]', displayId);
      ajaxData.append('files[]', file);
    });
    $c.ajax.post({
      'url': self.options.uploadUrl,
      'data': ajaxData,
      'cache': false,
      'contentType': false,
      'processData': false,
      'xhr': function () {
        $(self._domNode).find(`.cell-uploader-input`).val(null);
        let myXhr = $.ajaxSettings.xhr();
        if (myXhr.upload) {
          myXhr.upload.addEventListener('progress', function (e) {
            if (e.lengthComputable) {
              var Percentage = ((e.loaded * 100) / e.total).toFixed(2);
              self.list.setItemColVal(dataIds, 'message', {
                'code': -1,
                'message': '上傳中 (' + Percentage + '%)'
              });
            }
          }, false);
        }
        return myXhr;
      }, 'success': function (response) {
        $.each(response, function (displayId, result) {
          self.list.setItemColVal(displayId, 'id', result.id || null);
          self.list.setItemColVal(displayId, 'message', {
            'code': result.err_code,
            'message': result.message
          });
        });
        if (response.length === 0) {
          $.each(dataIds, function (idx, displayId) {
            self.list.setItemColVal(displayId, 'message', {
              'code': 99,
              'message': '不明的錯誤，請檢查伺服器設定'
            });
          });
        }
        (self.options.onuploaded && self.options.onuploaded.call(self, response));
      }
    });
  };

  /**
   * 取得錯誤訊息
   * @param {int} code error code
   * @returns {String}
   */
  var _getErrMsg = (code) => {
    switch (code) {
      case 0:
        return '上傳完成';
      case 1:
        return '上傳失敗：檔案大小超出限制 ' + code;
      case 2:
        return '上傳失敗：檔案大小超出限制 ' + code;
      case 8:
        return '上傳失敗：不允許的檔案類型';
      case 9:
        return '上傳失敗：' + code;
      default:
        return '上傳失敗：' + code;
    }
  };

  /**
   * 移除檔案
   * @param {Uploader} uploader
   */
  var _removeFile = (uploader) => {
    let displayIds = uploader.list.getSelectionVal('displayId');
    let ids = uploader.list.getSelectionVal('id');
    if (ids.length === 0) {
      uploader.list.removeItems(displayIds);
      return this;
    }
    $c.ajax.delete({
      'url': uploader.options.removeUrl,
      'data': {
        'ids': ids
      }, 'success': function () {
        uploader.list.removeItems(displayIds);
      }
    });
    return this;
  };
  /**
   * @callback Cell.Uploader.onuploaded
   * @param {Object} response 後臺回傳的訊息
   */

  /**
   * Cell.Uploader. 
   * @param {Object} options 選項
   * @param {String} [options.replaceTo] 取代到
   * @param {String} [options.appendTo=document.body] 添加到某個節點下
   * @param {String} [options.className] DOM Class name
   * @param {String} [options.label] 上傳檔案的訊息
   * @param {String} [options.dragLabel] 拖移檔案到此的訊息
   * @param {String} [options.dragPanel] 可拖移的節點
   * @param {String} [options.dragMessage] 拖移時提示訊息
   * @param {String} [options.clearOnDrag] 拖移前清空表單
   * @param {String} [options.name='files'] 變數名稱
   * @param {Bool} [options.multiple='false'] 是否允許多選檔案
   * @param {String} [options.url] 取得已存在的檔案URL
   * @param {Object} [options.query] 預設查詢
   * @param {String} [options.uploadUrl] 檔案上傳處理URL
   * @param {String} [options.disableRemove] 刪除檔案處理URL
   * @param {String} [options.removeUrl] 刪除檔案處理URL
   * @param {String} [options.emptyMessage] grid 為空時的提示訊息
   * @param {String} [options.fileTypeUrl] 取得允許上傳的副檔名URL
   * @param {Bool} [options.displaySize=false] 是否顯示檔案大小
   * @param {Cell.Uploader.onuploaded} [options.onuploaded] 檔案上傳完成時
   * @memberOf Cell
   * @namespace Uploader
   * @class Cell.Uploader
   * @author Lruihao
   * @version 1.0.0
   */
  function Uploader(options) {
    var _proto = Uploader.prototype;
    this.options = options || {};
    this._dragCounter = 0;
    this.options.name = this.options.name || 'files';
    _createDom(this);
    _setupDragPanel(this);
    /**
     * 重新載入
     * @name Cell.Uploader#reload
     * @function
     */
    _proto.reload = function () {
      this.options.multiple ? this.list.reload() : this.list.reset();
    };
  }
  return Uploader;
}();

Cell.SingleUploader = function SingleUploader() {
  /**
   * 建立Dom
   * @param {Uploader} uploader
   */
  var _createDom = (uploader) => {
    if (uploader.options.replaceTo) {
      uploader._domNode = $(uploader.options.replaceTo);
    } else {
      uploader._domNode = document.createElement('div');
      $(uploader._domNode).appendTo(uploader.options.appendTo || document.querySelector('.cell-main-container') || document.body);
    }
    let input = document.createElement('input');
    if (Array.isArray(uploader.options.accept)) {
      uploader.options.accept = `.${uploader.options.accept.join(',.')}`;
    }
    $(input).appendTo(uploader._domNode)
            .addClass('cell-single-uploader-input')
            .addClass('form-control-file')
            .attr('type', 'file')
            .attr('accept', uploader.options.accept || null)
            .on('change', function (e) {
              uploader._droppedFiles = e.target.files;
              _upload(uploader);
            });
    _getFileType(uploader);
    let $divToolbar = $(document.createElement('div')).appendTo(uploader._domNode);
    $(document.createElement('span')).appendTo($divToolbar)
            .addClass('cell-single-uploader-info text-info');
    $(document.createElement('small')).appendTo($divToolbar)
            .addClass('cell-single-uploader-label')
            .html(uploader.options.label);
    $(document.createElement('small')).appendTo($divToolbar)
            .addClass('text-muted cell-uploader-filetype')
            .addClass('brackets');
  };

  /**
   * 取得可以上傳的檔案類型
   * @param {Uploader} uploader
   */
  var _getFileType = (uploader) => {
    $c.ajax.get({
      'url': uploader.options.fileTypeUrl || $c.router('//file_manager/extensions'),
      'success': function (response) {
        $(uploader._domNode).find('input')
                .attr('accept', uploader.options.accept
                        ? `${uploader.options.accept},${response.types}`
                        : response.types);
        uploader.options.fileType = response.exts;
        if (Array.isArray(uploader.options.fileType)) {
          $(uploader._domNode).find('.cell-uploader-filetype').html(uploader.options.fileType.join(', '));
        }
      }
    });
  };

  /**
   * 上傳檔案
   * @param {Uploader} self
   */
  var _upload = (self) => {
    let ajaxData = new FormData(self.options.data);
    if (!self._droppedFiles) {
      return;
    }
    ajaxData.append('file', self._droppedFiles[0]);
    $c.ajax.post({
      'url': self.options.uploadUrl,
      'data': ajaxData,
      'cache': false,
      'contentType': false,
      'processData': false,
      'xhr': function () {
        $(self._domNode).find(`.cell-single-uploader-input`).val(null);
        let myXhr = $.ajaxSettings.xhr();
        if (myXhr.upload) {
          myXhr.upload.addEventListener('progress', function (e) {
            if (e.lengthComputable) {
              var Percentage = ((e.loaded * 100) / e.total).toFixed(2);
              $(self._domNode).find(`.cell-single-uploader-info`).html('Uploading...' + Percentage + '%');
            }
          }, false);
        }
        return myXhr;
      }, 'success': function (response) {
        if (!response) {
          self.setInfo('不明的錯誤，請檢查伺服器設定');
        }
        if (response.code === 0) {
          self.setInfo('Success!');
          (self.options.onuploaded && self.options.onuploaded.call(self, response));
        } else {
          self.setInfo(_getErrMsg(response.code));
        }
      }
    });
  };

  /**
   * 取得錯誤訊息
   * @param {int} code error code
   * @returns {String}
   */
  var _getErrMsg = (code) => {
    switch (code) {
      case 0:
        return '上傳完成';
      case 1:
        return '上傳失敗：檔案大小超出限制 ' + code;
      case 2:
        return '上傳失敗：檔案大小超出限制 ' + code;
      case 8:
        return '上傳失敗：不允許的檔案類型';
      case 9:
        return '上傳失敗：' + code;
      default:
        return '上傳失敗：' + code;
    }
  };

  /**
   * @callback Cell.SingleUploader.onuploaded
   * @param {Object} response 後臺回傳的訊息
   */

  /**
   * Cell.SingleUploader. 
   * @param {Object} options 選項
   * @param {String} [options.replaceTo] 取代到
   * @param {String} [options.appendTo=document.body] 添加到某個節點下
   * @param {String} [options.className] DOM Class name
   * @param {String} [options.label] 上傳檔案的訊息
   * @param {String} [options.name='files'] 變數名稱
   * @param {String} [options.url] 取得已存在的檔案URL
   * @param {Object} [options.query] 預設查詢
   * @param {String} [options.uploadUrl] 檔案上傳處理URL
   * @param {String} [options.fileTypeUrl] 取得允許上傳的副檔名URL
   * @param {Cell.Uploader.onuploaded} [options.onuploaded] 檔案上傳完成時
   * @memberOf Cell
   * @namespace SingleUploader
   * @class Cell.SingleUploader
   * @author Lruihao
   * @version 1.0.0
   */
  function SingleUploader(options) {
    var _proto = SingleUploader.prototype;
    this.options = options || {};
    this.options.name = this.options.name || 'files';
    _createDom(this);

    /**
     * 設定訊息
     * @name Cell.SingleUploader#setInfo
     * @param {String} msg 訊息
     * @function
     */
    _proto.setInfo = function (msg) {
      $(this._domNode).find(`.cell-single-uploader-info`).html(msg);
    };

  }
  return SingleUploader;
}();

$().ready(() => {
  $c.confirm = new Cell.Confirm();
  $c.message = new Cell.Message();
  $c.tooltip = new Cell.Tooltip();
});


