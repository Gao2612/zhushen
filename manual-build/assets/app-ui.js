(function () {
  'use strict';

  var favoritesKey = 'zhushen:favorites:v1';
  var recentKey = 'zhushen:recent:v1';

  function readList(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (error) {
      return [];
    }
  }

  function writeList(key, list) {
    localStorage.setItem(key, JSON.stringify(list.slice(0, 80)));
  }

  function toggleFavorite(id, title, href) {
    var list = readList(favoritesKey);
    var index = list.findIndex(function (item) { return item.id === id; });
    if (index >= 0) {
      list.splice(index, 1);
    } else {
      list.unshift({id: id, title: title, href: href});
    }
    writeList(favoritesKey, list);
    syncFavorites();
  }

  function syncFavorites() {
    var list = readList(favoritesKey);
    var ids = list.map(function (item) { return item.id; });
    document.querySelectorAll('[data-favorite]').forEach(function (button) {
      button.classList.toggle('active', ids.indexOf(button.dataset.favorite) >= 0);
      button.textContent = ids.indexOf(button.dataset.favorite) >= 0 ? '已收藏' : '收藏';
    });
    document.querySelectorAll('[data-favorite-list]').forEach(function (node) {
      if (list.length === 0) {
        node.innerHTML = '<p>暂无收藏。点资料卡片里的收藏按钮后，会在这里显示。</p>';
        return;
      }
      node.innerHTML = list.slice(0, 6).map(function (item) {
        return '<a href="' + item.href + '">' + item.title + '</a>';
      }).join('');
    });
  }

  function installFavorites() {
    document.addEventListener('click', function (event) {
      var button = event.target.closest('[data-favorite]');
      if (!button) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      var card = button.closest('.archive-card');
      var title = card ? card.querySelector('h3').textContent : '收藏';
      var link = card && card.querySelector('a') ? card.querySelector('a') : null;
      var href = link ? link.getAttribute('href') : location.pathname.split('/').pop();
      toggleFavorite(button.dataset.favorite, title, href);
    });
    syncFavorites();
  }

  function installSearch() {
    document.querySelectorAll('[data-search]').forEach(function (input) {
      input.addEventListener('input', function () {
        var keyword = input.value.trim().toLowerCase();
        document.querySelectorAll('[data-search-text]').forEach(function (node) {
          var text = node.dataset.searchText.toLowerCase();
          node.classList.toggle('is-hidden', keyword && text.indexOf(keyword) < 0);
        });
      });
    });
  }

  function installFilters() {
    document.querySelectorAll('[data-filter-group]').forEach(function (group) {
      var buttons = Array.from(group.querySelectorAll('[data-filter]'));
      buttons.forEach(function (button, index) {
        if (index === 0) {
          button.classList.add('active');
        }
        button.addEventListener('click', function () {
          buttons.forEach(function (item) { item.classList.remove('active'); });
          button.classList.add('active');
          var filter = button.dataset.filter;
          document.querySelectorAll('.archive-card, .official-post').forEach(function (card) {
            var kind = card.dataset.kind || '';
            var text = card.dataset.searchText || '';
            var visible = filter === '全部' || kind.indexOf(filter) >= 0 || text.indexOf(filter) >= 0;
            card.classList.toggle('is-hidden', !visible);
          });
        });
      });
    });
  }

  function installLightbox() {
    var box = document.getElementById('lightbox');
    var image = document.getElementById('lightboxImg');
    var caption = document.getElementById('lightboxCaption');
    var current = null;
    if (!box || !image) {
      return;
    }
    document.addEventListener('click', function (event) {
      var link = event.target.closest('[data-lightbox-src]');
      if (!link) {
        return;
      }
      event.preventDefault();
      current = {
        src: link.dataset.lightboxSrc,
        title: getLightboxTitle(link)
      };
      image.src = current.src;
      image.alt = current.title;
      caption.textContent = current.title;
      box.classList.add('active');
      box.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('lightbox-open');
    });
    document.querySelectorAll('[data-lightbox-close]').forEach(function (button) {
      button.addEventListener('click', close);
    });
    box.addEventListener('click', function (event) {
      if (event.target === box) {
        close();
      }
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        close();
      }
    });
    document.querySelectorAll('[data-favorite-current]').forEach(function (button) {
      button.addEventListener('click', function () {
        if (current) {
          toggleFavorite('lightbox:' + current.src, current.title, current.src);
        }
      });
    });
    function close() {
      box.classList.remove('active');
      box.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('lightbox-open');
      image.removeAttribute('src');
      image.removeAttribute('alt');
    }

    function getLightboxTitle(link) {
      var archiveCard = link.closest('.archive-card');
      var officialPost = link.closest('.official-post');
      var titleNode = archiveCard ? archiveCard.querySelector('h3') : null;
      var postTitleNode = officialPost ? officialPost.querySelector('h2') : null;
      var labelNode = link.querySelector('span');
      var imageNode = link.querySelector('img');
      var archiveTitle = titleNode ? titleNode.textContent : '';
      var officialTitle = postTitleNode ? postTitleNode.textContent : '';
      var mediaTitle = labelNode
        ? labelNode.textContent
        : imageNode
          ? imageNode.alt
          : '';
      var title = [officialTitle, mediaTitle].filter(Boolean).join(' · ');
      return title || archiveTitle || mediaTitle || '图片预览';
    }
  }

  function installNavigation() {
    document.querySelectorAll('[data-nav-toggle]').forEach(function (button) {
      button.addEventListener('click', function () {
        var menu = document.querySelector('[data-nav-menu]');
        if (menu) {
          menu.classList.toggle('show');
        }
      });
    });
  }

  function installNativeVideoBridge() {
    var canUseNativeVideo = !!(window.Android && window.Android.openNativeVideo);
    document.querySelectorAll('[data-native-video-src]').forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (canUseNativeVideo) {
          try {
            window.Android.openNativeVideo(
              button.dataset.nativeVideoSrc,
              button.dataset.nativeVideoTitle || '视频播放'
            );
            return;
          } catch (error) {
            canUseNativeVideo = false;
          }
        }
        var article = button.closest('article');
        var video = article ? article.querySelector('video') : null;
        if (video) {
          video.play();
        }
      });
    });
    if (!canUseNativeVideo) {
      return;
    }
    document.querySelectorAll('video').forEach(function (video) {
      video.addEventListener('click', function (event) {
        var sourceNode = video.querySelector('source');
        var source = video.currentSrc || (sourceNode ? sourceNode.getAttribute('src') : '');
        if (!source) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        video.pause();
        window.Android.openNativeVideo(source, getVideoTitle(video));
      }, true);
    });

    function getVideoTitle(video) {
      var article = video.closest('article');
      var label = article ? article.querySelector('p') : null;
      var post = video.closest('.official-post');
      var title = post ? post.querySelector('h2') : null;
      return [title ? title.textContent : '', label ? label.textContent : '']
        .filter(Boolean)
        .join(' · ') || '视频播放';
    }
  }

  function installSettings() {
    var orientationLabels = {
      portrait: '竖屏',
      landscape: '横屏',
      auto: '横竖切换'
    };
    var splashVideoLabels = {"random":"随机播放","none":"关闭启动视频","atal":"阿塔尔","atal_skill":"阿塔尔技能特效","atal_huimu":"阿塔尔回睦","dehenu":"德赫奴","dehenu_skill":"德赫奴技能"};

    function getOrientationMode() {
      if (window.Android && typeof window.Android.getOrientationMode === 'function') {
        return window.Android.getOrientationMode();
      }
      return localStorage.getItem('zhushen_orientation_mode') || 'auto';
    }

    function setOrientationMode(mode) {
      if (window.Android && typeof window.Android.setOrientationMode === 'function') {
        window.Android.setOrientationMode(mode);
        return;
      }
      localStorage.setItem('zhushen_orientation_mode', mode);
    }

    function syncOrientationControls() {
      var mode = getOrientationMode();
      document.querySelectorAll('[data-orientation-option]').forEach(function (button) {
        button.classList.toggle('active', button.dataset.orientationOption === mode);
      });
      document.querySelectorAll('[data-orientation-status]').forEach(function (node) {
        node.textContent = '当前方向：' + (orientationLabels[mode] || '横竖切换');
      });
    }

    function getSplashVideoMode() {
      if (window.Android && typeof window.Android.getSplashVideoMode === 'function') {
        return window.Android.getSplashVideoMode();
      }
      return localStorage.getItem('zhushen_splash_video_mode') || 'random';
    }

    function setSplashVideoMode(mode) {
      if (window.Android && typeof window.Android.setSplashVideoMode === 'function') {
        window.Android.setSplashVideoMode(mode);
        return;
      }
      localStorage.setItem('zhushen_splash_video_mode', mode);
    }

    function syncSplashVideoControls() {
      var mode = getSplashVideoMode();
      document.querySelectorAll('[data-splash-video-option]').forEach(function (button) {
        button.classList.toggle('active', button.dataset.splashVideoOption === mode);
      });
      document.querySelectorAll('[data-splash-video-status]').forEach(function (node) {
        node.textContent = '当前视频：' + (splashVideoLabels[mode] || '随机播放');
      });
    }

    function isBackgroundMusicEnabled() {
      if (window.Android && typeof window.Android.isBackgroundMusicEnabled === 'function') {
        return window.Android.isBackgroundMusicEnabled();
      }
      return localStorage.getItem('zhushen_background_music_enabled') !== 'false';
    }

    function setBackgroundMusicEnabled(enabled) {
      if (window.Android && typeof window.Android.setBackgroundMusicEnabled === 'function') {
        window.Android.setBackgroundMusicEnabled(enabled);
        return;
      }
      localStorage.setItem('zhushen_background_music_enabled', String(enabled));
    }

    function getBackgroundMusicVolume() {
      if (window.Android && typeof window.Android.getBackgroundMusicVolume === 'function') {
        return window.Android.getBackgroundMusicVolume();
      }
      return Number(localStorage.getItem('zhushen_background_music_volume') || '45');
    }

    function setBackgroundMusicVolume(percent) {
      var normalizedPercent = Math.max(0, Math.min(100, Number(percent) || 0));
      if (window.Android && typeof window.Android.setBackgroundMusicVolume === 'function') {
        window.Android.setBackgroundMusicVolume(normalizedPercent);
        return;
      }
      localStorage.setItem('zhushen_background_music_volume', String(normalizedPercent));
    }

    function syncBackgroundMusicControls() {
      var enabled = isBackgroundMusicEnabled();
      var volume = getBackgroundMusicVolume();
      document.querySelectorAll('[data-background-music-toggle]').forEach(function (button) {
        button.classList.toggle('active', enabled);
        button.textContent = enabled ? '关闭背景音乐' : '开启背景音乐';
      });
      document.querySelectorAll('[data-background-music-set]').forEach(function (button) {
        var buttonEnabled = button.dataset.backgroundMusicSet === 'true';
        button.classList.toggle('active', buttonEnabled === enabled);
      });
      document.querySelectorAll('[data-background-music-volume]').forEach(function (input) {
        input.value = String(volume);
      });
      document.querySelectorAll('[data-background-music-status]').forEach(function (node) {
        node.textContent = '当前音乐：' + (enabled ? '开启' : '关闭') + ' · 音量 ' + volume + '%';
      });
    }

    document.querySelectorAll('[data-clear-favorites]').forEach(function (button) {
      button.addEventListener('click', function () {
        localStorage.removeItem(favoritesKey);
        syncFavorites();
        alert('收藏已清空');
      });
    });
    document.querySelectorAll('[data-clear-disclaimer]').forEach(function (button) {
      button.addEventListener('click', function () {
        if (window.Android) {
          window.Android.setSkipDisclaimer(false);
        }
        alert('首次声明提示已恢复');
      });
    });
    document.querySelectorAll('[data-orientation-option]').forEach(function (button) {
      button.addEventListener('click', function () {
        setOrientationMode(button.dataset.orientationOption);
        syncOrientationControls();
      });
    });
    document.querySelectorAll('[data-splash-video-option]').forEach(function (button) {
      button.addEventListener('click', function () {
        setSplashVideoMode(button.dataset.splashVideoOption);
        syncSplashVideoControls();
      });
    });
    document.querySelectorAll('[data-background-music-toggle]').forEach(function (button) {
      button.addEventListener('click', function () {
        setBackgroundMusicEnabled(!isBackgroundMusicEnabled());
        syncBackgroundMusicControls();
      });
    });
    document.querySelectorAll('[data-background-music-set]').forEach(function (button) {
      button.addEventListener('click', function () {
        setBackgroundMusicEnabled(button.dataset.backgroundMusicSet === 'true');
        syncBackgroundMusicControls();
      });
    });
    document.querySelectorAll('[data-background-music-volume]').forEach(function (input) {
      input.addEventListener('input', function () {
        setBackgroundMusicVolume(input.value);
        syncBackgroundMusicControls();
      });
    });
    syncOrientationControls();
    syncSplashVideoControls();
    syncBackgroundMusicControls();
  }

  function recordRecent() {
    var title = document.title;
    var href = location.pathname.split('/').pop();
    var list = readList(recentKey).filter(function (item) { return item.href !== href; });
    list.unshift({title: title, href: href});
    writeList(recentKey, list);
  }

  installNavigation();
  installSearch();
  installFilters();
  installLightbox();
  installNativeVideoBridge();
  installFavorites();
  installSettings();
  recordRecent();
})();
