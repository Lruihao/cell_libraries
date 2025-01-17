/* global $c */
$().ready(function () {
  $c.document.init();
});
/**
 * 用於自動獲取文檔標題，生產目錄，達到統一模組文檔風格的目的
 * @author Lruihao
 */
$c.document = new function () {
  let _document = this;

  /**
   * 樹的節點
   * @param {Object} data 節點數據
   * @returns {$c.document.Node}
   */
  function Node(data) {
    this.data = data;
    this.parent = null;
    this.children = [];
  }
  /**
   * 數據結構-樹 的實現
   * @param {Object} data 節點數據
   * @returns {$c.document.Tree}
   */
  function Tree(data) {
    var _proto = Tree.prototype;
    this._root = new Node(data);
    /**
     * 樹的 DFS
     * @param {Function} callback DFS 要做的事
     */
    _proto.traverseDF = function (callback) {
      (function recurse(currentNode) {
        if (callback(currentNode) === false) {
          return;
        }
        for (let childNode of currentNode.children) {
          recurse(childNode);
        }
      })(this._root);
    };
    /**
     * 增加樹的節點
     * @param {Object} data 節點數據
     * @param {Number} parentId 添加到父節點
     * @returns {$c.document.Node}
     */
    _proto.add = function (data, parentId) {
      let child = new Node(data), parent = null;
      this.traverseDF(function (node) {
        if (node.data.id === parentId) {
          parent = node;
        }
      });
      if (parent) {
        parent.children.push(child);
        child.parent = parent;
        return child;
      } else {
        throw new Error('Cannot add node to a non-existent parent.');
      }
    };
    /**
     * 查找節點父親節點
     * @param {$c.document.Node} node 開始節點
     * @param {Number} tag 標題標籤數值
     * @returns {@var;parentId |$c.document.Tree._proto@call;findParentId}
     */
    _proto.findParentId = function (node, tag) {
      if (node.data.tag < tag) {
        return node.data.id;
      } else {
        return this.findParentId(node.parent, tag);
      }
    };
    /**
     * 獲取節點的層級
     * @param {$c.document.Node} node 待獲取層級的節點
     * @param {Numebr} level 標題層級 從 1 開始
     * @returns {@var;level|$c.document.Tree._proto@call;getTitleLevel}
     */
    _proto.getNodeLevel = function (node, level = 1) {
      if (node.parent.data.id !== 0) {
        return this.getNodeLevel(node.parent, ++level);
      }
      return level;
    };
  }

  /**
   * 創建整體文檔結構
   */
  let _createContainer = () => {
    let parent = document.querySelector('.cell-main-container') || 'body';
    document.querySelector('.cell-mod-title') || $(document.createElement('h1')).appendTo(parent)
            .addClass('cell-mod-title')
            .html('幫助');
    let $row = $(document.createElement('div')).appendTo(parent)
            .addClass('row flex-row-reverse');
    _document.$colToc = $(document.createElement('div')).appendTo($row)
            .addClass('col-12 col-lg-4 col-xl-3 px-lg-0');
    _document.$colDocument = $(document.createElement('div')).appendTo($row)
            .addClass('col-12 col-lg-8 col-xl-9 pl-lg-0 pr-lg-1');
  };
  /**
   * 監聽視窗高度調整文檔 max-height
   * @param {jQuery Object} $content 文檔內容 DOM
   * @param {jQuery Object} $coc 目錄 DOM
   */
  let _addResizeListener = ($content, $coc) => {
    let offset = $('.cell-mod-title').offset().top + $('.cell-mod-title').outerHeight() + $('.cell-footer').outerHeight() + 10;
    $content.css('max-height', $(window).outerHeight() - offset);
    $coc.css('max-height', $content.css('max-height'));
    $(window).on('resize', function () {
      $content.css('max-height', $(this).outerHeight() - offset);
      $coc.css('max-height', $content.css('max-height'));
    });
  };
  /**
   * 通過文檔生成目錄樹
   * @param {jQuery Object} $content 文檔內容 DOM
   * @returns {$c.document.Tree} 目錄樹
   */
  let _generTocTree = ($content) => {
    let tocTree = new Tree({
      'id': 0,
      'tag': 0,
      'content': '目錄'
    });
    /**
     * 從文檔中獲取的標題層級，默認 6 層<br/>
     * 超過 n 層的不顯示在目錄，需在 DFS 做剪枝處理 e.g. h1 和 h5 同層級
     * @type {jQuery Object}
     */
    let headings = $content.find('h1,h2,h3,h4,h5,h6');
    let last = {
      'node': tocTree
    };
    for (let i = 0; i < headings.length; i++) {
      let headingTag = Number(headings[i].tagName.slice(1));
      let headingName = $(headings[i]).text().trim();
      //data-id 用於在 _createElementToc 時生產目錄對應的錨點
      $(headings[i]).attr('data-id', i + 1);
      //尋找標題父節點ID, 默認為上一節點 (eg. h2 > h1)
      let parentId = i;
      if (last.node.data && headingTag <= last.node.data.tag) {
        parentId = tocTree.findParentId(last.node, headingTag);
      }
      //深拷貝保存上一個生產的節點
      last.node = tocTree.add({
        'id': i + 1,
        'tag': headingTag,
        'content': headingName
      }, parentId);
    }
    return tocTree;
  };
  /**
   * 創建目錄 DOM
   * @param {$c.document.Tree} tocTree 目錄樹
   * @param {jQuery Object} $coc 目錄 DOM
   * @param {Number} [tocLevel=3] 目錄顯示層級
   */
  let _createElementToc = (tocTree, $coc, tocLevel = 3) => {
    let $baseNav = $(document.createElement('nav')).addClass('nav nav-pills flex-column');
    //標題序號棧 (LIFO), 有幾個元素代表几層
    let stackTitleNo = [0];
    //上次遍歷的標題節點層級，默認 1 級標題
    let lastLevel = 1;
    tocTree.traverseDF(function (node) {
      if (node.data.id === 0 && node.data.tag === 0) {
        return $baseNav.clone().appendTo($coc)
                .addClass(`nav-${node.data.id}`);
      }
      //當前節點所在目錄樹層級
      let currentLevel = tocTree.getNodeLevel(node);
      if (currentLevel < lastLevel) {
        //出棧次數
        let popTimes = lastLevel - currentLevel;
        while (popTimes--) {
          stackTitleNo.pop();
        }
      }
      lastLevel = currentLevel;
      stackTitleNo[stackTitleNo.length - 1]++;
      //註: BS 的 scrollspy 錨點不能以數字開頭且不能包含小數點
      let anchor = `toc${stackTitleNo.join('-')}`;
      //根據 data-id 添加錨點
      $(`[data-id="${node.data.id}"]`).attr('id', anchor);
      $(document.createElement('a')).appendTo(`.nav-${node.parent.data.id}`)
              .addClass('nav-link px-2')
              .attr({
                'href': `#${anchor}`,
                'title': node.data.content
              })
              .css('z-index', 500 - node.data.id)
              .html(`${stackTitleNo.join('.')}&nbsp;${node.data.content}`);
      //當前節點層級 < 目錄顯示層級 且 有子節點時，入棧
      if (currentLevel < tocLevel && node.children.length > 0) {
        stackTitleNo.push(0);
        $baseNav.clone().appendTo(`.nav-${node.parent.data.id}`)
                .addClass(`nav-${node.data.id}`);
      }
      //剪枝操作，不訪問超過 tocLevel 層的節點
      if (currentLevel === tocLevel) {
        return false;
      }
    });
  };
  /**
   * 加載渲染文檔內容並生成目錄
   */
  let _renderDocumnet = () => {
    let $coc = $(document.createElement('nav')).appendTo(_document.$colToc)
            .addClass('navbar flex-column rounded p-0')
            .attr('id', 'cell-toc');
    let $content = $('.cell-document').appendTo(_document.$colDocument)
            .attr({
              'data-spy': 'scroll',
              'data-target': '#cell-toc',
              'data-offset': '0'
            })
            .on('activate.bs.scrollspy', function () {
              $('[scroll-last-sticky="true"]').removeAttr('scroll-last-sticky');
              $coc.find('.nav-link').css('top', '');
              let activeItemLength = $coc.find('.nav-link.active').length;
              let $lastActiveTocItem = $coc.find('.nav-link.active').last();
              let gap = $lastActiveTocItem.offset().top - $coc.offset().top + $lastActiveTocItem.outerHeight();
              //滾出可視區 上方 || 下方
              if (gap <= activeItemLength * $lastActiveTocItem.outerHeight() || gap >= $coc.outerHeight()) {
                $coc.scrollTop($coc.scrollTop() + gap - activeItemLength * $lastActiveTocItem.outerHeight());
              }
              $c.stackSticky('top', $coc, '.nav-link.active');
            });
    _addResizeListener($content, $coc);
    _document.tocTree = _generTocTree($content);
    _createElementToc(_document.tocTree, $coc);
  };

  this.init = () => {
    _createContainer();
    _renderDocumnet();
    //異步獲取頁面，需手動執行
    $('.cell-document').scrollspy({'target': '#cell-toc'});
    //首次進入頁面定位錨點位置
    location.hash && $('.cell-document').scrollTop($(location.hash).position().top);
    $('.cell-toolbar').addClass('position-sticky');
    $c.stackSticky();
  };
};
