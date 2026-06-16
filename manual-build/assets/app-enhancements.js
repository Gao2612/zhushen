(function () {
  'use strict';

  var HOME_PAGE = 'zy.html';
  var ENHANCEMENT_STYLE_ID = '_app_enhancement_style';
  var DISCLAIMER_ID = '_app_disclaimer';

  function createElement(tagName, className, textContent) {
    var element = document.createElement(tagName);
    if (className) {
      element.className = className;
    }
    if (textContent) {
      element.textContent = textContent;
    }
    return element;
  }

  function installStyles() {
    if (document.getElementById(ENHANCEMENT_STYLE_ID)) {
      return;
    }

    var style = createElement('style');
    style.id = ENHANCEMENT_STYLE_ID;
    style.textContent = [
      'html{overflow-y:auto;-webkit-overflow-scrolling:touch;}',
      'body{background:#1a1a1a!important;background-image:none!important;',
      'padding-top:max(80px,env(safe-area-inset-top));',
      'padding-bottom:calc(72px + env(safe-area-inset-bottom));',
      'padding-left:env(safe-area-inset-left);',
      'padding-right:env(safe-area-inset-right);}',
      'img,video{content-visibility:auto;contain-intrinsic-size:auto 300px;}',
      '.navbar{transform:translateZ(0);}',
      'button,a,[onclick]{touch-action:manipulation;}',
      '.app-dialog-backdrop{position:fixed;inset:0;z-index:99999;',
      'display:flex;align-items:center;justify-content:center;',
      'background:rgba(0,0,0,.82);padding:24px;}',
      '.app-dialog{width:min(330px,100%);padding:30px 24px 22px;',
      'border:1px solid rgba(212,167,84,.28);border-radius:22px;',
      'background:rgba(20,20,28,.97);color:#e0d5c0;text-align:center;',
      'box-shadow:0 24px 80px rgba(0,0,0,.65);}',
      '.app-dialog h2{margin:0 0 12px;color:#f0d78c;font-size:20px;}',
      '.app-dialog p{margin:0 0 20px;font-size:14px;line-height:1.9;',
      'color:rgba(224,213,192,.78);}',
      '.app-dialog button{min-height:48px;width:100%;margin-top:10px;',
      'border:1px solid rgba(212,167,84,.28);border-radius:14px;',
      'background:rgba(212,167,84,.12);color:#f0d78c;font-size:15px;}',
      '.app-primary{background:linear-gradient(135deg,#8b6914,#d4a754)',
      '!important;color:#0a0a0f!important;font-weight:700;}',
      '.app-check{display:flex;justify-content:center;align-items:center;',
      'gap:8px;margin-top:12px;font-size:13px;',
      'color:rgba(224,213,192,.58);}',
      '.app-check input{width:18px;height:18px;}'
    ].join('');
    document.head.appendChild(style);
  }

  function configureImages() {
    var images = document.querySelectorAll('img');
    for (var index = 0; index < images.length; index += 1) {
      images[index].setAttribute('loading', index < 4 ? 'eager' : 'lazy');
      images[index].setAttribute('decoding', 'async');
    }
  }

  function hideDuplicateNavigation() {
    var navigation = document.querySelector('.nav-menu');
    if (!navigation) {
      return;
    }

    var hiddenLabels = ['首页', '角色', '概念', '二创', '笑话'];
    var links = navigation.querySelectorAll('a');
    var hasQuestionLink = false;
    var hasForumLink = false;

    for (var index = 0; index < links.length; index += 1) {
      var label = links[index].textContent.trim();
      if (hiddenLabels.indexOf(label) >= 0) {
        links[index].parentElement.style.display = 'none';
      }
      hasQuestionLink = hasQuestionLink || label === '玩家问答';
      hasForumLink = hasForumLink || label === '游戏论坛';
    }

    if (!hasQuestionLink) {
      appendNavigationLink(
        navigation,
        '玩家问答',
        'https://docs.qq.com/sheet/DVXVaQWZOcUFyRlNr?tab=BB08J2'
      );
    }
    if (!hasForumLink) {
      appendNavigationLink(
        navigation,
        '游戏论坛',
        'https://www.taptap.cn/app/513986'
      );
    }
    if (!document.getElementById('_app_qq_group')) {
      appendActionLink(navigation, '游戏官群', '_app_qq_group', showQqGroups);
    }
    if (!document.getElementById('_app_settings')) {
      appendNavigationLink(
        navigation,
        '设置',
        'settings.html',
        '_app_settings'
      );
    }
  }

  function appendNavigationLink(navigation, label, href, id) {
    var item = createElement('li');
    var link = createElement(
      'a',
      'nav-item text-white no-underline px-3 py-2 rounded-md relative',
      label
    );
    link.href = href;
    if (id) {
      link.id = id;
    }
    item.appendChild(link);
    navigation.appendChild(item);
  }

  function appendActionLink(navigation, label, id, action) {
    var item = createElement('li');
    var link = createElement(
      'a',
      'nav-item text-white no-underline px-3 py-2 rounded-md relative',
      label
    );
    link.id = id;
    link.href = '#';
    link.addEventListener('click', function (event) {
      event.preventDefault();
      action();
    });
    item.appendChild(link);
    navigation.appendChild(item);
  }

  function createDialog(title, description) {
    var backdrop = createElement('div', 'app-dialog-backdrop');
    var dialog = createElement('div', 'app-dialog');
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');

    var heading = createElement('h2', '', title);
    var paragraph = createElement('p', '', description);
    dialog.appendChild(heading);
    dialog.appendChild(paragraph);
    backdrop.appendChild(dialog);
    return {backdrop: backdrop, dialog: dialog};
  }

  function createButton(label, primary, action) {
    var button = createElement(
      'button',
      primary ? 'app-primary' : '',
      label
    );
    button.type = 'button';
    button.addEventListener('click', action);
    return button;
  }

  function showQqGroups() {
    var modal = createDialog('诸神终应知晓', '请选择要加入的官方 QQ 群');
    modal.dialog.appendChild(
      createButton('官方一群 913044248', false, function () {
        window.location.href =
          'mqqapi://card/show_pslcard?src_type=internal' +
          '&version=1&card_type=group&uin=913044248';
      })
    );
    modal.dialog.appendChild(
      createButton('官方二群 130340208', false, function () {
        window.location.href =
          'mqqapi://card/show_pslcard?src_type=internal' +
          '&version=1&card_type=group&uin=130340208';
      })
    );
    modal.dialog.appendChild(
      createButton('取消', false, function () {
        modal.backdrop.remove();
      })
    );
    document.body.appendChild(modal.backdrop);
  }

  function installCountdown() {
    if (!window.location.pathname.endsWith('/' + HOME_PAGE)) {
      return;
    }
    if (document.getElementById('_app_countdown')) {
      return;
    }

    var main = document.querySelector('main');
    if (!main) {
      return;
    }

    var freezeDate = new Date(2024, 7, 2);
    var elapsedDays = Math.floor(
      (Date.now() - freezeDate.getTime()) / 86400000
    );
    var countdown = createElement('section');
    countdown.id = '_app_countdown';
    countdown.style.cssText = [
      'text-align:center',
      'padding:20px 16px',
      'margin:12px 16px',
      'border-radius:14px',
      'background:rgba(212,167,84,.04)',
      'border:1px solid rgba(212,167,84,.08)'
    ].join(';');

    var days = createElement('div', '', elapsedDays + ' 天');
    days.style.cssText =
      'font-size:38px;color:#f0d78c;font-weight:700;';
    var caption = createElement(
      'div',
      '',
      '研发冻结 · 2024.08.02'
    );
    caption.style.cssText =
      'font-size:12px;color:rgba(255,255,255,.4);margin-top:4px;';
    countdown.appendChild(days);
    countdown.appendChild(caption);
    main.insertBefore(countdown, main.firstChild);
  }

  function showDisclaimer() {
    if (!window.location.pathname.endsWith('/' + HOME_PAGE)) {
      return;
    }
    if (document.getElementById(DISCLAIMER_ID)) {
      return;
    }
    if (!window.Android || !window.Android.shouldShowDisclaimer()) {
      return;
    }

    var modal = createDialog(
      '声明',
      '该内容为玩家共创，不代表官方立场，不代表官方消息，' +
        '仅为纪念诸神终应知晓。'
    );
    modal.backdrop.id = DISCLAIMER_ID;

    var checkLabel = createElement('label', 'app-check');
    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkLabel.appendChild(checkbox);
    checkLabel.appendChild(document.createTextNode('不再提示'));

    modal.dialog.appendChild(
      createButton('我知道了', true, function () {
        if (checkbox.checked) {
          window.Android.setSkipDisclaimer(true);
        }
        modal.backdrop.remove();
      })
    );
    modal.dialog.appendChild(checkLabel);
    document.body.appendChild(modal.backdrop);
  }

  function run() {
    installStyles();
    configureImages();
    hideDuplicateNavigation();
    installCountdown();
    showDisclaimer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, {once: true});
  } else {
    run();
  }
})();
