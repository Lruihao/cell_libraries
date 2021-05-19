/* global Cell, $c */

Cell.Grid = function Grid() {
  /**
   * 建立 Grid 元素
   * @param {Cell.Grid} self grid
   */
  var _createElement = (self) => {
    let grid = undefined;
    if (self.options.replaceTo) {
      grid = $(self.options.replaceTo);
    } else {
      grid = document.createElement('div');
      $(grid).appendTo(self.options.appendTo || '.cell-main-container');
    }
    $(grid).addClass('cell-grid')
            .attr({
              'id': self.options.id || null,
              'tabindex': 0
            })
            .on('keydown', function (event) {
              // CTRL + A 全選所有的 items
              if (event.ctrlKey && event.keyCode === 65) {
                self.selectAll();
                event.preventDefault();
              }
            });
    self._domNode = grid;
    if (self.options.header !== false) {
      $(grid).addClass('border');
    }
  };

  /**
   * 建立 grid header
   * @param {Cell.Grid} self grid
   */
  var _createHeader = (self) => {
    if (self.options.header === false) {
      return;
    }
    let header = document.createElement('div');
    $(header).appendTo(self._domNode)
            .addClass('cell-grid-header');
    if (self.options.headerSticky !== false) {
      $(header).addClass('position-sticky');
    }
    let table = document.createElement('table');
    $(table).appendTo(header)
            .addClass('cell-grid-header-table');
    let tr = document.createElement('tr');
    $(tr).appendTo(table).addClass('cell-grid-row');
    $(self.options.fields).each(function (idx, col) {
      _createHeaderField(tr, col);
    });
    $(header).find('.cell-grid-row-selector').on('click', function () {
      self.selectAll();
    });
    return header;
  };

  /**
   * 建立 grid 表頭欄位
   * @param {Element} tr
   * @param {Object} col 欄位設定
   */
  var _createHeaderField = (tr, col) => {
    if (col.hidden === true) {
      return;
    }
    let field = document.createElement('th');
    $(field).appendTo(tr)
            .attr('data-field-name', col.name)
            .addClass('cell-grid-col')
            .addClass(col.name.toString().replace(/_/g, '-'))
            .addClass(col.className)
            .html((col.label || null));
    if (col.sortable === true) {
      _createSorter(field);
    }
  };

  /**
   * 建立排序欄位
   * @param {Element} field 欄位元素
   */
  var _createSorter = (field) => {
    $(field).addClass("sortable")
            .on('selectstart', false);
    let div = document.createElement('div');
    $(div).appendTo(field)
            .addClass('sorter');
    $(document.createElement('span')).appendTo(div)
            .addClass('chevron');
    $(document.createElement('span')).appendTo(div)
            .addClass('chevron');
  };

  /**
   * 設定排序欄位
   * @param {Cell.Grid} self grid
   */
  var _setupSortField = (self) => {
    $(self._domNode).find('.cell-grid-header-table .sortable')
            .on('click', function () {
              self.setSort($(this).attr('data-field-name'));
            });
    $(self._domNode).scrollParent().on('scroll', function (e) {
      _isPanelBottom(self);
    });
  };

  /**
   * 開關排序器，回傳排序結果
   * @param {Cell.Grid} self grid
   * @param {Element} field 欄位元素
   * @returns {String}
   */
  var _toggleSorter = (self, field) => {
    $(self._domNode).find('.cell-grid-header-table .sortable').not(field)
            .removeClass('up')
            .removeClass('down');
    if ($(field).hasClass('up')) {
      $(field).removeClass('up')
              .addClass('down');
      return 'DESC';
    } else if ($(field).hasClass('down')) {
      $(field).removeClass('down')
              .addClass('up');
      return 'ASC';
    } else {
      $(field).addClass('down');
      return 'DESC';
    }
  };

  /**
   * 建立 grid body
   * @param {Cell.Grid} self grid
   */
  var _createBody = (self) => {
    let body = document.createElement('div');
    $(body).appendTo(self._domNode)
            .addClass('cell-grid-body');
    $(document.createElement('table')).appendTo(body)
            .addClass('cell-grid-body-table');
    _createDataBody(self);
    _createEmptyMessager(self);
    _createLoadingMessager(self);
  };

  /**
   * 建立 grid body
   * @param {Cell.Grid} self grid
   */
  var _createDataBody = (self) => {
    $(document.createElement('tbody')).appendTo($(self._domNode).find('.cell-grid-body-table'))
            .addClass('cell-grid-body-data');
  };

  /**
   * 建立無資料提示訊息
   * @param {Cell.Grid} self grid
   */
  var _createEmptyMessager = (self) => {
    $(document.createElement('div'))
            .appendTo($(self._domNode).find('.cell-grid-body'))
            .addClass('cell-grid-empty')
            .html(self.options.emptyMessage || 'No any more')
            .hide();
  };

  /**
   * 建立載入提示訊息
   * @param {Cell.Grid} self grid
   */
  var _createLoadingMessager = (self) => {
    let div = document.createElement('div');
    $(div).appendTo($(self._domNode).find('.cell-grid-body'))
            .addClass('cell-grid-loading');

    $(document.createElement('span')).appendTo(div)
            .addClass('fad fa-spinner-third fa-spin');

    $(document.createElement('span')).appendTo(div)
            .addClass('cell-grid-loading-message')
            .html(self.options.loadingMessage || 'Loading');
  };

  /**
   * 取得送到後台的資料
   * @param {Cell.Grid} self grid
   */
  var _getPostData = (self) => {
    let postData = {
      'sort': (self._sort.field || undefined),
      'sort_type': (self._sort.type || undefined)
    };
    if (self.options.pageDataCount !== false) {
      postData.start = self.getItemCount() || undefined;
      postData.count = self.options.pageDataCount || undefined;
    }
    $.extend(postData, self.options.query || {});
    return postData;
  };

  /**
   * 利用URL 取得資料
   * @param {Cell.Grid} self grid
   */
  var _load = (self) => {
    if (!self.options.url || self._noMore) {
      _checkDataCount(self);
      return;
    }
    self._xhr && self._xhr.abort();
    $(self._domNode).find('.cell-grid-empty').hide();
    $(self._domNode).find('.cell-grid-loading').show();
    self._xhr = $c.ajax.get({
      'url': self.options.url,
      'data': _getPostData(self),
      'success': function (datas) {
        self.addItems(datas);
        if (!datas || datas && datas.length < self.options.pageDataCount) {
          self._noMore = true;
        } else {
          _isPanelBottom(self);
        }
        $(self._domNode).find('.cell-grid-select-all').removeClass('selected')
                .prop({
                  'checked': false,
                  'disabled': self.getItems(true).length === 0
                });
        (self.options.onload && self.options.onload.call(self));
      }, 'error': function (error) {
        self.options.onerror && self.options.onerror.call(self, error);
        _checkDataCount(self);
      }
    });
  };

  /**
   * 檢查有沒有資料
   * @param {Cell.Grid} self grid
   */
  var _checkDataCount = (self) => {
    let $emptyNode = $(self._domNode).find('.cell-grid-empty');
    let $selectAll = $(self._domNode).find('.cell-grid-select-all');
    $(self._domNode).find('.cell-grid-loading').hide();
    if (self.getItemCount() === 0) {
      $emptyNode.show();
      $selectAll.hide();
      return;
    }
    $emptyNode.hide();
    $selectAll.show();
  };

  /**
   * 設置 Item
   * @param {Cell.Grid} self grid
   * @param {Element} item item
   */
  var _setupItem = (self, item) => {
    self.options.onaddItem && self.options.onaddItem.call(self, item);
    if ($(item).hasClass('disabled')) {
      $(item).find('.cell-grid-row-selector').off('click')
              .find('.cell-grid-row-checkbox')
              .prop('disabled', true);
    }
    $(item).on('selectstart', false)
            .on('mouseover', function (e) {
              self.options.onmouseover && self.options.onmouseover.call(self, e, item);
            });
  };

  /**
   * 獲取欄位名
   * @param {String} name 欄位名
   * @return {String} 正則處理後的欄位名
   */
  var _getColName = (name) => {
    return name.toString().replace(/_/g, '-');
  };

  /**
   * 統一將所有欄位的資料寫入到 item 中
   * @param {Cell.Grid} self grid
   * @param {Element} item item
   * @param {Object} data 資料
   */
  var _setItemData = (self, item, data) => {
    $.each(self.options.fields, (key, col) => {
      $(item).data(col.name, data[col.name]);
    });
  };

  /**
   * 建立 Item Col
   * @param {Cell.Grid} self grid
   * @param {Object} data 資料
   * @param {Element} item 列
   * @param {Object} col 欄位資料
   */
  var _createItemCol = (self, data, item, col) => {
    if (!col.name || col.hidden === true) {
      return;
    }
    $(document.createElement('td')).appendTo(item)
            .addClass('cell-grid-col')
            .addClass(_getColName(col.name))
            .addClass(col.className);
    _setItemColVal(self, item, col, col.name, data[col.name]);
  };

  /**
   * 設定欄位值 (不會更新Data)
   * @param {Cell.Grid} self grid
   * @param {Element} item 列
   * @param {Array} col 欄位格式
   * @param {String} colName 欄位
   * @param {String} val 欄位值
   */
  var _setItemColVal = (self, item, col, colName, val) => {
    let td = $(item).find('.' + _getColName(colName));
    $(td).html('').html((col.formatter) ? col.formatter.call(self, item, td, val) : val);
  };

  /**
   * 檢查是不是在最下面<br/>
   * 若該Grid不採用分頁讀取、正在讀取中、不可見，一律不檢查
   * @param {Cell.Grid} self grid
   */
  var _isPanelBottom = (self) => {
    if (self.options.pageDataCount === false || !self._xhr || self._xhr.readyState === 1) {
      return;
    }
    let $grid = $(self._domNode);
    if ($grid.is(':visible') !== true) {
      return;
    }
    let $gridParent = $grid.scrollParent();
    let [
      parentHeight,
      contentHeight,
      scrollTop
    ] = [
      $gridParent.is(document) ? $(window).height() : $gridParent.innerHeight(),
      $gridParent.is(document) ? $gridParent.height() : $gridParent[0].scrollHeight,
      $gridParent.scrollTop()
    ];
    if (parentHeight + scrollTop >= contentHeight - 2) {
      self.load();
    }
  };

  /**
   * 增加 checkbox selector
   * @param {Cell.Grid} self grid
   */
  var _addSelector = (self) => {
    if (self.options.selector !== true) {
      return;
    }
    let $chbSelectAll = $(document.createElement('input')).attr('type', 'checkbox')
            .addClass('cell-grid-select-all')
            .hide();
    self.options.fields.unshift({
      'name': 'cell-grid-row-selector',
      'label': $chbSelectAll,
      'formatter': function (item, col) {
        $(document.createElement('input')).appendTo(col)
                .attr('type', 'checkbox')
                .addClass('cell-grid-row-checkbox');
        $(col).on('click', function (event) {
          self.selectItem(item);
          event.stopPropagation();
        });
        $(col).on('dblclick', function (event) {
          event.stopPropagation();
        });
      }
    });
  };

  /**
   * 判斷是否已全選 Grid<br/>
   * 若沒有全選就將header中的全選按鈕取消
   * @param {Cell.Grid} self grid
   * @returns {Boolean} 是否全選 Grid
   */
  var _isSelectAll = (self) => {
    let itemsCount = self.getItems(true).length;
    let $selectAll = $(self._domNode).find('.tiger-grid-select-all');
    //可選中資料為 0 筆時，禁用全選
    if (itemsCount === 0) {
      $selectAll.prop({
        'checked': false,
        'disabled': true
      });
      return false;
    }
    let selectAll = self.getSelection().length === itemsCount;
    $selectAll.prop('checked', selectAll);
    return selectAll;
  };

  /**
   * 取得初始資料
   * @param {Cell.Grid} self grid
   */
  var _init = (self) => {
    if (self.options.url) {
      self.load();
    } else {
      self.addItems(self.options.data);
    }
  };
  /**
   * @callback Cell.Grid.FieldFormatter
   * @param {Element} item 目前所在 item
   * @param {Element} td 目前所在col
   * @param {Element} value 目前值
   */
  /**
   * @callback Cell.Grid.onadditem
   * @param {Element} item 目前新增的 item
   */
  /**
   * @callback Cell.Grid.onclick
   * @param {Element} item 點擊的 item
   */
  /**
   * @callback Cell.Grid.ondblclick
   * @param {Element} item 點擊的 item
   */
  /**
   * @callback Cell.Grid.onmouseover
   * @param {Object} e event
   * @param {Element} item 移過的 item
   */
  /**
   * @callback Cell.Grid.onerror
   * @param {Object} e event
   */
  /**
   * @callback Cell.Grid.onload
   */
  /**
   * @callback Cell.Grid.onselected
   * @param {Object} e event
   * @param {Array<Cell.Grid.Item>} items 目前選中的所有 Item
   * @param {Boolean} multiSelected 是否多選
   */
  /**
   * @typedef {Object }Cell.Grid.Field
   * @property {String} name 欄位名
   * @property {String} label 欄位標籤
   * @property {Boolean} hidden 是否隱藏欄位 (原 width: 'hidden' 已經棄用)
   * @property {Boolean} sortable 是否可以排序
   * @property {Cell.Grid.FieldFormatter} formatter 格式化 handler
   */
  /**
   * Cell.Grid
   * @param {Object} options 選項
   * @param {Selector} [options.appendTo='.cell-main-container'] 父節點
   * @param {Selector} [options.replaceTo] 取代現有節點
   * @param {String} [options.id] Grid Dom ID
   * @param {Bool} [options.header=true] 是否顯示標題
   * @param {Bool} [options.headerSticky=true] 標題是否sticky
   * @param {Bool} [options.selector=false] item是否可通過checkbox選擇 Since:2.0.44
   * @param {String} [options.emptyMessage='No any more'] 資料為空時的提示訊息
   * @param {String} [options.loadingMessage='Loading'] 載入資料時的提示訊息
   * @param {Int} [options.pageDataCount=15] 每頁資料數量 (不建議更改，數字越大會造成系統效能越差) false 為不採用分頁讀取
   * @param {String} [options.url] URL，從後台取得資料的 URL
   * @param {Array<Object>} [options.data] 既有資料 (需跟{@link Cell.Grid.Field}配合)
   * @param {Array<Cell.Grid.Field>} [options.fields] 欄位設定
   * @param {String} [options.identify] 資料識別子 (當設定時，資料不能重複識別子)
   * @param {Object} [options.query] 預設的查詢條件
   * @param {Cell.Grid.onadditem} [options.onaddItem] 新增資料列時的 handler
   * @param {Cell.Grid.onclick} [options.onclick] 單擊資料列時的 handler
   * @param {Cell.Grid.ondblclick} [options.ondblclick] 雙擊資料列時的 handler
   * @param {Cell.Grid.onmouseover} [options.onmouseover] 移過資料列時的 handler
   * @param {Cell.Grid.onselected} [options.onselected] 選中資料列時的 handler
   * @param {Cell.Grid.onerror} [options.onerror] 當拉資料發生錯誤時 handler
   * @param {Cell.Grid.onload} [options.onload] 當成功讀取完成資料時 handler
   * @param {Function} [options.onreset] 重置Grid時的 handler
   * @memberOf Cell
   * @namespace Grid
   * @class Cell.Grid
   * @author danny.yang
   * @version 1.0.0
   */
  function Grid(options) {
    var _proto = Grid.prototype;
    this.options = options || {};
    this._xhr = null;
    this._domNode = null;
    this._sort = {};
    this._auto_increment = 0;
    this.options.pageDataCount = (this.options.pageDataCount === false) ? false : (Number.parseInt(this.options.pageDataCount) || 15);
    this.options.selector = Boolean(this.options.selector) || false;
    this._noMore = false;
    _createElement(this);
    _addSelector(this);
    _createHeader(this);
    _setupSortField(this);
    _createBody(this);

    /**
     * 取得資料總筆數
     * @returns {number} 資料數量
     * @name Cell.Grid#getItemCount
     * @function
     */
    _proto.getItemCount = function () {
      return $(this._domNode).find('.cell-grid-body-data tr').length;
    };

    /**
     * 根據DataId取得item
     * @param {String} dataId
     * @returns {Element} item
     * @name Cell.Grid#getItem
     * @function
     */
    _proto.getItem = function (dataId) {
      return $(this._domNode).find('.cell-grid-row[data-id=' + dataId + ']')[0];
    };

    /**
     * 获取所有资料列
     * @param {Boolean} enabled 是否只獲取可選中的 item 
     * @returns {Array<Element>} items 所有资料列
     * @name Cell.Grid#getItems
     * @function
     */
    _proto.getItems = function (enabled = false) {
      return $(this._domNode).find(`.cell-grid-body-data .cell-grid-row${enabled ? ':not(".disabled")' : ''}`).toArray();
    };

    /**
     * 取得 Item 資料
     * @param {Element} item 資料列
     * @param {String} [key=null] 指定欄位
     * @returns {String|Object} datas
     * @name Cell.Grid#getItemData
     * @function
     */
    _proto.getItemData = function (item, key = null) {
      return (key) ? $(item).data(key) : $(item).data();
    };

    /**
     * 取得所有Item的資料
     * @param {String} key 指定欄位
     * @param {Element} items 資料列
     * @returns {Array} datas
     * @name Cell.Grid#getItemsData
     * @function
     */
    _proto.getItemsData = function (key = null, items = null) {
      if (items) {
        if (!Array.isArray(items)) {
          items = [items];
        }
      } else {
        items = $(this._domNode).find('.cell-grid-body-data .cell-grid-row');
      }
      let datas = [];
      let grid = this;
      $.each(items, function (idx, item) {
        let data = grid.getItemData(item, key);
        if (!data) {
          return;
        }
        if (Array.isArray(data)) {
          datas = datas.concat(Array.from(data));
        } else {
          datas.push(data);
        }
      });
      return datas;
    };

    /**
     * 取得 Item ID
     * @param {Element} items 資料列
     * @returns {Mixed}
     * @name Cell.Grid#getItemId
     * @function
     */
    _proto.getItemId = function (items) {
      let ids = [];
      items = Array.isArray(items) ? items : [items];
      $.each(items, function (idx, item) {
        ids.push($(item).attr('data-id'));
      });
      return ids;
    };

    /**
     * 設定排序
     * @param {String} fieldName 欄位名
     * @returns {Cell.Grid}
     * @name Cell.Grid#setSort
     * @function
     */
    _proto.setSort = function (fieldName) {
      let field = $(this._domNode).find(".sortable[data-field-name='" + fieldName + "']");
      this.reset();
      this._sort = {
        'field': fieldName,
        'type': _toggleSorter(this, field)
      };
      this.load();
      return this;
    };

    /**
     * 設定選中指定 items , 觸發onselected事件<br/>
     * @param {Element} items 資料列
     * @param {Boolean} [forceSelected=true] 暴力選中，不管怎樣結果都是選中<br/>
     * 為false時，會變成開關
     * @returns {Cell.Grid}
     * @name Cell.Grid#setSelection
     * @function
     */
    _proto.setSelection = function (items, forceSelected = true) {
      let $items = $(items).not(".disabled");
      if (forceSelected) {
        $items.removeClass('selected');
      }
      $items.toggleClass('selected')
              .find('.cell-grid-row-checkbox')
              .prop('checked', $items.hasClass('selected'));
      _isSelectAll(this);
      (this.options.onselected && this.options.onselected.call(this, this.getSelection()));
      return this;
    };

    /**
     * 設定選中全部 Items
     * @returns {Cell.Grid}
     * @name Cell.Grid#selectAll
     * @function
     */
    _proto.selectAll = function () {
      if (_isSelectAll(this)) {
        this.removeSelection(this.getItems());
      } else {
        this.setSelection(this.getItems());
      }
      return this;
    };

    /**
     * 移除選中的 Items , 可選觸發onselected事件
     * @param {Array} items 要移除選中的 Item
     * @param {Boolean} [triggerSelected=true] 是否觸發onselected
     * @returns {Cell.Grid}
     * @name Cell.Grid#removeSelection
     * @function
     */
    _proto.removeSelection = function (items, triggerSelected = true) {
      $(this._domNode).find('.cell-grid-select-all').removeClass('selected')
              .prop('checked', false);
      $(items).removeClass('selected')
              .find('.cell-grid-row-checkbox')
              .prop('checked', false);
      (triggerSelected && this.options.onselected && this.options.onselected.call(this, this.getSelection()));
      return this;
    };

    /**
     * 取得選擇列
     * @returns {Array<Element>} 選擇的資料列
     * @name Cell.Grid#getSelection
     * @function
     */
    _proto.getSelection = function () {
      return $(this._domNode).find('.cell-grid-row.selected').toArray();
    };

    /**
     * 取得選擇列的值
     * @param {String} key 欄位名稱
     * @returns {Array|String}
     * @name Cell.Grid#getSelectionVal
     * @function
     */
    _proto.getSelectionVal = function (key) {
      return this.getItemsData(key, this.getSelection());
    };

    /**
     * 選擇資料列
     * @param {Element} item 資料列
     * @returns {Cell.Dialog}
     * @name Cell.Grid#selectItem
     * @function
     */
    _proto.selectItem = function (item) {
      let first = $(this._domNode).find('.cell-grid-body-data .selected').first();
      if (event.shiftKey && first.length !== 0 && $(item).index() !== $(first).index()) {
        if ($(item).index() < $(first).index()) {
          let temp = first;
          first = item;
          item = temp;
        }
        //先移除所有選中，但是不觸發onselected
        this.removeSelection(this.getItems(), false);
        this.setSelection(new Array().concat(Array.from($(first).nextUntil(item))).concat(first[0]).concat(item[0]));
      } else {
        //沒有開啟selector，也沒有按下 CTRL 時，則清空原本所選的
        if (this.options.selector !== true && !event.ctrlKey) {
          this.removeSelection(this.getItems(), false);
        }
        this.setSelection(item, false);
      }
      return this;
    };

    /**
     * 增加多筆item
     * @param {Array} dataset 資料集
     * @param {Boolean} [top=false] 新增在前面
     * @returns {Cell.Grid}
     * @name Cell.Grid#addItems
     * @function
     */
    _proto.addItems = function (dataset, top = false) {
      let grid = this;
      $(dataset).each(function (index, data) {
        grid.addItem(data, top);
      });
      _checkDataCount(grid);
      return this;
    };

    /**
     * 透過ID 移除item
     * @param {Array} ids
     * @returns {Cell.Grid}
     * @name Cell.Grid#removeItems
     * @function
     */
    _proto.removeItems = function (ids) {
      if (!Array.isArray(ids)) {
        ids = [ids];
      }
      let grid = this;
      $.each(ids, function (idx, id) {
        $(grid._domNode).find('.cell-grid-row[data-id="' + id + '"]').remove();
      });
      _isPanelBottom(grid);
      (this.options.onselected && this.options.onselected.call(this, this.getSelection()));
      _checkDataCount(grid);
      $('.tooltip').remove();
      return this;
    };

    /**
     * 增加單筆Item
     * @param {Object} data 資料
     * @param {Boolean} [top=false] 新增在前面
     * @returns {Cell.Grid}
     * @name Cell.Grid#addItem
     * @function
     */
    _proto.addItem = function (data, top = false) {
      if (!data) {
        return this;
      }
      let dataId = data[this.options.identify] || (data[this.options.identify] = (++this._auto_increment) || 0);
      if ($(this._domNode).find('.cell-grid-row[data-id=' + dataId + ']').length > 0) {
        console.log('重複的識別值:' + dataId);
        return this;
      }
      let grid = this;
      let $body = $(this._domNode).find('.cell-grid-body-table');
      let $cr = $(document.createElement('tr'));
      if (top) {
        $cr.prependTo($body);
      } else {
        $cr.appendTo($body);
      }
      $cr.addClass('cell-grid-row')
              .attr('data-id', dataId)
              .on('click', function () {
                (grid.options.selector !== true) && grid.selectItem($cr);
                grid.options.onclick && grid.options.onclick.call(grid, $cr[0]);
                event.stopPropagation();
              }).on('dblclick', function () {
        (grid.options.ondblclick && grid.options.ondblclick.call(grid, $cr[0]));
      });
      _setItemData(grid, $cr, data);
      $(this.options.fields).each(function (idx, col) {
        _createItemCol(grid, data, $cr, col);
      });
      $(this._domNode).find('.cell-grid-select-all').removeClass('selected')
              .prop({
                'checked': false,
                'disabled': false
              });
      _setupItem(this, $cr);
      _checkDataCount(grid);
      return dataId;
    };

    /**
     * 設定欄位值
     * @param {Array|String} dataIds 資料 ID
     * @param {Object} data 資料
     * @returns {Cell.Grid}
     * @name Cell.Grid#setItem
     * @function
     */
    _proto.setItem = function (dataIds, data) {
      let grid = this;
      if (!Array.isArray(dataIds)) {
        dataIds = [dataIds];
      }
      $.each(dataIds, (idx, id) => {
        let item = grid.getItem(id);
        if (!item) {
          return console.error(`Not find item: ${id}`);
        }
        _setItemData(grid, item, data);
        $.each(data, function (key, value) {
          let col = $c.getObjects(grid.options.fields, 'name', key);
          _setItemColVal(grid, item, col, key, value);
        });
      });
      return this;
    };

    /**
     * 設定欄位值
     * @param {Array|String} dataIds 資料 ID
     * @param {String} field 欄位名稱
     * @param {String} value 設定值
     * @returns {Cell.Grid}
     * @name Cell.Grid#setItemColVal
     * @function
     */
    _proto.setItemColVal = function (dataIds, field, value) {
      let grid = this;
      if (!Array.isArray(dataIds)) {
        dataIds = [dataIds];
      }
      $.each(dataIds, function (idx, id) {
        let item = grid.getItem(id);
        let col = $c.getObjects(grid.options.fields, 'name', field);
        $(item).data(field, value);
        _setItemColVal(grid, item, col, field, value);
      });
      return this;
    };

    /**
     * 禁用資料列，禁用後不可選中
     * @param {Array<Element>} items 要禁用的資料列
     * @returns {Cell.Grid}
     * @name Tiger.Grid#setItemsDisabled
     * @function
     */
    _proto.setItemsDisabled = function (items) {
      $(items).addClass('disabled')
              .removeClass('selected')
              .find('.tiger-grid-row-selector').off('click')
              .find('.tiger-grid-row-checkbox')
              .prop({
                'checked': false,
                'disabled': true
              });
      _isSelectAll(this);
      return this;
    };

    /**
     * 重新格式化欄位
     * @param {Array|String} dataIds 資料 ID
     * @param {Array|String} [fields=null] 欄位名稱，為空時格式化整個 item 
     * @returns {Cell.Grid}
     * @name Cell.Grid#renderItem
     * @function
     */
    _proto.renderItem = function (dataIds, fields = null) {
      let grid = this;
      if (!Array.isArray(dataIds)) {
        dataIds = [dataIds];
      }
      if (!Array.isArray(fields)) {
        fields = [fields];
      }
      let fieldData = [];
      if (fields) {
        $(fields).each(function (idx, field) {
          fieldData.push($c.getObjects(grid.options.fields, 'name', field));
        });
      } else {
        fieldData = this.options.fields;
      }
      $.each(dataIds, function (idx, id) {
        let item = grid.getItem(id);
        $(fieldData).each(function (idx, col) {
          let td = $(item).find(`.${col.name}`);
          let val = $(item).data(col.name);
          $(td).html('').html((col.formatter) ? col.formatter.call(grid, item, td, val) : val);
        });
      });
      return this;
    };

    /**
     * 重置
     * @name Cell.Grid#reset
     * @function
     */
    _proto.reset = function () {
      this.options.onreset && this.options.onreset.call(this);
      this._noMore = false;
      $(this._domNode).find('.cell-grid-body-data').empty();
      _checkDataCount(this);
      this.options.onselected && this.options.onselected.call(this, this.getSelection());
    };

    /**
     * 利用URL 取得資料
     * @name Cell.Grid#load
     * @function
     */
    _proto.load = function () {
      _load(this);
    };

    /**
     * 設定查詢
     * @param {Object} query 查詢條件
     * @returns {Cell.Grid}
     * @name Cell.Grid#setQuery
     * @function
     */
    _proto.setQuery = function (query) {
      this.options.query = $.extend(this.options.query, query);
      this.reset();
      this.load();
      return this;
    };

    /**
     * 重新載入
     * @returns {Cell.Grid}
     * @name Cell.Grid#reload
     * @function
     */
    _proto.reload = function () {
      $('.tooltip.bs-tooltip-top').remove();
      this.setQuery();
      return this;
    };

    /**
     * 設定URL，設定後會自動刷新
     * @param {string} url URL
     * @returns {Cell.Grid}
     * @name Cell.Grid#setUrl
     * @function
     */
    _proto.setUrl = function (url) {
      this.options.url = url;
      this.reload();
      return this;
    };

    /**
     * 取得第一筆資料
     * @returns {Cell.Grid.Item}
     * @name Cell.Grid#getFirstItem
     * @function
     */
    _proto.getFirstItem = function () {
      return $(this._domNode).find('.cell-grid-body-data .cell-grid-row:first-child');
    };

    /**
     * 檢查有沒有資料
     * @returns {Cell.Grid.Item}
     * @name Cell.Grid#checkDataCount
     * @function
     */
    _proto.checkDataCount = function () {
      _checkDataCount(this);
      return this;
    };

    _init(this);
  }
  return Grid;
}();


