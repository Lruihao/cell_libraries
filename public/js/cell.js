/* global Vue,$c */

/**
 * Date format
 * @param {String} fmt format
 * @returns {String} format date
 */
Date.prototype.format = function (fmt) {
  let o = {
    'M+': this.getMonth() + 1, //月份 
    'd+': this.getDate(), //日 
    'h+': this.getHours(), //小时 
    'm+': this.getMinutes(), //分 
    's+': this.getSeconds(), //秒 
    'q+': Math.floor((this.getMonth() + 3) / 3), //季度 
    'S': this.getMilliseconds()             //毫秒 
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    }
  }
  return fmt;
};

/**
 * Cell. updated on 2021/4/29<br/>
 * Cell 已經實體化於 $c，不建議再自己實體化
 * @namespace Cell
 * @class Cell
 * @version 1.0.0
 * @author Lruihao
 */
function Cell() {
  var _proto = Cell.prototype;
  var _setupFormUp = function (event) {
    if (event.keyCode !== 13) {
      return;
    }
    event.preventDefault();
    let parentForm = $(this).parents('form');
    let inputSelector = '[name]:not([readonly], [disabled], [type="hidden"], [type="radio"], [type="checkbox"]):visible';
    let nowIndex = $(parentForm).find(inputSelector).index(this);
    if (nowIndex === -1) {
      event.stopPropagation();
      return;
    }
    let nextInput = $(parentForm).find(inputSelector + ':eq(' + (nowIndex + 1) + ')');
    if (nextInput.length > 0) {
      $(nextInput).select();
    } else if (!$(this).hasClass('cell-searchbar-display-input')) {
      $(parentForm).submit();
    }
    event.stopPropagation();
  };
  var _setupInputUp = (event, input, submit) => {
    if (event.keyCode !== 13) {
      return;
    }
    submit && submit.call(this, $(input).val());
  };
  var _setupFormFocus = function () {
    $(this).select();
  };

  /**
   * 將 URL 改成以 Ajax 取得
   * @param {String} selector 選擇器
   * @param {Object} option 選項
   * @param {Object} [option.initData] 初始化資料，初始化目前頁面中的資料 (不刷新頁面，只取得 json 資料，只有同網址時才有效)
   * @param {String} [option.target=a.target] 容器，取得的頁面要放到哪個容器下做為內容 (只有不同網址時才有效)
   * @param {Function} [option.initPage] 初始化頁面 (取得頁面成功後的事件，只有不同網址時才有效)
   * @returns {Cell}
   * @name Cell#setupFlink
   * @function
   */
  _proto.setupFlink = (selector, option) => {
    option = option || {};
    $(selector).on('click', function (event) {
      if (event.ctrlKey || event.shiftKey) {
        return;
      }
      let href = $(this).attr('href');
      if (!href || href.length === 0) {
        return;
      }
      if (option.initData && href.indexOf('/') < 0) {
        $c.pushHistory(href, (option.initData || null));
      } else {
        $c.ajax.html(href, {
          'appendTo': (option.target || $(this).attr('target')),
          'success': option.initPage
        });
      }
      event.preventDefault();
    });
    return this;
  };
  /**
   * @callback Cell.initPage
   * @param {Object} queryString URL上的 GET 參數
   */
  /**
   * 寫入網頁瀏覽紀錄
   * @param {String} [url=window.location.pathname] URL
   * @param {Cell.initPage} [initPage] 初始化頁面 handler
   * @returns {Cell}
   * @name Cell#pushHistory
   * @function
   */
  _proto.pushHistory = (url, initPage) => {
    url = url || window.location.pathname;
    //hash change didn't push history
    window.history.replaceState({
      'url': location.href
    }, null, location.href);
    window.history.pushState({
      'url': url
    }, null, url);
    (typeof initPage === 'function') && initPage.call(this, this.querystring());
  };

  /**
   * 覆蓋網頁瀏覽紀錄
   * @param {String} [url=window.location.pathname] URL
   * @param {Cell.initPage} [initPage] 初始化頁面 handler
   * @returns {Cell}
   * @name Cell#replaceHistory
   * @function
   */
  _proto.replaceHistory = (url, initPage) => {
    url = url || window.location.pathname;
    window.history.replaceState({
      'url': url
    }, null, url);
    (typeof initPage === 'function') && initPage.call(this, this.querystring());
  };

  /**
   * @callback Cell.setupForm.submit
   * @param {Object} data 表單內經過序列化的資料
   */
  /**
   * 設置表單，增加表單的操作便利性
   * (自動 focus 第一個input，並在 input 按下 enter 之後自動跳到下個 input，若為表單中最後一個 input 則送出表單，點擊 input 時自動全選內容)
   * @param {String} selector 表單選擇器
   * @param {Cell.setupForm.submit} submit 資料送出的 handler
   * @returns {Cell}
   * @name Cell#setupForm
   * @function
   */
  _proto.setupForm = (selector, submit) => {
    let $form = $(selector);
    $form.off('submit').on('submit', function (event) {
      $form.addClass('was-validated');
      let form = $form[0];
      if (form.checkValidity() === false) {
        $(form).find(':invalid').first().focus();
      } else {
        submit && submit.call(form, $(form).serialize());
      }
      event.preventDefault();
    });
    let inputSelector = '[name]:not(textarea, [readonly], [type="hidden"], [type="radio"], [type="checkbox"])';
    $form.find(inputSelector)
            .on('keypress', function (event) {
              if (event.keyCode === 13) {
                event.preventDefault(); //阻止自動送出 (browser default active
              }
            }).off('keyup', _setupFormUp).on('keyup', _setupFormUp)
            .off('focus', _setupFormFocus).on('focus', _setupFormFocus);
    $form.find('textarea[autoHeight]').on('input', function () {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
      this.style.overflow = 'hidden';
    });
    $form.find('.datepicker').off('keydown');
    return this;
  };

  /**
   * @callback Cell.setupInput.submit
   * @param {String} data Value of the input
   */
  /**
   * 設置 Input
   * @param {String} selector Input 選擇器
   * @param {Cell.setupInput.submit} submit 按下Enter要執行的callback
   * @returns {Cell}
   * @name Cell#setupInput
   * @function
   */
  _proto.setupInput = (selector, submit = null) => {
    $(selector).on('keypress', function (event) {
      if (event.keyCode === 13) {
        event.preventDefault(); //阻止自動送出 (browser default active
      }
    }).off('keyup', function (e) {
      _setupInputUp(e, this, submit);
    }).on('keyup', function (e) {
      _setupInputUp(e, this, submit);
    }).on('focus', function () {
      $(this).select();
    });
    return this;
  };

  /**
   * 重設表單，將表單恢復到預設狀態，並 focus 第一個 input
   * @param {String} selector 表單選擇器
   * @param {Boolean} [focus=true] 是否自動focus
   * @param {Function} [onreset] 當重置時
   * @returns {Cell}
   * @name Cell#resetForm
   * @function
   */
  _proto.resetForm = (selector, focus, onreset) => {
    $(selector).each(function (index, form) {
      form.reset();
      $(form).removeClass('was-validated');
      if (focus !== false) {
        $(form).find('[autofocus]').focus();
      }
      (onreset && onreset.call(form));
    });
    return this;
  };

  /**
   * 將根節點中擁有 autofocus 屬性的 Element 進行 focus (主要用於 ajax 取得的頁面無法自動 focus)
   * @param {String} root 根節點
   * @returns {Cell}
   * @name Cell#setAutofocus
   * @function
   */
  _proto.setAutofocus = (root) => {
    $(root).find('[autofocus]').focus();
    return this;
  };

  /**
   * 將時間字串轉換為時間差距字串，如：1小時之前、50秒之前等
   * @param {String} date 時間字串
   * @returns {String} 時間差距字串
   * @name Cell#timeSince
   * @function
   */
  _proto.timeSince = (date) => {
    if (!date) {
      return;
    }
    let dateTS = new Date(date.replace(/-/g, '/'));
    let seconds = Math.floor((new Date() - dateTS) / 1000);
    let interval = Math.floor(seconds / (30 * 24 * 3600));
    if (interval >= 4) {
      return dateTS.format('yyyy-MM-dd hh:mm');
    }
    if (interval >= 1) {
      return interval + " 月前";
    }
    interval = Math.floor(seconds / (7 * 24 * 3600));
    if (interval >= 1) {
      return interval + " 週前";
    }
    interval = Math.floor(seconds / (24 * 3600));
    if (interval >= 1) {
      return interval + " 天前";
    }
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return interval + " 小時前";
    }
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return interval + " 分鐘前";
    }
    return "剛剛";
  };

  /**
   * 將時間字串轉換為時間差距分鐘
   * @param {String} date 時間字串
   * @returns {Number} 分鐘
   * @name Cell#getTimeSinceMinute
   * @function
   */
  _proto.getTimeSinceMinute = (date) => {
    if (!date) {
      return;
    }
    let dateTS = new Date(date.replace(/-/g, '/'));
    let seconds = Math.floor((new Date() - dateTS) / 1000);
    return Math.floor(seconds / 60);
  };

  /**
   * 倒數計時
   * @param {Int} minute 分鐘
   * @param {String} [dataType='object'] 回傳的格式 object、html
   * @returns {Object|Html}
   * @name Cell#minuteDiff
   * @function
   */
  _proto.minuteDiff = (minute, dataType = 'object') => {
    if (!minute && minute !== 0) {
      return;
    }
    if (minute === 0) {
      if (dataType === 'object') {
        return {minute};
      }
      return `<span class="time-minute">${minute}</span>`;
    }
    let negative = false;
    if (minute < 0) {
      minute *= -1;
      negative = true;
    }
    let day = Math.floor(minute / 60 / 24);
    minute -= day * 60 * 24;
    let hour = Math.floor(minute / 60);
    minute -= hour * 60;
    if (dataType === 'object') {
      return {
        negative, day, hour, minute
      };
    }
    let output = '';
    if (day > 0) {
      output += `<span class="time-day">${day}</span>`;
    }
    if (hour > 0) {
      output += `<span class="time-hour">${hour}</span>`;
    }
    if (minute > 0) {
      output += `<span class="time-minute">${minute}</span>`;
    }
    let spanClass = negative ? 'negative' : '';
    return `<span class="${spanClass}">${output}</span>`;
  };

  /**
   * 時間格式化
   * @param {String} date 時間
   * @param {String} [formater='yyyy-MM-dd hh:mm'] 時間格式化格式
   * @returns {String}
   */
  _proto.timeFormat = (date, formater = 'yyyy-MM-dd hh:mm') => {
    if (!date) {
      return;
    }
    return new Date(date.replace(/-/g, '/')).format(formater);
  };

  /**
   * 獲取與當前間隔幾天的日期
   * @param {Int} [day=0] 間隔天數 可為負數
   * @param {String} [formater='yyyy-MM-dd'] date format
   * @param {String} [starDate=Date.now()] 開始日期字串
   * @returns {String}
   * @name Cell#getIntervalDay
   * @function
   */
  _proto.getIntervalDay = (day = 0, formater = 'yyyy-MM-dd', starDate = Date.now()) => {
    return new Date(new Date(starDate).getTime() + day * 24 * 60 * 60 * 1000).format(formater);
  };

  /**
   * 取得 URL Query String 參數
   * @param {String} [key] 參數名稱<br/>
   * 沒有 key 時，返回所有參數 (Object)<br/>
   * key = './' 時，可以拿到目前的 URL 檔案名稱<br/>
   * @param {String} [url=location.search] URL (沒有帶入時，預設為目前頁面網址)
   * @returns {String|Object} Get 參數
   * @name Cell#querystring
   * @function
   */
  _proto.querystring = (key, url) => {
    let pathname = url || location.pathname;
    url = url || location.search;
    let filename = pathname.substring(pathname.lastIndexOf('/') + 1);
    let paramMap = {
      './': filename || undefined
    };
    let querystring = (url.indexOf('?') === 0) ? url.substring(1) : url;
    if (querystring.length !== 0) {
      let parts = querystring.split('&');
      for (let i = 0; i < parts.length; i++) {
        let component = parts[i].split('=');
        let paramKey = decodeURIComponent(component[0]);
        let paramVal = decodeURIComponent(component[1]);
        if (!paramMap[paramKey]) {
          paramMap[paramKey] = paramVal;
          continue;
        }
        !Array.isArray(paramMap[paramKey]) && (paramMap[paramKey] = Array(paramMap[paramKey]));
        paramMap[paramKey].push(paramVal);
      }
    }
    return (key) ? paramMap[key] || undefined : paramMap;
  };

  /**
   * 取得頁面資訊
   * @returns {Object}
   */
  _proto.getPageInfo = () => {
    let url = location.pathname.match(/\/([^\/#&?]+)\/([^\/#&?]+)\/[^\/#&?]*$/i);
    return {
      'modId': url[1],
      'modFunc': url[2],
      'querystring': this.querystring(),
      'hash': location.hash.replace('#', '')
    };
  };

  /**
   * 設定 URL GET 參數
   * @param {String} url
   * @param {String} paramName
   * @param {String} paramValue
   * @returns {String}
   * @name Cell#setUrlParam
   * @function
   */
  _proto.setUrlParam = (url, paramName, paramValue) => {
    //去除 url 尾部多餘的 & 符號
    url = url.replace(/&+$/, '');
    if (['null', null, undefined, 'undefined'].includes(paramValue)) {
      paramValue = '';
    }
    let pattern = new RegExp(`\\b(\\?|&)(${paramName}=).*?(&|#|$)`);
    //已有 GET 參數，則更新或刪除
    if (url.search(pattern) >= 0) {
      if (paramValue.length > 0) {
        return url.replace(pattern, `$1$2${paramValue}$3`);
      }
      if (url.indexOf('&') < 0) {
        return url.replace(pattern, '');
      }
      return url.replace(pattern, RegExp.$1 === '?' ? '$1' : '$3');
    }
    //不添加空的 GET 參數
    if (paramValue === '') {
      return url;
    }
    //尚無 GET 參數，則添加
    url = url.replace(/[?#]$/, '');
    return url + (url.indexOf('?') > 0 ? '&' : '?') + paramName + '=' + paramValue;
  };

  /**
   * 建立 List 
   * @param {type} items
   * @param {type} node
   * @returns {String}
   * @name Cell#createList
   * @function
   */
  _proto.createMinList = (items, node) => {
    if (!Array.isArray(items)) {
      items = [items];
    }
    if (!node) {
      node = document.createElement('div');
    }
    let div = document.createElement('div');
    $(div).appendTo(node).addClass('cell-min-list');
    $.each(items, (index, item) => {
      let span = document.createElement('span');
      $(span).addClass('cell-min-list-item').html(item).appendTo(div);
    });
    return $(node).html();
  };

  /**
   * 取得Obj
   * @param {Object} obj
   * @param {String} key
   * @param {String} val
   * @returns {Object}
   * @name Cell#getObjects
   * @function
   */
  _proto.getObjects = (obj, key, val) => {
    let objects = [];
    for (let i in obj) {
      if (!obj.hasOwnProperty(i)) {
        continue;
      }
      if (typeof obj[i] === 'object') {
        objects = objects.concat(_proto.getObjects(obj[i], key, val));
      } else if (i === key && obj[key] === val) {
        objects.push(obj);
      }
    }
    return objects.length === 1 ? objects[0] : objects;
  };
  /**
   * nl to br
   * @param {String} str
   * @returns {String} 經過轉換後的字串
   * @name Cell#nl2br
   * @function
   */
  _proto.nl2br = (str) => {
    let breakTag = '<br />';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
  };

  /**
   * 將字串轉成 base64
   * @param {String} str 字串
   * @return {String}
   * @name Cell#base64Encode
   * @function
   */
  _proto.base64Encode = (str) => {
    return btoa(str).replace(/\+\//g, '-_').replace(/=/g, '');
  };

  /**
   * 將base64 字串解碼
   * @param {String} str 字串
   * @return {String}
   * @name Cell#base64Decode
   * @function
   */
  _proto.base64Decode = (str) => {
    let remainder = str.length % 4;
    let padlen;
    if (remainder) {
      padlen = 4 - remainder;
      str += str.repeat('=', padlen);
    }
    return atob(str.replace('-_', '+/'));
  };

  /**
   * 路由器
   * @param {String} path controller
   * @return {String}
   * @name Cell#router
   * @function
   */
  _proto.router = (path) => {
    let pathname = window.location.pathname;
    let rootpath = $('#cell-rpath').val() || '';
    if (path === './' || path === '') {
      return pathname;
    }
    if (path && path.indexOf('./') === 0) {
      return pathname + path.substring(1);
    }
    if (path && path.indexOf('//') === 0) {
      return rootpath + path.substring(2);
    }
    let pathInfo = pathname.replace(rootpath, '');
    let modPos = pathInfo.indexOf('/');
    let modId = pathInfo.substring(0, modPos);
    if (path && path.indexOf('/') === 0) {
      return rootpath + modId + path;
    }
    return rootpath + pathInfo.replace('/' + $c.querystring('./'), '') + '/' + path;
  };

  /**
   * Quote regular expression characters plus an optional character  
   * @param {String} str
   * @param {String} delimiter
   * @returns {String}
   */
  _proto.pregQuote = (str, delimiter = null) => {
    return (str + '').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
  };

  /**
   * 自動堆疊 sticky (所有 element 產生完畢後再呼叫)<br/>
   * 卷軸節點優先，只要遇到卷軸一律從0開始堆疊<br/>
   * 分頁節點(root, tab)：卷軸節點的繼續堆疊，在同一個分頁節點的堆疊 = 卷軸節點 + 同一分頁節點的堆疊
   * @param {String} [type='top'] css postion sticky 對齊屬性 top/bottom/left/right
   * @param {String|Element} [root=document] 開始計算的根節點
   * @param {String|Element} [selector='.position-sticky:visible, .sticky-top:visible'] 指定堆疊對象
   * @returns {Cell}
   * @name Cell#stackSticky
   * @function
   */
  _proto.stackSticky = (type = 'top', root = document, selector = '.position-sticky:visible, .sticky-top:visible') => {
    let offset = 0;
    let $stickyElements = $(root).find(selector)
            .filter(function (index, element) {
              return $(element).css(type) === 'auto';
            });
    $stickyElements.each(function (idx, element) {
      let $scrollParent = $(element).scrollParent();
      let $sameLevelStickyElements, index, $lastElement;
      if ($(element).parentsUntil(root).length >= $(element).parentsUntil($scrollParent).length) {
        //卷軸父節點比較近，則第一個Sticky從0開始堆疊
        $sameLevelStickyElements = $($scrollParent).find(selector);
        index = $sameLevelStickyElements.index(element);
        if (index === 0) {
          return $(element).css(type, 0);
        }
        $lastElement = $($sameLevelStickyElements.get(index - 1));
        if ($sameLevelStickyElements.length - 1 === index) {
          $(element).attr('scroll-last-sticky', true);
        }
      } else {
        //分頁父節點比較近，在同一個卷軸父節點下，抓到卷軸父節點分頁之前的最後 sticky
        $sameLevelStickyElements = $(root).find(selector);
        index = $sameLevelStickyElements.index(element);
        if (index === 0) {
          $lastElement = $scrollParent.find('[scroll-last-sticky]')
                  .filter(function (index, element) {
                    return $(element).scrollParent()[0] === $scrollParent[0];
                  });
        } else {
          $lastElement = $($sameLevelStickyElements.get(index - 1));
        }
      }
      $(element).css(type, parseInt($lastElement.css(type)) + $lastElement.outerHeight() + offset);
    });
    return this;
  };

  /**
   * 創建「建立人/編輯人」欄位<br/>
   * 需搭配 class .field-user
   * @param {Object} user 使用者信息
   * @param {String} user.name 使用者姓名
   * @param {String} user.account 使用者賬號
   * @param {String} user.ip 使用者 IP
   * @param {String} date 創建/修改時間
   * @returns {jQuery} user field DOM
   * @name Cell#createFieldUser
   * @function
   */
  _proto.createFieldUser = (user, date) => {
    let $divUser = $(document.createElement('div')).addClass('align-self-start');
    let $divDate = $(document.createElement('div')).addClass('align-self-end');
    user.name && $(document.createElement('span')).appendTo($divUser)
            .html(user.name);
    user.account && $(document.createElement('span')).appendTo($divUser)
            .toggleClass('brackets', !!user.name)
            .html(user.account);
    user.ip && $(document.createElement('span')).appendTo($divUser).
            toggleClass('square-brackets', !!user.name || !!user.account)
            .html(user.ip);
    date && $(document.createElement('span')).appendTo($divDate)
            .attr({
              'data-toggle': 'tooltip',
              'data-placement': 'bottom',
              'title': date
            })
            .html($c.timeSince(date))
            .tooltip();
    return $(document.createElement('div')).append($divUser, $divDate).children();
  };

  /**
   * 複製到剪貼板
   * @param {Element} node 被操作的input節點
   * @returns {String} 複製內容
   * @name Cell#copy2cb
   * @function
   */
  _proto.copy2cb = (input) => {
    input.select();
    return document.execCommand('Copy');
  };

  /**
   * 禁止打開控制台
   * @name Cell#banConsole
   * @function
   */
  _proto.banConsole = () => {
    //禁止鼠標選中文字
    $('body').addClass('user-select-none');
    $(document).on('contextmenu', function (event) {
      return event.preventDefault();
    });
    $(document).on('keydown', function (event) {
      //F12 || ctrl + shfit + I
      if (event.keyCode === 123 || event.ctrlKey && event.shiftKey && event.keyCode === 73) {
        return event.preventDefault();
      }
    });
  };

  /**
   * 給元素去除指定前綴的類
   * @param {Element} element 節點元素
   * @param {String} prefix 前綴字串
   * @returns {Cell}
   * @name Cell#removeClassPrefix
   * @function
   */
  _proto.removeClassPrefix = (element, prefix) => {
    element.className = element.className.split(' ')
            .filter(c => !c.startsWith(prefix))
            .join(' ')
            .trim();
    return this;
  };

  /**
   * 創建 DOM 元素
   * @param {String} element 元素類型 
   * @param {Element} parent 父節點
   * @param {String} content 內容
   * @param {String} className 類名
   * @returns {jQuery} DOM
   * @name Cell#removeClassPrefix
   * @function
   */
  _proto.createElement = (element, parent, content, className) => {
    return $(document.createElement(element)).appendTo(parent).html(content).addClass(className);
  };

  /**
   * 反轉義存在html標籤的內容
   * @param {String} value
   * @returns {String} text
   * @name Cell#escape2Html
   * @function
   */
  _proto.escape2Html = (value) => {
    return $(document.createElement('div')).html(value).text();
  };

  /**
   * 轉義存在html標籤的內容
   * @param {String} value
   * @returns {String} html
   * @name Cell#html2Escap
   * @function
   */
  _proto.html2Escap = (value) => {
    return $(document.createElement('div')).text(value).html();
  };

  /**
   * 打亂數組內容
   * @param {Array} array
   * @param {Int} size 返回的亂序數組長度
   * @returns {Array} 亂序數組
   * @name Cell#shuffleAarry
   * @function
   */
  _proto.shuffleAarry = (array, size) => {
    let index = -1;
    let length = array.length;
    size = size || length;
    while (++index < size) {
      let rand = index + Math.floor(Math.random() * (length - index));
      let value = array[rand];
      array[rand] = array[index];
      array[index] = value;
    }
    array.length = size;
    return array;
  };

  /**
   * 格式化位元組
   * @param {Int} bytes 位元組
   * @param {Int} precision 小數點 (default: 2)
   * @return {String}
   * @name Cell#formatBytes
   * @function
   */
  _proto.formatBytes = (bytes, precision) => {
    let units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let pow = Math.floor((bytes ? Math.log(bytes) : 0) / Math.log(1024));
    pow = Math.min(pow, units.length - 1);
    bytes /= (1 << (10 * pow));
    let unit = (units[pow]) ? units[pow] : units[0];
    return bytes.toFixed(precision || 2) + ' ' + unit;
  };

  /**
   * 動態設置網頁標題
   * @param {Boolean} [removeAutoTitle=false] 是否移除 autoTitle 屬性
   * @param {String} [title=undefined] title (undefined參數時則抓取 '.cell-mod-title' 的內容)
   * @returns {Cell}
   * @name Cell#setTitle
   * @function
   * 
   */
  _proto.setTitle = (removeAutoTitle = false, title = undefined) => {
    if (removeAutoTitle === true) {
      $('.cell-mod-title[autoTitle="false"]').removeAttr('autoTitle');
    }
    title = (title || $('.cell-mod-title[autoTitle!="false"]').text()).replace(/(^\s*)|(\s*$)|\s(?=\s)/g, '');
    document.title = (title && `${title} - `) + document.title.split(' - ').pop();
    return this;
  };
}
if (typeof Vue === 'function') {
  /**
   * Vue 擴充構造器
   * @since 1.0.1
   * @author Lruihao
   */
  Cell.Vue = Vue.extend({
    'mounted': function () {
      this.$nextTick(function () {
        this.initPage();
      });
    }, 'updated': function () {
      this.initPage(this.$el);
    }, 'methods': {
      /**
       * Vue Dom 掛載後執行的初始化操作
       * @param {Element|String} [parent='.cell-main-container'] CSS Selector or DOM
       */
      'initPage': function (parent = '.cell-main-container') {
        $c.setTitle(true);
        $c.setupFlink($(parent).find('.fast-link'));
        $(parent).find('[data-toggle="tooltip"]').tooltip();
        $c.stackSticky();
      }
    }
  });
}
var $c = new Cell();
