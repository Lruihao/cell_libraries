/* global $c, ProgressBar */

/**
 * CellAjax
 * @namespace CellAjax
 * @class CellAjax
 */
if (!$c.ajax) {
  $c.ajax = new function CellAjax() {
    var _proto = CellAjax.prototype;
    /**
     * 取得 Ajax 錯誤訊息
     * @param {object} jqXHR jquery的XHR物件
     * @param {object} exception 例外
     * @returns {string} 錯誤訊息
     * @memberOf Cell
     */
    var _getAjaxError = (jqXHR, exception) => {
      if (jqXHR.status === 0) {
        return 'Not connect.\n Verify Network.';
      } else if (jqXHR.status === 404) {
        return 'Requested page not found. [404]';
      } else if (jqXHR.status === 500) {
        return 'Internal Server Error [500].';
      } else if (exception === 'parsererror') {
        return 'Requested JSON parse failed.';
      } else if (exception === 'timeout') {
        return 'Time out error.';
      } else if (exception === 'abort') {
        return 'Ajax request aborted.';
      } else {
        return 'Uncaught Error.\n' + jqXHR.responseText;
      }
    };
    /**
     * 顯示 Ajax 錯誤訊息
     * @param {object} jqXHR
     * @param {object} exception
     * @memberOf Cell
     */
    var _showAjaxError = (jqXHR, exception) => {
      if (jqXHR.status === 0) {
        return;
      }
      if (jqXHR.status === 401) {
        return window.location.reload();
      }
      if (jqXHR.status === 403) {
        return $c.message.show({
          'type': 'warning',
          'content': '403 Forbidden.',
          'ok': function () {
            window.location.reload();
          }
        });
      }
      if (jqXHR.status === 424) {
        return $c.message.show({
          'type': 'warning',
          'content': '424 Failed Dependency.'
        });
      }
      $c.message.show({
        'type': 'warning',
        'content': '發生錯誤了！請聯繫系統管理員<br/>' + _getAjaxError(jqXHR, exception)
      });
    };
    /**
     *  發送 ajax 請求
     * @param {Object} options 更多選項設定請參考 jquery ajax
     * @returns {Cell}
     * @property {string} [method='POST'] 方法
     * @property {string} [dataType='json'] 資料格式
     * @property {function} [error={@link Cell._showAjaxError}] 發生錯誤時的 handler
     * @name Cell#ajax
     * @function
     */
    _proto.ajax = (options) => {
      if (!options) {
        return this;
      }
      options.method = options.method || 'POST';
      options.dataType = options.dataType || 'json';
      options.error = options.error || _showAjaxError;
      return $.ajax(options);
    };

    /**
     *  發送 ajax - GET 請求
     * @param {Object} options 更多選項設定請參考 jquery ajax
     * @returns {jQuery}
     * @name CellAjax#get
     * @function
     */
    _proto.get = (options) => {
      options.method = options.method || 'GET';
      return this.ajax(options);
    };
    /**
     *  發送 ajax - POST 請求
     * @param {Object} options 更多選項設定請參考 jquery ajax
     * @returns {jQuery}
     * @name CellAjax#get
     * @function
     */
    _proto.post = (options) => {
      options.method = options.method || 'POST';
      return this.ajax(options);
    };
    /**
     *  發送 ajax - PUT 請求
     * @param {Object} options 更多選項設定請參考 jquery ajax
     * @returns {jQuery}
     * @name CellAjax#get
     * @function
     */
    _proto.put = (options) => {
      options.method = options.method || 'PUT';
      return this.ajax(options);
    };
    /**
     *  發送 ajax - PATCH 請求
     * @param {Object} options 更多選項設定請參考 jquery ajax
     * @returns {jQuery}
     * @name CellAjax#get
     * @function
     */
    _proto.patch = (options) => {
      options.method = options.method || 'PATCH';
      return this.ajax(options);
    };
    /**
     *  發送 ajax - DELETE 請求
     * @param {Object} options 更多選項設定請參考 jquery ajax
     * @returns {jQuery}
     * @name CellAjax#delete
     * @function
     */
    _proto.delete = (options) => {
      options.method = options.method || 'DELETE';
      return this.ajax(options);
    };
    /**
     *  發送 ajax - OPTIONS 請求
     * @param {Object} options 更多選項設定請參考 jquery ajax
     * @returns {jQuery}
     * @name CellAjax#get
     * @function
     */
    _proto.options = (options) => {
      options.method = options.method || 'OPTIONS';
      return this.ajax(options);
    };

    /**
     * 以 Ajax 方式抓取頁面
     * 可在 $c.page.onunload 上建立事件，當換畫面的時候會觸發
     * @param {String} url URL
     * @param {Object} options options
     * @param {String|Selector} [options.appendTo='.cell-main-container'] 父節點
     * @param {Bool} [options.pushHistory] 是否寫入頁面頁面歷史
     * @param {Bool} [options.replaceHistory] 是否覆蓋頁面頁面歷史
     * @param {Function} [options.initPage] 初始化頁面 handler (取得頁面成功後的事件)
     * @returns {Cell}
     * @name Cell#ajaxHtml
     * @function
     */
    _proto.html = function (url, options) {
      let ctrlKey = (event && event.ctrlKey) || false;
      if (ctrlKey === true) {
        return window.open(url);
      }
      this.ajaxHtmlXhr && this.ajaxHtmlXhr.abort();
      options = options || {};
      let parent = options.appendTo || '.cell-main-container';
      this.ajaxHtmlXhr = this.ajax({
        'url': url,
        'method': 'GET',
        'Accept': 'text/html',
        'dataType': 'html',
        'success': function (response) {
          $('.xdsoft_datetimepicker, .tooltip.bs-tooltip-top').remove();
          $c.p && (typeof $c.p.onunload === 'function') && $c.p.onunload.call();
          if (options.replaceHistory === true) {
            $c.replaceHistory(url);
          } else if (options.pushHistory !== false) {
            $c.pushHistory(url);
          }
          $c.p = null;
          $(parent).html(response);
          (typeof options.initPage === 'function') && options.initPage.call();
          $('[data-toggle="tooltip"]').tooltip();
          $c.setupFlink($(parent).find('.fast-link'));
          $(document).off('scroll');
          window.scrollTo(0, 0);
          setTimeout(() => {
            $c.setAutofocus(parent);
          }, 100);
          $c.setTitle(false, $(`.cell-mod-title[autoTitle!="false"]`).text());
        }, 'error': (jqXHR, exception) => {
          _showAjaxError(jqXHR, exception);
        }
      });
      return this;
    };
  };
}


