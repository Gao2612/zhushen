(function () {
  'use strict';

  var HOME_PAGE = 'zy.html';
  var BACKGROUND_MUSIC_TITLE = 'Mass No.19 in D Minor, K.626 Requiem: Introitus: Requiem Aeternam';
  var ENHANCEMENT_STYLE_ID = '_app_enhancement_style';
  var DISCLAIMER_ID = '_app_disclaimer';
  var BACKGROUND_MODE_KEY = 'zhushen_desktop_background_mode';
  var PAGE_BACKGROUNDS = {
    'zy.html': 'zy/诸神终应知晓概念图.jpg',
    'official.html': 'official-posts/492288870839223557/cover.jpg',
    'gfjs.html': '官方-角色/阿塔尔/阿塔尔1 .jpeg',
    'gfgn.html': 'zy/诸神终应知晓概念图.jpg',
    'wjec.html': 'zy/玩家二创.jpg',
    'qyxhhj.html': 'zy/群友笑话合集.jpg',
    'settings.html': 'splash.jpg'
  };

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
      'body{background:transparent!important;background-image:none!important;',
      'padding-top:max(80px,env(safe-area-inset-top));',
      'padding-bottom:calc(72px + env(safe-area-inset-bottom));',
      'padding-left:env(safe-area-inset-left);',
      'padding-right:env(safe-area-inset-right);}',
      'body.desktop-client{padding-top:44px!important;padding-bottom:0!important;}',
      'body.desktop-client.has-desktop-dock{padding-bottom:82px!important;}',
      'body.desktop-client .archive-nav{top:44px;}',
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
      '.app-check input{width:18px;height:18px;}',
      '.desktop-splash{position:fixed;inset:0;z-index:100000;',
      'display:flex;align-items:stretch;justify-content:stretch;',
      'background:#050507;transition:opacity .36s ease;cursor:default;}',
      '.desktop-splash.ready{cursor:pointer;}',
      '.desktop-splash.closing{opacity:0;pointer-events:none;}',
      '.desktop-splash-panel{position:relative;width:100vw;height:100vh;',
      'overflow:hidden;background:#050508;}',
      '.desktop-splash video,.desktop-splash img{width:100%;height:100%;',
      'object-fit:cover;}',
      '.desktop-splash img{display:none;}',
      '.desktop-splash-shade{position:absolute;inset:0;',
      'background:linear-gradient(90deg,rgba(5,5,7,.88),rgba(5,5,7,.22) 46%,rgba(5,5,7,.72)),',
      'linear-gradient(0deg,rgba(5,5,7,.88),transparent 42%);}',
      '.desktop-splash-title{position:absolute;left:clamp(28px,6vw,82px);',
      'bottom:clamp(112px,17vh,176px);color:#fff8e8;',
      'font-size:clamp(38px,7vw,96px);font-weight:900;line-height:1;',
      'letter-spacing:.08em;text-shadow:0 4px 34px rgba(0,0,0,.82);}',
      '.desktop-splash-subtitle{position:absolute;left:clamp(32px,6vw,88px);',
      'bottom:clamp(78px,13vh,128px);color:#f0d78c;',
      'font-size:clamp(14px,1.6vw,22px);letter-spacing:.22em;}',
      '.desktop-splash-progress{position:absolute;left:clamp(28px,6vw,82px);',
      'right:clamp(28px,6vw,82px);bottom:clamp(36px,7vh,68px);}',
      '.desktop-splash-progress-track{height:6px;border-radius:999px;',
      'overflow:hidden;background:rgba(255,255,255,.18);}',
      '.desktop-splash-progress-bar{height:100%;width:0%;border-radius:999px;',
      'background:linear-gradient(90deg,#8b6914,#f0d78c);',
      'box-shadow:0 0 22px rgba(240,215,140,.42);}',
      '.desktop-splash-progress-text{margin-top:12px;color:rgba(238,228,210,.76);',
      'font-size:13px;letter-spacing:.14em;}',
      '.desktop-dock{position:fixed;left:50%;bottom:16px;z-index:90;',
      'display:flex;gap:8px;align-items:center;transform:translateX(-50%);',
      'padding:10px;border:1px solid rgba(212,167,84,.22);',
      'border-radius:999px;background:rgba(8,8,12,.82);',
      'box-shadow:0 18px 52px rgba(0,0,0,.46);backdrop-filter:blur(18px);}',
      '.desktop-dock a{min-width:64px;padding:10px 12px;border-radius:999px;',
      'color:rgba(238,228,210,.66);text-align:center;text-decoration:none;',
      'font-size:13px;letter-spacing:.08em;}',
      '.desktop-dock a.active,.desktop-dock a:hover{color:#100b04;',
      'background:#f0d78c;}',
      '.desktop-titlebar{position:fixed;top:0;left:0;right:0;z-index:100001;',
      'height:44px;display:flex;align-items:center;border-bottom:1px solid rgba(212,167,84,.16);',
      'background:#09090d;color:rgba(238,228,210,.7);-webkit-app-region:drag;}',
      '.desktop-titlebar-brand{display:flex;align-items:center;gap:9px;min-width:0;padding-left:14px;font-size:13px;}',
      '.desktop-titlebar-brand img{width:22px;height:22px;border-radius:5px;}',
      '.desktop-titlebar-actions{display:flex;height:100%;margin-left:auto;-webkit-app-region:no-drag;}',
      '.desktop-titlebar-actions button{width:48px;height:100%;border:0;border-radius:0;color:rgba(238,228,210,.72);background:transparent;font-size:17px;}',
      '.desktop-titlebar-actions button:hover{background:rgba(255,255,255,.08);}',
      '.desktop-titlebar-actions button:last-child:hover{background:#a83232;color:#fff;}',
      '.desktop-browser{position:fixed;inset:44px 0 0;z-index:99990;display:grid;',
      'grid-template-rows:48px 1fr;background:#09090d;}',
      '.desktop-browser[hidden]{display:none;}',
      '.desktop-browser-bar{display:flex;align-items:center;gap:8px;padding:7px 12px;',
      'border-bottom:1px solid rgba(212,167,84,.18);background:#101014;}',
      '.desktop-browser-bar button{width:34px;height:34px;border:1px solid rgba(212,167,84,.2);',
      'border-radius:6px;color:#f0d78c;background:transparent;}',
      '.desktop-browser-bar button:hover{background:rgba(212,167,84,.1);}',
      '.desktop-browser-title{flex:1;overflow:hidden;color:rgba(238,228,210,.68);',
      'font-size:13px;white-space:nowrap;text-overflow:ellipsis;}',
      '.desktop-browser webview{width:100%;height:100%;background:#fff;}',
      'img[data-src]{filter:saturate(.92);transition:opacity .28s ease,transform .35s ease;}',
      'img.lazy-ready{opacity:1;}',
      '.performance-page-hidden{display:none!important;}',
      '.load-more-row{display:flex;justify-content:center;margin:22px 0;}',
      '.load-more-row button{min-width:180px;min-height:44px;border:1px solid rgba(212,167,84,.22);',
      'border-radius:6px;color:#f0d78c;background:rgba(212,167,84,.08);}',
      '.app-page-backdrop{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none;background:#0d0d10;}',
      '.app-shell{position:relative;z-index:1;}',
      '.app-page-backdrop img,.app-page-backdrop video{position:absolute;inset:0;width:100%;height:100%;',
      'object-fit:cover;opacity:.34;transition:opacity .32s ease;}',
      '.app-page-backdrop video{opacity:.24;}',
      '.app-page-backdrop-shade{position:absolute;inset:0;background:rgba(8,8,11,.72);}',
      '.app-page-backdrop-shade:after{content:"";position:absolute;inset:0;',
      'background:linear-gradient(180deg,rgba(8,8,11,.28),rgba(8,8,11,.82));}',
      '.profile-drawer-backdrop{position:fixed;inset:0;z-index:99970;opacity:0;visibility:hidden;',
      'background:rgba(0,0,0,.58);transition:opacity .2s ease,visibility .2s ease;}',
      '.profile-drawer-backdrop.open{opacity:1;visibility:visible;}',
      '.profile-drawer{position:fixed;top:0;right:0;bottom:0;z-index:99980;width:min(440px,100vw);',
      'overflow:auto;padding:22px;border-left:1px solid rgba(212,167,84,.24);background:#111116;',
      'box-shadow:-24px 0 70px rgba(0,0,0,.48);transform:translateX(102%);transition:transform .2s ease;}',
      '.desktop-client .profile-drawer{top:44px;}',
      '.profile-drawer.open{transform:translateX(0);}',
      '.profile-drawer-head{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:16px;}',
      '.profile-drawer-head h2{margin:0;color:#f0d78c;font-size:20px;}',
      '.profile-drawer-close{width:38px;height:38px;border:1px solid rgba(212,167,84,.22);',
      'border-radius:50%;color:#eee4d2;background:transparent;font-size:22px;}',
      '.profile-drawer .profile-workspace{display:block;margin:0;}',
      '.profile-drawer .profile-identity,.profile-drawer .profile-editor{border-radius:8px;}',
      '.profile-drawer .profile-identity{padding:22px 18px;}',
      '.profile-drawer .profile-editor{margin-top:12px;padding:20px;}',
      '.profile-drawer .profile-actions{grid-template-columns:1fr 1fr;}',
      '.profile-drawer .profile-cloud-row{align-items:flex-start;}',
      '.brand-avatar{transition:border-color .18s ease,transform .18s ease;}',
      '.brand-avatar:hover{border-color:rgba(240,215,140,.62);transform:translateY(-1px);}',
      '.app-shell{view-transition-name:app-content;}',
      '::view-transition-old(app-content){animation:app-page-out .09s ease both;}',
      '::view-transition-new(app-content){animation:app-page-in .18s ease both;}',
      '@keyframes app-page-out{to{opacity:0;transform:translateY(-3px);}}',
      '@keyframes app-page-in{from{opacity:0;transform:translateY(5px);}to{opacity:1;transform:none;}}',
      '.reduced-motion .app-page-backdrop video{display:none!important;}',
      '.reduced-motion *{scroll-behavior:auto!important;}',
      '@media(max-width:560px){.profile-drawer{padding:16px;}.profile-drawer .profile-actions{grid-template-columns:1fr;}}'
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

  function installLazyMedia() {
    var lazyImages = Array.prototype.slice.call(
      document.querySelectorAll('img[data-src]')
    );
    var lazyVideos = Array.prototype.slice.call(
      document.querySelectorAll('video[data-lazy-video]')
    );
    if (!('IntersectionObserver' in window)) {
      lazyImages.forEach(loadImage);
      lazyVideos.forEach(loadVideo);
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }
        if (entry.target.tagName === 'VIDEO') {
          loadVideo(entry.target);
        } else {
          loadImage(entry.target);
        }
        observer.unobserve(entry.target);
      });
    }, {rootMargin: '420px 0px'});
    lazyImages.forEach(function (image) { observer.observe(image); });
    lazyVideos.forEach(function (video) { observer.observe(video); });

    function loadImage(image) {
      if (!image.dataset.src) {
        return;
      }
      image.src = image.dataset.src;
      image.removeAttribute('data-src');
      image.addEventListener('load', function () {
        image.classList.add('lazy-ready');
      }, {once: true});
    }

    function loadVideo(video) {
      var changed = false;
      video.querySelectorAll('source[data-src]').forEach(function (source) {
        source.src = source.dataset.src;
        source.removeAttribute('data-src');
        changed = true;
      });
      if (changed) {
        video.load();
      }
    }
  }

  function isDesktopClient() {
    return !!(
      window.ZhushenDesktop
      && typeof window.ZhushenDesktop.openInternal === 'function'
    );
  }

  function isDesktopInternalUrl(href) {
    return /^https:\/\/(docs\.qq\.com|www\.taptap\.cn|taptap\.cn)\//.test(
      href
    );
  }

  function getDesktopSplashVideo() {
    var mode = localStorage.getItem('zhushen_splash_video_mode') || 'random';
    if (mode === 'none') {
      return '';
    }
    return 'official-posts/492288870839223557/pv.mp4';
  }

  function installDesktopSplash() {
    if (!isDesktopClient()
      || sessionStorage.getItem('zhushen_desktop_splash_seen')) {
      return;
    }
    var videoSrc = getDesktopSplashVideo();
    var entryMode = localStorage.getItem('zhushen_splash_entry_mode')
      || 'skippable';
    if (!videoSrc) {
      return;
    }
    sessionStorage.setItem('zhushen_desktop_splash_seen', 'true');
    var overlay = createElement('div', 'desktop-splash');
    var panel = createElement('div', 'desktop-splash-panel');
    var video = document.createElement('video');
    var fallback = document.createElement('img');
    var shade = createElement('div', 'desktop-splash-shade');
    var title = createElement('div', 'desktop-splash-title', '诸神终应知晓');
    var subtitle = createElement('div', 'desktop-splash-subtitle', '玩家自制史记');
    var progress = createElement('div', 'desktop-splash-progress');
    var progressTrack = createElement('div', 'desktop-splash-progress-track');
    var progressBar = createElement('div', 'desktop-splash-progress-bar');
    var progressText = createElement(
      'div',
      'desktop-splash-progress-text',
      entryMode === 'complete'
        ? '首曝 PV 播放中 0%'
        : '点击可跳过 · 首曝 PV 播放中 0%'
    );
    video.src = videoSrc;
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.loop = false;
    fallback.src = 'splash.jpg';
    fallback.alt = '诸神终应知晓';
    progressTrack.appendChild(progressBar);
    progress.appendChild(progressTrack);
    progress.appendChild(progressText);
    panel.appendChild(video);
    panel.appendChild(fallback);
    panel.appendChild(shade);
    panel.appendChild(title);
    panel.appendChild(subtitle);
    panel.appendChild(progress);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', updateProgress);
    video.addEventListener('ended', markReady);
    video.play().catch(function () {
      video.style.display = 'none';
      fallback.style.display = 'block';
      progressBar.style.width = '100%';
      progressText.textContent = '视频不可自动播放，点击进入档案馆';
      markReady();
    });
    overlay.addEventListener('click', function () {
      if (entryMode !== 'complete' || overlay.classList.contains('ready')) {
        closeSplash();
      }
    });

    function updateProgress() {
      if (!Number.isFinite(video.duration) || video.duration <= 0) {
        return;
      }
      var percent = Math.min(100, Math.round(
        (video.currentTime / video.duration) * 100
      ));
      progressBar.style.width = percent + '%';
      if (percent >= 100) {
        progressText.textContent = '播放完成，点击进入档案馆';
        return;
      }
      progressText.textContent = entryMode === 'complete'
        ? '首曝 PV 播放中 ' + percent + '%'
        : '点击可跳过 · 首曝 PV 播放中 ' + percent + '%';
    }

    function markReady() {
      progressBar.style.width = '100%';
      progressText.textContent = '播放完成，点击进入档案馆';
      overlay.classList.add('ready');
    }

    function closeSplash() {
      if (!overlay.parentElement) {
        return;
      }
      video.pause();
      overlay.classList.add('closing');
      window.setTimeout(function () {
        overlay.remove();
      }, 360);
    }
  }

  function getCurrentPage() {
    return location.pathname.split('/').pop() || HOME_PAGE;
  }

  function installPageBackdrop() {
    if (!document.querySelector('.app-page-backdrop')) {
      var backdrop = createElement('div', 'app-page-backdrop');
      var image = document.createElement('img');
      var video = document.createElement('video');
      var shade = createElement('div', 'app-page-backdrop-shade');
      image.alt = '';
      image.setAttribute('aria-hidden', 'true');
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.setAttribute('aria-hidden', 'true');
      backdrop.appendChild(image);
      backdrop.appendChild(video);
      backdrop.appendChild(shade);
      document.body.insertBefore(backdrop, document.body.firstChild);
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
          video.pause();
        } else if (!video.hidden) {
          video.play().catch(function () {});
        }
      });
    }
    updatePageBackdrop();
    installBackgroundControls();
  }

  function installBackgroundControls() {
    var controls = document.querySelectorAll('[data-desktop-background-mode]');
    var status = document.querySelector('[data-desktop-background-status]');
    var mode = localStorage.getItem(BACKGROUND_MODE_KEY) || 'dynamic';
    controls.forEach(function (button) {
      var buttonMode = button.dataset.desktopBackgroundMode;
      button.classList.toggle('active', buttonMode === mode);
      if (button.dataset.backgroundBound === 'true') {
        return;
      }
      button.dataset.backgroundBound = 'true';
      button.addEventListener('click', function () {
        localStorage.setItem(BACKGROUND_MODE_KEY, buttonMode);
        installBackgroundControls();
        updatePageBackdrop();
      });
    });
    if (status) {
      status.textContent = '首页背景：' + (mode === 'dynamic' ? '动态 PV' : '静态封面');
    }
  }

  function updatePageBackdrop() {
    var backdrop = document.querySelector('.app-page-backdrop');
    if (!backdrop) {
      return;
    }
    var page = getCurrentPage();
    var image = backdrop.querySelector('img');
    var video = backdrop.querySelector('video');
    var mode = localStorage.getItem(BACKGROUND_MODE_KEY) || 'dynamic';
    var profile = {};
    try {
      profile = JSON.parse(localStorage.getItem('zhushen:profile:v1') || '{}');
    } catch (error) {}
    var reducedMotion = !!(profile.preferences && profile.preferences.reducedMotion);
    var useVideo = isDesktopClient()
      && page === HOME_PAGE
      && mode === 'dynamic'
      && !reducedMotion;
    image.src = PAGE_BACKGROUNDS[page] || 'splash.jpg';
    image.hidden = useVideo;
    video.hidden = !useVideo;
    if (!useVideo) {
      video.pause();
      return;
    }
    var videoSrc = 'official-posts/492288870839223557/pv.mp4';
    if (!video.getAttribute('src')) {
      video.src = videoSrc;
    }
    if (!document.hidden) {
      video.play().catch(function () {
        video.hidden = true;
        image.hidden = false;
      });
    }
  }

  function installDesktopDock() {
    if (!isDesktopClient() || document.querySelector('.desktop-dock')) {
      return;
    }
    var items = [
      ['首页', 'zy.html'],
      ['官方', 'official.html'],
      ['角色', 'gfjs.html'],
      ['概念', 'gfgn.html'],
      ['二创', 'wjec.html'],
      ['笑话', 'qyxhhj.html'],
      ['设置', 'settings.html']
    ];
    var current = location.pathname.split('/').pop() || HOME_PAGE;
    var dock = createElement('nav', 'desktop-dock');
    dock.setAttribute('aria-label', '桌面底部导航');
    items.forEach(function (item) {
      var link = createElement('a', '', item[0]);
      link.href = item[1];
      if (item[1] === current) {
        link.classList.add('active');
      }
      dock.appendChild(link);
    });
    document.body.appendChild(dock);
    document.body.classList.add('has-desktop-dock');
  }

  function updateNavigationState() {
    var current = getCurrentPage();
    document.querySelectorAll('.nav-menu a, .desktop-dock a').forEach(function (link) {
      var href = link.getAttribute('href') || '';
      if (!/^[^:#?]+\.html(?:[?#].*)?$/.test(href)) {
        return;
      }
      link.classList.toggle('active', href.split(/[?#]/, 1)[0] === current);
    });
  }

  function installSmoothNavigation() {
    if (window.__zhushenSmoothNavigationInstalled) {
      return;
    }
    window.__zhushenSmoothNavigationInstalled = true;
    document.addEventListener('click', function (event) {
      var link = event.target.closest('a[href]');
      if (!link || event.defaultPrevented || event.button !== 0
        || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
        || link.target || link.hasAttribute('download')) {
        return;
      }
      var href = link.getAttribute('href') || '';
      if (!/^[^:#?]+\.html(?:[?#].*)?$/.test(href)) {
        return;
      }
      var target = new URL(href, location.href);
      if (target.origin !== location.origin) {
        return;
      }
      event.preventDefault();
      navigate(target.href, true);
    });
    window.addEventListener('popstate', function () {
      navigate(location.href, false);
    });

    function navigate(url, pushState) {
      loadPage(url).then(function (html) {
        var parsed = new DOMParser().parseFromString(html, 'text/html');
        var nextMain = parsed.querySelector('main.app-shell');
        var currentMain = document.querySelector('main.app-shell');
        if (!nextMain || !currentMain) {
          throw new Error('页面缺少主内容容器');
        }
        var swap = function () {
          currentMain.replaceWith(document.importNode(nextMain, true));
          document.title = parsed.title || document.title;
          if (pushState) {
            history.pushState({}, '', url);
          }
          document.querySelectorAll('[data-nav-menu].show').forEach(function (menu) {
            menu.classList.remove('show');
          });
          updateNavigationState();
          if (typeof window.ZhushenUIRefresh === 'function') {
            window.ZhushenUIRefresh();
          }
          if (typeof window.ZhushenEnhancementsRefresh === 'function') {
            window.ZhushenEnhancementsRefresh();
          }
          window.scrollTo({top: 0, behavior: 'auto'});
        };
        if (document.startViewTransition
          && !document.documentElement.classList.contains('reduced-motion')) {
          document.startViewTransition(swap);
        } else {
          swap();
        }
      }).catch(function () {
        location.href = url;
      });
    }

    function loadPage(url) {
      return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.onload = function () {
          if ((request.status >= 200 && request.status < 300)
            || (request.status === 0 && request.responseText)) {
            resolve(request.responseText);
            return;
          }
          reject(new Error('HTTP ' + request.status));
        };
        request.onerror = function () {
          reject(new Error('本地页面读取失败'));
        };
        request.send();
      });
    }
  }

  function installDesktopTitlebar() {
    if (!isDesktopClient() || document.querySelector('.desktop-titlebar')) {
      return;
    }
    var bar = createElement('div', 'desktop-titlebar');
    var brand = createElement('div', 'desktop-titlebar-brand');
    var logo = document.createElement('img');
    var title = createElement('span', '', '诸神终应知晓');
    var actions = createElement('div', 'desktop-titlebar-actions');
    var minimize = createElement('button', '', '−');
    var maximize = createElement('button', '', '□');
    var close = createElement('button', '', '×');
    logo.src = 'logo/logo.png';
    logo.alt = '';
    minimize.title = '最小化';
    maximize.title = '最大化';
    close.title = '关闭';
    minimize.addEventListener('click', function () {
      window.ZhushenDesktop.windowMinimize();
    });
    maximize.addEventListener('click', function () {
      window.ZhushenDesktop.windowToggleMaximize();
    });
    close.addEventListener('click', function () {
      window.ZhushenDesktop.windowClose();
    });
    brand.appendChild(logo);
    brand.appendChild(title);
    actions.appendChild(minimize);
    actions.appendChild(maximize);
    actions.appendChild(close);
    bar.appendChild(brand);
    bar.appendChild(actions);
    document.body.appendChild(bar);
  }

  function showDesktopInternalBrowser(href, label) {
    var browser = document.querySelector('.desktop-browser');
    if (!browser) {
      browser = createElement('section', 'desktop-browser');
      var toolbar = createElement('div', 'desktop-browser-bar');
      var back = createElement('button', '', '‹');
      var forward = createElement('button', '', '›');
      var reload = createElement('button', '', '↻');
      var title = createElement('span', 'desktop-browser-title', label || href);
      var external = createElement('button', '', '↗');
      var close = createElement('button', '', '×');
      var view = document.createElement('webview');
      back.title = '返回';
      forward.title = '前进';
      reload.title = '刷新';
      external.title = '在浏览器打开';
      close.title = '关闭';
      view.setAttribute('partition', 'persist:zhushen-internal-browser');
      back.addEventListener('click', function () {
        if (view.canGoBack()) { view.goBack(); }
      });
      forward.addEventListener('click', function () {
        if (view.canGoForward()) { view.goForward(); }
      });
      reload.addEventListener('click', function () { view.reload(); });
      external.addEventListener('click', function () {
        window.open(view.getURL() || view.src, '_blank');
      });
      close.addEventListener('click', function () {
        browser.hidden = true;
        view.src = 'about:blank';
      });
      view.addEventListener('page-title-updated', function (event) {
        title.textContent = event.title || label || href;
      });
      toolbar.appendChild(back);
      toolbar.appendChild(forward);
      toolbar.appendChild(reload);
      toolbar.appendChild(title);
      toolbar.appendChild(external);
      toolbar.appendChild(close);
      browser.appendChild(toolbar);
      browser.appendChild(view);
      document.body.appendChild(browser);
      browser._view = view;
      browser._title = title;
    }
    browser.hidden = false;
    browser._title.textContent = label || href;
    browser._view.src = href;
  }

  function installDesktopMusic() {
    if (!isDesktopClient()
      || typeof window.ZhushenDesktop.setMusicState !== 'function') {
      return;
    }
    var lastSyncedKey = '';
    syncMusic();
    document.querySelectorAll('[data-background-music-set]').forEach(function (button) {
      button.addEventListener('click', function () {
        window.setTimeout(syncMusic, 0);
      });
    });
    document.querySelectorAll('[data-background-music-volume]').forEach(function (input) {
      input.addEventListener('input', syncMusic);
    });
    document.querySelectorAll('[data-background-music-toggle]').forEach(function (button) {
      button.addEventListener('click', function () {
        window.setTimeout(syncMusic, 0);
      });
    });
    document.addEventListener('click', function () {
      syncMusic();
    }, {once: true});

    function syncMusic() {
      var volume = Number(
        localStorage.getItem('zhushen_background_music_volume') || '45'
      );
      var enabled = localStorage.getItem('zhushen_background_music_enabled') !== 'false';
      var normalizedVolume = Math.max(0, Math.min(100, volume));
      var nextKey = String(enabled) + ':' + normalizedVolume;
      if (nextKey === lastSyncedKey) {
        return;
      }
      lastSyncedKey = nextKey;
      window.ZhushenDesktop.setMusicState({
        enabled: enabled,
        volume: normalizedVolume
      }).then(function (state) {
        document.querySelectorAll('[data-background-music-status]').forEach(function (node) {
          if (!state || state.enabled === false) {
            return;
          }
          if (state.playing) {
            node.textContent = '当前音乐：开启 · 正在播放 · 音量 '
              + state.volume + '%';
            return;
          }
          node.textContent = '当前音乐：开启 · 等待首次交互后播放 · 音量 '
            + Math.max(0, Math.min(100, volume)) + '%';
        });
        document.querySelectorAll('[data-background-music-status]').forEach(function (node) {
          node.title = BACKGROUND_MUSIC_TITLE;
          if (node.textContent.indexOf(BACKGROUND_MUSIC_TITLE) < 0) {
            node.textContent += ' \u00b7 ' + BACKGROUND_MUSIC_TITLE;
          }
        });
      }).catch(function () {});
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
        'https://docs.qq.com/sheet/DVXVaQWZOcUFyRlNr?tab=BB08J2',
        '_app_questions'
      );
    }
    if (!hasForumLink) {
      appendNavigationLink(
        navigation,
        '游戏论坛',
        'https://www.taptap.cn/app/513986',
        '_app_forum'
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
    if (isDesktopClient() && isDesktopInternalUrl(href)) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        showDesktopInternalBrowser(href, label);
      });
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

  function installDesktopControls() {
    if (!isDesktopClient()) {
      return;
    }
    var card = document.querySelector('[data-desktop-settings]');
    var alwaysOnTopButton = document.querySelector(
      '[data-desktop-always-on-top]'
    );
    var fullscreenButton = document.querySelector('[data-desktop-fullscreen]');
    var startupButton = document.querySelector('[data-desktop-startup]');
    var startupSetButtons = document.querySelectorAll('[data-desktop-startup-set]');
    var zoomInButton = document.querySelector('[data-desktop-zoom-in]');
    var zoomOutButton = document.querySelector('[data-desktop-zoom-out]');
    var zoomResetButton = document.querySelector('[data-desktop-zoom-reset]');
    var exportButton = document.querySelector('[data-desktop-export]');
    var importButton = document.querySelector('[data-desktop-import]');
    var uninstallButton = document.querySelector('[data-desktop-uninstall]');
    var status = document.querySelector('[data-desktop-status]');
    if (!card) {
      return;
    }
    card.hidden = false;
    if (alwaysOnTopButton) {
      alwaysOnTopButton.addEventListener('click', function () {
        var current = alwaysOnTopButton.dataset.enabled === 'true';
        window.ZhushenDesktop.setAlwaysOnTop(!current)
          .then(updateAlwaysOnTopButton);
      });
      window.ZhushenDesktop.getAlwaysOnTop().then(updateAlwaysOnTopButton);
    }
    if (fullscreenButton) {
      fullscreenButton.addEventListener('click', function () {
        window.ZhushenDesktop.toggleFullscreen().then(function (enabled) {
          fullscreenButton.textContent = enabled ? '退出全屏' : '全屏显示';
        });
      });
    }
    if (startupButton) {
      startupButton.addEventListener('click', function () {
        var current = startupButton.dataset.enabled === 'true';
        window.ZhushenDesktop.setStartupEnabled(!current)
          .then(updateStartupButton);
      });
    }
    window.ZhushenDesktop.getStartupEnabled().then(updateStartupButton);
    startupSetButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        window.ZhushenDesktop.setStartupEnabled(
          button.dataset.desktopStartupSet === 'true'
        ).then(updateStartupButton);
      });
    });
    if (zoomInButton) {
      zoomInButton.addEventListener('click', function () {
        window.ZhushenDesktop.zoomIn().then(updateZoomStatus);
      });
    }
    if (zoomOutButton) {
      zoomOutButton.addEventListener('click', function () {
        window.ZhushenDesktop.zoomOut().then(updateZoomStatus);
      });
    }
    if (zoomResetButton) {
      zoomResetButton.addEventListener('click', function () {
        window.ZhushenDesktop.resetZoom().then(updateZoomStatus);
      });
    }
    if (exportButton) {
      exportButton.addEventListener('click', function () {
        window.ZhushenDesktop.exportData(collectLocalData())
          .then(function (saved) {
            updateDesktopStatus(saved ? '本地数据已导出' : '已取消导出');
          });
      });
    }
    if (importButton) {
      importButton.addEventListener('click', function () {
        window.ZhushenDesktop.importData().then(function (data) {
          if (!data) {
            updateDesktopStatus('已取消导入');
            return;
          }
          restoreLocalData(data);
          updateDesktopStatus('本地数据已导入，正在刷新页面');
          window.setTimeout(function () {
            window.location.reload();
          }, 600);
        });
      });
    }
    if (uninstallButton) {
      uninstallButton.addEventListener('click', function () {
        if (typeof window.ZhushenDesktop.requestUninstall !== 'function') {
          updateDesktopStatus('当前版本不支持应用内卸载');
          return;
        }
        window.ZhushenDesktop.requestUninstall().then(function (result) {
          if (!result || result.started) {
            updateDesktopStatus('卸载流程已启动');
            return;
          }
          updateDesktopStatus('未启动卸载器：' + (result.reason || '已取消'));
        });
      });
    }
    window.ZhushenDesktop.getZoomFactor().then(updateZoomStatus);

    function updateAlwaysOnTopButton(enabled) {
      if (!alwaysOnTopButton) {
        return;
      }
      alwaysOnTopButton.dataset.enabled = enabled ? 'true' : 'false';
      alwaysOnTopButton.textContent = enabled ? '取消窗口置顶' : '窗口置顶';
      alwaysOnTopButton.classList.toggle('active', enabled);
      updateDesktopStatus(enabled ? '窗口已置顶' : '窗口未置顶');
    }

    function updateStartupButton(enabled) {
      if (startupButton) {
        startupButton.dataset.enabled = enabled ? 'true' : 'false';
        startupButton.textContent = enabled ? '关闭开机自启' : '开机自启动';
        startupButton.classList.toggle('active', enabled);
      }
      startupSetButtons.forEach(function (button) {
        var isEnabledButton = button.dataset.desktopStartupSet === 'true';
        button.classList.toggle('active', isEnabledButton === enabled);
      });
      updateDesktopStatus(enabled
        ? '已开启开机自启动'
        : '未开启开机自启动');
    }

    function updateZoomStatus(factor) {
      updateDesktopStatus(
        '当前缩放：' + Math.round(Number(factor || 1) * 100) + '%'
      );
    }

    function updateDesktopStatus(message) {
      if (status) {
        status.textContent = '桌面功能：' + message;
      }
    }

    function collectLocalData() {
      var values = {};
      for (var index = 0; index < localStorage.length; index += 1) {
        var key = localStorage.key(index);
        values[key] = localStorage.getItem(key);
      }
      return {
        app: 'zhushen-archive',
        version: 1,
        exportedAt: new Date().toISOString(),
        localStorage: values
      };
    }

    function restoreLocalData(data) {
      if (!data || !data.localStorage || typeof data.localStorage !== 'object') {
        throw new Error('导入文件格式不正确');
      }
      Object.keys(data.localStorage).forEach(function (key) {
        localStorage.setItem(key, String(data.localStorage[key]));
      });
    }
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

  function installIncrementalLists() {
    installList('.official-timeline', '.official-post', 4, 3);
    installList('main.app-shell', '.artist-block', 6, 4);

    function installList(containerSelector, itemSelector, initialCount, step) {
      var container = document.querySelector(containerSelector);
      if (!container) {
        return;
      }
      var items = Array.prototype.slice.call(
        container.querySelectorAll(itemSelector)
      );
      if (items.length <= initialCount) {
        return;
      }
      var visibleCount = initialCount;
      var row = createElement('div', 'load-more-row');
      var button = createElement('button', '', '加载更多');
      row.appendChild(button);
      container.parentElement.insertBefore(row, container.nextSibling);
      button.addEventListener('click', function () {
        visibleCount = Math.min(items.length, visibleCount + step);
        sync();
      });
      sync();

      function sync() {
        items.forEach(function (item, index) {
          item.classList.toggle('performance-page-hidden', index >= visibleCount);
        });
        button.textContent = visibleCount >= items.length
          ? '已显示全部'
          : '加载更多（' + visibleCount + ' / ' + items.length + '）';
        button.disabled = visibleCount >= items.length;
      }
    }
  }

  function installProfileDrawer() {
    if (document.querySelector('.profile-drawer')) {
      return;
    }
    var backdrop = createElement('div', 'profile-drawer-backdrop');
    var drawer = createElement('aside', 'profile-drawer');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.innerHTML = [
      '<div class="profile-drawer-head">',
        '<h2>个人档案</h2>',
        '<button class="profile-drawer-close" type="button" title="关闭" aria-label="关闭">×</button>',
      '</div>',
      '<section class="profile-workspace" data-profile-page>',
        '<aside class="profile-identity">',
          '<button class="profile-avatar-button" type="button" data-profile-avatar-button title="更换头像">',
            '<img data-profile-avatar-image alt="用户头像" hidden>',
            '<span data-profile-avatar-fallback>旅</span>',
          '</button>',
          '<input data-profile-avatar-input type="file" accept="image/png,image/jpeg,image/webp" hidden>',
          '<strong data-profile-display-name>未命名旅人</strong>',
          '<span class="profile-number" data-profile-id>ID 读取中</span>',
          '<p data-profile-display-bio>把喜欢的资料、设定和回忆收进自己的空间。</p>',
        '</aside>',
        '<div class="profile-editor">',
          '<div class="profile-section-head">',
            '<div><p class="eyebrow">Local Profile</p><h2>本地资料</h2></div>',
            '<span class="profile-save-state" data-profile-status>保存在当前设备</span>',
          '</div>',
          '<label class="profile-field"><span>昵称</span><input data-profile-nickname maxlength="24" placeholder="未命名旅人"></label>',
          '<label class="profile-field"><span>个人备注</span><textarea data-profile-bio maxlength="120" rows="4" placeholder="写下一句属于你的档案说明"></textarea></label>',
          '<div class="profile-preferences">',
            '<label><input data-profile-music type="checkbox"> 保持背景音乐</label>',
            '<label><input data-profile-motion type="checkbox"> 减少动态效果</label>',
            '<label><input data-profile-remember type="checkbox"> 记住浏览记录</label>',
          '</div>',
          '<div class="profile-actions">',
            '<button class="wide-button profile-primary" type="button" data-profile-save>保存档案</button>',
            '<button class="wide-button" type="button" data-profile-export>导出 JSON</button>',
            '<button class="wide-button" type="button" data-profile-import>导入 JSON</button>',
            '<input data-profile-import-input type="file" accept="application/json" hidden>',
          '</div>',
          '<div class="profile-cloud-row">',
            '<div><strong>云备份</strong><p>未来接入账号同步时会沿用当前档案结构。</p></div>',
            '<button type="button" disabled>敬请期待</button>',
          '</div>',
        '</div>',
      '</section>'
    ].join('');
    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);
    drawer.querySelector('.profile-drawer-close').addEventListener('click', close);
    backdrop.addEventListener('click', close);
    document.addEventListener('click', function (event) {
      var trigger = event.target.closest('[data-profile-open]');
      if (!trigger) {
        return;
      }
      event.preventDefault();
      open();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && drawer.classList.contains('open')) {
        close();
      }
    });
    installProfilePage();

    function open() {
      drawer.classList.add('open');
      backdrop.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
    }

    function close() {
      drawer.classList.remove('open');
      backdrop.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
    }
  }

  function installProfilePage() {
    var page = document.querySelector('[data-profile-page]');
    if (!page) {
      return;
    }
    var key = 'zhushen:profile:v1';
    var avatarButton = page.querySelector('[data-profile-avatar-button]');
    var avatarInput = page.querySelector('[data-profile-avatar-input]');
    var avatarImage = page.querySelector('[data-profile-avatar-image]');
    var avatarFallback = page.querySelector('[data-profile-avatar-fallback]');
    var nicknameInput = page.querySelector('[data-profile-nickname]');
    var bioInput = page.querySelector('[data-profile-bio]');
    var musicInput = page.querySelector('[data-profile-music]');
    var motionInput = page.querySelector('[data-profile-motion]');
    var rememberInput = page.querySelector('[data-profile-remember]');
    var importInput = page.querySelector('[data-profile-import-input]');
    var status = page.querySelector('[data-profile-status]');
    var profile = readProfile();
    render();

    avatarButton.addEventListener('click', function () { avatarInput.click(); });
    avatarInput.addEventListener('change', function () {
      var file = avatarInput.files && avatarInput.files[0];
      if (!file) {
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setStatus('头像不能超过 2 MB');
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        profile.avatarDataUrl = String(reader.result || '');
        saveFromForm();
      };
      reader.readAsDataURL(file);
    });
    page.querySelector('[data-profile-save]').addEventListener('click', saveFromForm);
    page.querySelector('[data-profile-export]').addEventListener('click', exportProfile);
    page.querySelector('[data-profile-import]').addEventListener('click', function () {
      if (isDesktopClient() && typeof window.ZhushenDesktop.importData === 'function') {
        window.ZhushenDesktop.importData().then(function (data) {
          if (data) { applyImportedProfile(data.profile || data); }
        });
        return;
      }
      importInput.click();
    });
    importInput.addEventListener('change', function () {
      var file = importInput.files && importInput.files[0];
      if (!file) {
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var data = JSON.parse(String(reader.result || '{}'));
          applyImportedProfile(data.profile || data);
        } catch (error) {
          setStatus('导入失败：JSON 格式不正确');
        }
      };
      reader.readAsText(file, 'utf-8');
    });

    function createNumericId() {
      var random = Math.floor(Math.random() * 900000000) + 100000000;
      return String(random);
    }

    function readProfile() {
      try {
        return normalize(JSON.parse(localStorage.getItem(key) || '{}'));
      } catch (error) {
        return normalize({});
      }
    }

    function normalize(value) {
      value = value && typeof value === 'object' ? value : {};
      return {
        schemaVersion: 1,
        id: /^\d{9}$/.test(String(value.id || '')) ? String(value.id) : createNumericId(),
        nickname: String(value.nickname || '未命名旅人').slice(0, 24),
        bio: String(value.bio || '把喜欢的资料、设定和回忆收进自己的空间。').slice(0, 120),
        avatarDataUrl: /^data:image\/(png|jpeg|webp);base64,/.test(String(value.avatarDataUrl || ''))
          ? String(value.avatarDataUrl)
          : '',
        preferences: {
          music: !value.preferences || value.preferences.music !== false,
          reducedMotion: !!(value.preferences && value.preferences.reducedMotion),
          rememberLastPage: !value.preferences || value.preferences.rememberLastPage !== false
        },
        createdAt: value.createdAt || new Date().toISOString(),
        updatedAt: value.updatedAt || new Date().toISOString()
      };
    }

    function saveFromForm() {
      profile.nickname = (nicknameInput.value.trim() || '未命名旅人').slice(0, 24);
      profile.bio = bioInput.value.trim().slice(0, 120);
      profile.preferences.music = musicInput.checked;
      profile.preferences.reducedMotion = motionInput.checked;
      profile.preferences.rememberLastPage = rememberInput.checked;
      profile.updatedAt = new Date().toISOString();
      localStorage.setItem(key, JSON.stringify(profile));
      localStorage.setItem('zhushen_background_music_enabled', String(profile.preferences.music));
      document.documentElement.classList.toggle('reduced-motion', profile.preferences.reducedMotion);
      render();
      updatePageBackdrop();
      setStatus('已保存到当前设备');
    }

    function render() {
      nicknameInput.value = profile.nickname;
      bioInput.value = profile.bio;
      musicInput.checked = profile.preferences.music;
      motionInput.checked = profile.preferences.reducedMotion;
      rememberInput.checked = profile.preferences.rememberLastPage;
      page.querySelector('[data-profile-display-name]').textContent = profile.nickname;
      page.querySelector('[data-profile-display-bio]').textContent = profile.bio;
      page.querySelector('[data-profile-id]').textContent = 'ID ' + profile.id;
      avatarFallback.textContent = profile.nickname.charAt(0) || '旅';
      avatarImage.hidden = !profile.avatarDataUrl;
      avatarFallback.hidden = !!profile.avatarDataUrl;
      if (profile.avatarDataUrl) {
        avatarImage.src = profile.avatarDataUrl;
      }
      document.querySelectorAll('.brand-avatar img').forEach(function (image) {
        image.src = profile.avatarDataUrl || 'logo/logo.png';
        image.alt = profile.nickname;
      });
    }

    function applyImportedProfile(value) {
      profile = normalize(value);
      localStorage.setItem(key, JSON.stringify(profile));
      render();
      setStatus('档案已导入');
    }

    function exportProfile() {
      profile.updatedAt = new Date().toISOString();
      localStorage.setItem(key, JSON.stringify(profile));
      if (isDesktopClient() && typeof window.ZhushenDesktop.exportData === 'function') {
        window.ZhushenDesktop.exportData({profile: profile}).then(function (saved) {
          setStatus(saved ? '档案已导出' : '已取消导出');
        });
        return;
      }
      var blob = new Blob([JSON.stringify(profile, null, 2)], {type: 'application/json'});
      var link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'zhushen-profile-' + profile.id + '.json';
      link.click();
      URL.revokeObjectURL(link.href);
      setStatus('档案已导出');
    }

    function setStatus(message) {
      status.textContent = message;
    }
  }

  function run() {
    installStyles();
    if (isDesktopClient()) {
      document.body.classList.add('desktop-client');
    }
    hideDuplicateNavigation();
    installDesktopTitlebar();
    installDesktopDock();
    updateNavigationState();
    installProfileDrawer();
    installPageBackdrop();
    installDesktopSplash();
    installDesktopMusic();
    installSmoothNavigation();
    window.ZhushenEnhancementsRefresh = refreshPageEnhancements;
    refreshPageEnhancements();
  }

  function refreshPageEnhancements() {
    configureImages();
    installLazyMedia();
    installDesktopControls();
    installIncrementalLists();
    installBackgroundControls();
    updatePageBackdrop();
    installCountdown();
    showDisclaimer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, {once: true});
  } else {
    run();
  }
})();
