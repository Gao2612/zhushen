package com.zhushen.game;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ActivityInfo;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.MotionEvent;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.view.animation.AlphaAnimation;
import android.view.animation.Animation;
import android.view.animation.ScaleAnimation;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.PopupMenu;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.Collections;

public class MainActivity extends Activity {

    private WebView webView;
    private ImageView splash;
    private TextView hintText;
    private LinearLayout loadingOverlay;
    private LinearLayout tabBar;
    private ProgressBar bar;
    private Vibrator vibrator;
    private boolean disclaimerShown = false;
    private boolean exitTwice = false;
    private boolean firstLoad = true;
    private boolean gameStarted = false;
    private SharedPreferences prefs;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Start in landscape for splash
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);

        vibrator = (Vibrator) getSystemService(VIBRATOR_SERVICE);
        prefs = getSharedPreferences("zhushen_prefs", MODE_PRIVATE);

        // ---- Status bar ----
        Window w = getWindow();
        w.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        w.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        w.setStatusBarColor(Color.parseColor("#0a0a0f"));
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            w.setNavigationBarColor(Color.TRANSPARENT);
        }
        applyImmersiveSystemBars();

        // ---- Root ----
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.parseColor("#0a0a0f"));

        // Progress bar
        bar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        bar.setProgressDrawable(getResources().getDrawable(R.drawable.progress_bar));
        bar.setVisibility(View.GONE);
        root.addView(bar, new FrameLayout.LayoutParams(-1, dp(3)));

        // Loading overlay
        loadingOverlay = new LinearLayout(this);
        loadingOverlay.setBackgroundColor(Color.parseColor("#0a0a0f"));
        loadingOverlay.setVisibility(View.GONE);
        loadingOverlay.setGravity(android.view.Gravity.CENTER);
        loadingOverlay.setOrientation(LinearLayout.VERTICAL);
        TextView loadText = new TextView(this);
        loadText.setText("加载中…");
        loadText.setTextColor(Color.parseColor("#f0d78c"));
        loadText.setTextSize(16);
        loadText.setAlpha(0.6f);
        loadingOverlay.addView(loadText);
        root.addView(loadingOverlay, new FrameLayout.LayoutParams(-1, -1));

        // WebView
        webView = new WebView(this);
        webView.setBackgroundColor(Color.parseColor("#1A1A1A"));
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        webView.setVisibility(View.INVISIBLE);

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setAllowFileAccessFromFileURLs(true);
        s.setAllowUniversalAccessFromFileURLs(true);

        webView.setOverScrollMode(WebView.OVER_SCROLL_NEVER);
        webView.setVerticalScrollBarEnabled(false);
        webView.setHorizontalScrollBarEnabled(false);
        webView.setNestedScrollingEnabled(true);

        // Smart long-press: menu on images, suppressed otherwise
        webView.setOnLongClickListener(new View.OnLongClickListener() {
            public boolean onLongClick(View v) {
                WebView.HitTestResult hit = webView.getHitTestResult();
                if (hit != null && hit.getType() == WebView.HitTestResult.IMAGE_TYPE) {
                    final String imgUrl = hit.getExtra();
                    PopupMenu popup = new PopupMenu(MainActivity.this, v);
                    popup.getMenu().add("💾 保存图片");
                    popup.getMenu().add("📤 分享图片");
                    popup.setOnMenuItemClickListener(new PopupMenu.OnMenuItemClickListener() {
                        public boolean onMenuItemClick(android.view.MenuItem item) {
                            String title = item.getTitle().toString();
                            if (title.contains("分享")) {
                                Intent share = new Intent(Intent.ACTION_SEND);
                                share.setType("image/*");
                                share.putExtra(Intent.EXTRA_TEXT, imgUrl);
                                startActivity(Intent.createChooser(share, "分享图片"));
                            } else {
                                Toast.makeText(MainActivity.this, "图片链接已复制", Toast.LENGTH_SHORT).show();
                            }
                            return true;
                        }
                    });
                    popup.show();
                    return true;
                }
                return true; // suppress default long-press on non-images
            }
        });
        webView.setLongClickable(true);
        webView.setFocusableInTouchMode(true);
        webView.addJavascriptInterface(new Object() {
            @android.webkit.JavascriptInterface
            public void setSkipDisclaimer(boolean skip) {
                prefs.edit().putBoolean("disclaimer_skip", skip).apply();
            }
        }, "Android");

        webView.setWebChromeClient(new WebChromeClient() {
            public void onProgressChanged(WebView v, int p) {
                if (p == 100) {
                    bar.setVisibility(View.GONE);
                    loadingOverlay.setVisibility(View.GONE);
                } else {
                    bar.setVisibility(View.VISIBLE);
                    bar.setProgress(p);
                }
            }
        });

        webView.setWebViewClient(new WebViewClient() {

            // Intercept video/audio requests — handle Range for proper streaming
            @Override
            public android.webkit.WebResourceResponse shouldInterceptRequest(WebView view, android.webkit.WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (url.contains(".mp4") || url.contains(".webm") || url.contains(".ogg") || url.contains(".MP4")) {
                    try {
                        // Extract asset path from URL (strip scheme + decode)
                        String path = url;
                        int idx = path.indexOf("assets/");
                        if (idx >= 0) path = path.substring(idx + 7); // after "assets/"
                        else {
                            idx = path.indexOf("android_asset/");
                            if (idx >= 0) path = path.substring(idx + 14);
                        }
                        try { path = java.net.URLDecoder.decode(path, "UTF-8"); } catch (Exception e) {}

                        android.content.res.AssetFileDescriptor afd = getAssets().openFd(path);
                        long len = afd.getLength();
                        java.io.FileDescriptor fd = afd.getFileDescriptor();

                        String rangeHeader = request.getRequestHeaders().get("Range");
                        if (rangeHeader != null) {
                            String rangeVal = rangeHeader.replace("bytes=", "");
                            String[] parts = rangeVal.split("-");
                            long start = Long.parseLong(parts[0]);
                            long end = parts.length > 1 && !parts[1].isEmpty() ? Long.parseLong(parts[1]) : len - 1;
                            if (end >= len) end = len - 1;

                            java.io.FileInputStream fis = new java.io.FileInputStream(fd);
                            fis.getChannel().position(afd.getStartOffset() + start);
                            return new android.webkit.WebResourceResponse("video/mp4", null, 206, "OK",
                                Collections.singletonMap("Content-Range", "bytes " + start + "-" + end + "/" + len), fis);
                        }
                        java.io.FileInputStream fis = new java.io.FileInputStream(fd);
                        fis.getChannel().position(afd.getStartOffset());
                        return new android.webkit.WebResourceResponse("video/mp4", null, 200, "OK", null, fis);
                    } catch (Exception e) {
                        return null;
                    }
                }
                return null;
            }

            public boolean shouldOverrideUrlLoading(WebView v, String url) {
                // External schemes: TapTap, QQ docs, QQ groups
                if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("mqqapi://")) {
                    if (url.contains("taptap.cn") || url.contains("docs.qq.com") || url.startsWith("mqqapi://")) {
                        try {
                            Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            startActivity(i);
                        } catch (Exception e) {
                            Toast.makeText(MainActivity.this, "请先安装QQ", Toast.LENGTH_SHORT).show();
                        }
                        return true;
                    }
                }
                if (!url.startsWith("file://")) showLoading();
                return false;
            }

            public void onReceivedError(WebView v, android.webkit.WebResourceRequest req, android.webkit.WebResourceError err) {
                if (req.isForMainFrame()) {
                    v.loadUrl("about:blank");
                    v.loadUrl("javascript:document.write('<div style=\"color:#f0d78c;text-align:center;padding-top:40%;" +
                        "font-size:18px;background:#0a0a0f;height:100vh;\">⚠ 加载失败<br><span style=\"font-size:13px;" +
                        "opacity:0.5;\">请检查网络后重试</span></div>')");
                    loadingOverlay.setVisibility(View.GONE);
                }
            }

            public void onPageStarted(WebView v, String url, android.graphics.Bitmap favicon) {
                super.onPageStarted(v, url, favicon);
                if (!firstLoad) showLoading();
            }

            public void onPageFinished(WebView v, String url) {
                if (firstLoad) {
                    firstLoad = false;
                    // Switch to portrait under the loading overlay (no visual jump)
                    setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
                    if (hintText != null) {
                        hintText.clearAnimation();
                        ((FrameLayout)hintText.getParent()).removeView(hintText);
                        hintText = null;
                    }
                    // Short delay then fade splash → reveal WebView
                    new Handler().postDelayed(new Runnable() {
                        public void run() {
                            AlphaAnimation fade = new AlphaAnimation(1f, 0f);
                            fade.setDuration(300);
                            fade.setAnimationListener(new Animation.AnimationListener() {
                                public void onAnimationStart(Animation a) {}
                                public void onAnimationEnd(Animation a) {
                                    splash.setVisibility(View.GONE);
                                    webView.setVisibility(View.VISIBLE);
                                    loadingOverlay.setVisibility(View.GONE);
                                    tabBar.setVisibility(View.VISIBLE);
                                }
                                public void onAnimationRepeat(Animation a) {}
                            });
                            splash.startAnimation(fade);
                        }
                    }, 150);
                } else {
                    // Page transition: fade webview briefly
                    AlphaAnimation wfIn = new AlphaAnimation(0.6f, 1f);
                    wfIn.setDuration(200);
                    webView.startAnimation(wfIn);
                    new Handler().postDelayed(new Runnable() {
                        public void run() { loadingOverlay.setVisibility(View.GONE); }
                    }, 200);
                }

                // Injections (only once per page load — not duplicated)
                v.loadUrl("javascript:" +
                    "if(!window._CSS){" +
                    "window._CSS=1;" +
                    "*{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;}" +
                    "input,textarea{-webkit-user-select:text;user-select:text;}" +
                    "document.body.style.background='#1A1A1A';" +
                    "document.body.style.backgroundImage='none';" +
                    "var ps=document.createElement('style');" +
                    "ps.textContent=" +
                    "'html{overflow-y:auto;-webkit-overflow-scrolling:touch;}" +
                    "body{will-change:scroll-position;contain:style paint;}" +
                    "body{padding-top:max(80px,env(safe-area-inset-top));" +
                    "padding-bottom:env(safe-area-inset-bottom);" +
                    "padding-left:env(safe-area-inset-left);" +
                    "padding-right:env(safe-area-inset-right);}" +
                    "img,video{content-visibility:auto;contain-intrinsic-size:auto 300px;}" +
                    "section,main,footer{contain:style paint;}" +
                    ".navbar{transform:translateZ(0);will-change:transform;}" +
                    "html{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}';" +
                    "document.head.appendChild(ps);" +
                    "var imgs=document.querySelectorAll('img');" +
                    "for(var i=0;i<imgs.length;i++){" +
                    "  imgs[i].setAttribute('loading','lazy');" +
                    "  imgs[i].setAttribute('decoding','async');" +
                    "}}");

                v.loadUrl("javascript:" +
                    "if(!window._VL){" +
                    "window._VL=1;var ob=new IntersectionObserver(function(es){" +
                    "  es.forEach(function(e){if(e.isIntersecting){" +
                    "    var sl=e.target,src=sl.getAttribute('ds');" +
                    "    if(src&&!sl._ld){sl._ld=1;" +
                    "      var im=document.createElement('img');im.src=src;" +
                    "      ['alt','class','style','loading','decoding'].forEach(function(a){" +
                    "        var v=sl.getAttribute('d'+a);if(v)im.setAttribute(a,v);});" +
                    "      im.style.cssText=sl.style.cssText||'';" +
                    "      sl.parentNode.replaceChild(im,sl);}}})" +
                    "},{rootMargin:'400px 0px'});" +
                    "var ims=document.querySelectorAll('img');" +
                    "for(var i=0;i<ims.length;i++){var im=ims[i];" +
                    "  if(i<6||im.src.startsWith('data:')||im.src.indexOf('logo')>=0)continue;" +
                    "  var sl=document.createElement('div');sl.setAttribute('ds',im.src);" +
                    "  ['alt','class','style','loading','decoding'].forEach(function(a){" +
                    "    var v=im.getAttribute(a);if(v)sl.setAttribute('d'+a,v);});" +
                    "  sl.style.cssText=(im.style.cssText||'')+';min-height:100px';" +
                    "  im.parentNode.replaceChild(sl,im);ob.observe(sl);}" +
                    "}");

                // (3.5) Fix video playback — remove encodeURI that breaks Android WebView
                v.loadUrl("javascript:" +
                    "if(!window._VFIX){" +
                    "window._VFIX=1;" +
                    "setTimeout(function(){" +
                    "  var videos=document.querySelectorAll('video source');" +
                    "  for(var i=0;i<videos.length;i++){" +
                    "    var src=videos[i].getAttribute('src');" +
                    "    if(src){" +
                    "      try{src=decodeURI(src);}catch(e){}" +
                    "      videos[i].setAttribute('src',src);" +
                    "      videos[i].parentNode.load();" +
                    "    }" +
                    "  }" +
                    "},500);" +
                    "}");

                // (4) Image tap → fullscreen overlay with swipe-down to close
                v.loadUrl("javascript:" +
                    "if(!window._IMG){" +
                    "window._IMG=1;" +
                    "document.addEventListener('click',function(e){" +
                    "  var t=e.target,src=null;" +
                    "  if(t.tagName=='IMG'&&t.src)src=t.src;" +
                    "  else if(t.tagName=='DIV'&&t.getAttribute('ds'))src=t.getAttribute('ds');" +
                    "  if(src&&!t.closest('a')){" +
                    "    e.preventDefault();" +
                    "    var ov=document.createElement('div');" +
                    "    ov.style.cssText='position:fixed;inset:0;z-index:99998;background:rgba(0,0,0,0.92);" +
                    "display:flex;align-items:center;justify-content:center;transition:opacity 0.3s;';" +
                    "    var im=document.createElement('img');" +
                    "    im.src=src;" +
                    "    im.style.cssText='max-width:96vw;max-height:96vh;object-fit:contain;transition:transform 0.2s;';" +
                    "    ov.appendChild(im);" +
                    "    ov.onclick=function(){ov.style.opacity='0';setTimeout(function(){ov.remove();},300);};" +
                    "    var startY=0,started=false;" +
                    "    ov.addEventListener('touchstart',function(ev){startY=ev.touches[0].clientY;started=true;});" +
                    "    ov.addEventListener('touchmove',function(ev){" +
                    "      if(!started)return;var dy=ev.touches[0].clientY-startY;" +
                    "      if(dy>0){im.style.transform='translateY('+dy+'px)';ov.style.opacity=Math.max(0,1-dy/300);}" +
                    "    });" +
                    "    ov.addEventListener('touchend',function(ev){" +
                    "      var dy=ev.changedTouches[0].clientY-startY;started=false;" +
                    "      if(dy>150){ov.remove();}else{im.style.transform='';ov.style.opacity='1';}" +
                    "    });" +
                    "    document.body.appendChild(ov);" +
                    "  }" +
                    "},true);" +
                    "}");

                // (6) Countdown timer — homepage only
                if (url.indexOf("zy.html") >= 0) {
                    v.loadUrl("javascript:setTimeout(function(){" +
                        "if(!document.getElementById('_inj_cd')){" +
                        "var cd=document.createElement('div');cd.id='_inj_cd';" +
                        "cd.style.cssText='text-align:center;padding:20px 16px;margin:12px 16px;border-radius:14px;" +
                        "background:rgba(212,167,84,0.04);border:1px solid rgba(212,167,84,0.08);';" +
                        "var freeze=new Date(2024,7,2);var now=new Date();" +
                        "var days=Math.floor((now-freeze)/86400000);" +
                        "cd.innerHTML='<div style=\"font-size:38px;color:#f0d78c;font-weight:700;\">'+days+' 天</div>" +
                        "<div style=\"font-size:11px;color:rgba(255,255,255,0.25);margin-top:4px;\">研发冻结 · 2024.08.02</div>';" +
                        "var main=document.querySelector('main');" +
                        "if(main)main.insertBefore(cd,main.firstChild);" +
                        "}},500);");
                }

                // (7) Hide top navbar items that are covered by bottom tabs
                v.loadUrl("javascript:setTimeout(function(){" +
                    "var nav=document.querySelector('.nav-menu');" +
                    "if(nav&&!document.getElementById('_st')){" +
                    // Remove 角色/概念/二创/笑话 from top nav (now in bottom tabs)
                    "  var links=nav.querySelectorAll('a');" +
                    "  var hasQA=false,hasForum=false;" +
                    "  for(var i=0;i<links.length;i++){" +
                    "    var t=links[i].textContent.trim();" +
                    "    if(t=='角色'||t=='概念'||t=='二创'||t=='笑话'||t=='首页') links[i].parentNode.style.display='none';" +
                    "    if(t=='玩家问答')hasQA=true;if(t=='游戏论坛')hasForum=true;" +
                    "  }" +
                    "  if(!hasQA){var l=document.createElement('li');l.innerHTML='<a href=\"https://docs.qq.com/sheet/DVXVaQWZOcUFyRlNr?tab=BB08J2\" target=\"_blank\" class=\"nav-item text-white no-underline px-3 py-2 rounded-md relative\">玩家问答</a>';nav.appendChild(l);}" +
                    "  if(!hasForum){var l=document.createElement('li');l.innerHTML='<a href=\"https://www.taptap.cn/app/513986\" target=\"_blank\" class=\"nav-item text-white no-underline px-3 py-2 rounded-md relative\">游戏论坛</a>';nav.appendChild(l);}" +
                    // Add QQ group (single button) + settings links
                    "  var li1=document.createElement('li');" +
                    "  li1.innerHTML='<a id=\"_qqgrp\" href=\"#\" " +
                    "class=\"nav-item text-white no-underline px-3 py-2 rounded-md relative\">" +
                    "\\u6E38\\u620F\\u5B98\\u7FA4</a>';nav.appendChild(li1);" +
                    "  document.getElementById('_qqgrp').onclick=function(e){" +
                    "    e.preventDefault();" +
                    "    var d=document.createElement('div');" +
                    "    d.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.82);" +
                    "display:flex;align-items:center;justify-content:center;';" +
                    "    d.innerHTML='<div style=\"background:rgba(22,22,32,0.96);border:1px solid rgba(212,167,84,0.25);" +
                    "border-radius:18px;padding:28px 22px 20px;max-width:300px;width:84%;text-align:center;\">" +
                    "<div style=\"font-size:16px;color:#f0d78c;font-weight:700;margin-bottom:8px;\">\\u8BF8\\u795E\\u7EC8\\u5E94\\u77E5\\u6653</div>" +
                    "<div style=\"font-size:12px;color:rgba(255,255,255,0.35);margin-bottom:20px;\">\\u5B98\\u65B9QQ\\u7FA4</div>" +
                    "<button style=\"display:block;width:100%;padding:13px;margin-bottom:10px;background:rgba(212,167,84,0.12);" +
                    "border:1px solid rgba(212,167,84,0.25);border-radius:12px;color:#f0d78c;font-size:14px;cursor:pointer;\" " +
                    "onclick=\"var e=this.parentNode.parentNode;e.remove();" +
                    "location.href=\\'mqqapi://card/show_pslcard?src_type=internal&version=1&card_type=group&uin=913044248\\';\">" +
                    "\\u5B98\\u65B9\\u4E00\\u7FA4 913044248</button>" +
                    "<button style=\"display:block;width:100%;padding:13px;margin-bottom:10px;background:rgba(212,167,84,0.12);" +
                    "border:1px solid rgba(212,167,84,0.25);border-radius:12px;color:#f0d78c;font-size:14px;cursor:pointer;\" " +
                    "onclick=\"var e=this.parentNode.parentNode;e.remove();" +
                    "location.href=\\'mqqapi://card/show_pslcard?src_type=internal&version=1&card_type=group&uin=130340208\\';\">" +
                    "\\u5B98\\u65B9\\u4E8C\\u7FA4 130340208</button>" +
                    "<button style=\"background:none;border:none;color:rgba(255,255,255,0.3);font-size:13px;cursor:pointer;\" " +
                    "onclick=\"this.parentNode.parentNode.remove();\">\\u53D6\\u6D88</button></div>';" +
                    "    document.body.appendChild(d);" +
                    "  };" +
                    "  var li2=document.createElement('li');" +
                    "  li2.innerHTML='<a id=\"_st\" href=\"settings.html\" " +
                    "class=\"nav-item text-white no-underline px-3 py-2 rounded-md relative\">" +
                    "\\u8BBE\\u7F6E</a>';nav.appendChild(li2);" +
                    "}},300);");

                if (!disclaimerShown && url.indexOf("zy.html") >= 0 && !prefs.getBoolean("disclaimer_skip", false)) {
                    disclaimerShown = true;
                    v.loadUrl("javascript:setTimeout(function(){" +
                        "var d=document.createElement('div');d.id='_d';" +
                        "d.innerHTML='<div style=\"position:fixed;inset:0;z-index:99999;display:flex;" +
                        "align-items:center;justify-content:center;background:rgba(0,0,0,0.78);" +
                        "backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);" +
                        "animation:fi 0.35s ease;\"><div style=\"background:rgba(20,20,28,0.94);" +
                        "border:1px solid rgba(212,167,84,0.28);border-radius:22px;" +
                        "padding:34px 26px 24px;max-width:330px;width:86%;text-align:center;" +
                        "box-shadow:0 24px 80px rgba(0,0,0,0.65),0 0 50px rgba(212,167,84,0.05);" +
                        "animation:pi 0.5s cubic-bezier(0.16,1,0.3,1);\">" +
                        "<div style=\"font-size:38px;margin-bottom:14px;\">\\u2694\\uFE0F</div>" +
                        "<h3 style=\"color:#f0d78c;font-size:18px;font-weight:700;margin:0 0 10px;" +
                        "letter-spacing:0.06em;\">\\u58F0\\u660E</h3>" +
                        "<p style=\"color:rgba(224,213,192,0.74);font-size:14px;line-height:1.9;" +
                        "margin:0 0 20px;\">\\u8BE5\\u5185\\u5BB9\\u4E3A\\u73A9\\u5BB6\\u5171\\u521B\\uFF0C" +
                        "\\u4E0D\\u4EE3\\u8868\\u5B98\\u65B9\\u7ACB\\u573A\\uFF0C\\u4E0D\\u4EE3\\u8868\\u5B98\\u65B9\\u6D88\\u606F\\uFF0C" +
                        "\\u4EC5\\u4E3A\\u7EAA\\u5FF5\\u8BF8\\u795E\\u7EC8\\u5E94\\u77E5\\u6653\\u3002</p>" +
                        "<button onclick=\"var cb=document.getElementById(\\'_d_skip\\');" +
                        "if(cb&&cb.checked&&window.Android)Android.setSkipDisclaimer(true);" +
                        "var e=document.getElementById(\\'_d\\');if(e)e.parentNode.removeChild(e);\" " +
                        "style=\"background:linear-gradient(135deg,#8b6914,#d4a754);color:#0a0a0f;" +
                        "border:none;padding:12px 40px;border-radius:26px;font-size:15px;font-weight:600;" +
                        "letter-spacing:0.06em;box-shadow:0 4px 24px rgba(212,167,84,0.28);margin-bottom:8px;\">" +
                        "\\u6211\\u77E5\\u9053\\u4E86</button><br>" +
                        "<label style=\"color:rgba(224,213,192,0.4);font-size:12px;cursor:pointer;" +
                        "-webkit-user-select:none;user-select:none;\">" +
                        "<input type=\"checkbox\" id=\"_d_skip\" style=\"margin-right:4px;vertical-align:middle;\">" +
                        "\\u4E0D\\u518D\\u63D0\\u793A</label></div></div>';" +
                        "document.body.appendChild(d);" +
                        "document.getElementById('_d_skip').onchange=function(){" +
                        "  window._skipDisclaimer=this.checked;" +
                        "};" +
                        "var a=document.createElement('style');a.textContent=" +
                        "'@keyframes fi{from{opacity:0}to{opacity:1}}" +
                        "@keyframes pi{from{opacity:0;transform:translateY(36px)scale(0.94)}" +
                        "to{opacity:1;transform:translateY(0)scale(1)}}';" +
                        "document.head.appendChild(a);},100);");
                }
            }
        });

        root.addView(webView, new FrameLayout.LayoutParams(-1, -1));

        // ---- Native Bottom Tab Bar ----
        tabBar = new LinearLayout(this);
        tabBar.setOrientation(LinearLayout.HORIZONTAL);
        tabBar.setBackgroundColor(Color.parseColor("#101016"));
        tabBar.setVisibility(View.GONE);
        tabBar.setId(View.generateViewId());
        String[] tabNames = {"角色", "概念", "二创", "笑话"};
        String[] tabIcons = {"🎭", "🎨", "🖼️", "😂"};
        String[] tabPages = {"gfjs.html", "gfgn.html", "wjec.html", "qyxhhj.html"};
        final TextView[] tabViews = new TextView[4];

        for (int i = 0; i < 4; i++) {
            final int idx = i;
            TextView tab = new TextView(this);
            tab.setText(tabIcons[i] + "\n" + tabNames[i]);
            tab.setTextSize(10);
            tab.setTextColor(i == 0 ? Color.parseColor("#f0d78c") : Color.parseColor("#55ffffff"));
            tab.setGravity(android.view.Gravity.CENTER);
            tab.setPadding(0, dp(8), 0, dp(10));
            tab.setOnClickListener(new View.OnClickListener() {
                public void onClick(View v) {
                    navigateTabPage(tabPages[idx], tabViews, idx);
                }
            });
            tabViews[i] = tab;
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, -2, 1f);
            tabBar.addView(tab, lp);
        }
        FrameLayout.LayoutParams tabParams = new FrameLayout.LayoutParams(-1, -2);
        tabParams.gravity = android.view.Gravity.BOTTOM;
        root.addView(tabBar, tabParams);

        // ---- Splash ----
        splash = new ImageView(this);
        splash.setScaleType(ImageView.ScaleType.FIT_CENTER);
        try {
            Bitmap splashBmp = loadSplash();
            splash.setImageBitmap(splashBmp);
        } catch (Throwable t) {
            // Fallback: solid dark bg
            splash.setBackgroundColor(Color.parseColor("#0a0a0f"));
        }
        splash.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                if (gameStarted) return;
                gameStarted = true;
                if (hintText != null) { hintText.clearAnimation(); hintText.setVisibility(View.GONE); }
                try { haptic(); } catch (Throwable ignored) {}
                try {
                    loadingOverlay.setVisibility(View.VISIBLE);
                    webView.loadUrl("file:///android_asset/zy.html");
                } catch (Throwable t) {
                    // If WebView load fails, try to show error
                    Toast.makeText(MainActivity.this, "加载失败，请重试", Toast.LENGTH_SHORT).show();
                    gameStarted = false;
                    loadingOverlay.setVisibility(View.GONE);
                }
            }
        });
        root.addView(splash, new FrameLayout.LayoutParams(-1, -1));

        // Subtle hint text at bottom (splash only)
        hintText = new TextView(this);
        hintText.setText("点击任意位置开始");
        hintText.setTextColor(Color.argb(120, 240, 215, 140));
        hintText.setTextSize(13);
        hintText.setGravity(android.view.Gravity.CENTER);
        FrameLayout.LayoutParams hintParams = new FrameLayout.LayoutParams(-1, -2);
        hintParams.gravity = android.view.Gravity.BOTTOM | android.view.Gravity.CENTER_HORIZONTAL;
        hintParams.bottomMargin = dp(50);
        root.addView(hintText, hintParams);

        // Pulsing alpha on hint
        AlphaAnimation hintPulse = new AlphaAnimation(0.3f, 0.8f);
        hintPulse.setDuration(1500);
        hintPulse.setRepeatMode(Animation.REVERSE);
        hintPulse.setRepeatCount(Animation.INFINITE);
        hintText.startAnimation(hintPulse);

        setContentView(root);

        // Splash entrance animations
        AlphaAnimation splFi = new AlphaAnimation(0f, 1f);
        splFi.setDuration(500); splFi.setFillAfter(true);
        ScaleAnimation splZi = new ScaleAnimation(1.0f, 1.05f, 1.0f, 1.05f,
            ScaleAnimation.RELATIVE_TO_SELF, 0.5f, ScaleAnimation.RELATIVE_TO_SELF, 0.5f);
        splZi.setDuration(2000); splZi.setFillAfter(true);
        splash.startAnimation(splFi); splash.startAnimation(splZi);
        splash.setAlpha(1f);
    }

    // Load splash bitmap, auto-correcting orientation
    private Bitmap loadSplash() {
        try {
            InputStream is = getAssets().open("splash.jpg");
            BitmapFactory.Options opts = new BitmapFactory.Options();
            opts.inPreferredConfig = Bitmap.Config.RGB_565;
            Bitmap bmp = BitmapFactory.decodeStream(is, null, opts);
            is.close();
            if (bmp == null) throw new Exception("decode failed");
            return bmp;
        } catch (Throwable t) {
            return BitmapFactory.decodeResource(getResources(), R.drawable.splash);
        }
    }

    private void haptic() {
        if (vibrator != null && vibrator.hasVibrator()) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createOneShot(30, VibrationEffect.DEFAULT_AMPLITUDE));
            } else {
                vibrator.vibrate(30);
            }
        }
    }

    private void showLoading() {
        loadingOverlay.setVisibility(View.VISIBLE);
    }

    private void navigateTabPage(String page, TextView[] tabViews, int selectedIndex) {
        for (TextView tab : tabViews) {
            tab.setTextColor(Color.parseColor("#55ffffff"));
        }
        tabViews[selectedIndex].setTextColor(Color.parseColor("#f0d78c"));
        if (canNavigateWithinCurrentPage()) {
            navigateWithinCurrentPage(page);
            return;
        }
        showLoading();
        webView.loadUrl("file:///android_asset/" + page);
    }

    private boolean canNavigateWithinCurrentPage() {
        if (webView == null) {
            return false;
        }
        String currentUrl = webView.getUrl();
        return currentUrl != null && currentUrl.startsWith("file:///android_asset/");
    }

    private void navigateWithinCurrentPage(String page) {
        loadingOverlay.setVisibility(View.GONE);
        String script = "(function(){"
            + "if(typeof window.ZhushenNavigate!=='function'){return false;}"
            + "window.ZhushenNavigate(" + quoteJavascriptString(page) + ",true);"
            + "return true;"
            + "})();";
        webView.evaluateJavascript(script, new android.webkit.ValueCallback<String>() {
            @Override
            public void onReceiveValue(String result) {
                if (!"true".equals(result)) {
                    showLoading();
                    webView.loadUrl("file:///android_asset/" + page);
                }
            }
        });
    }

    private String quoteJavascriptString(String value) {
        return "'" + value
            .replace("\\", "\\\\")
            .replace("'", "\\'")
            .replace("\r", "\\r")
            .replace("\n", "\\n")
            + "'";
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (webView != null) webView.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        applyImmersiveSystemBars();
        if (webView != null) webView.onResume();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            applyImmersiveSystemBars();
        }
    }

    private void applyImmersiveSystemBars() {
        Window window = getWindow();
        View decorView = window.getDecorView();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            WindowInsetsController controller = decorView.getWindowInsetsController();
            if (controller == null) {
                return;
            }
            controller.hide(
                WindowInsets.Type.statusBars()
                    | WindowInsets.Type.navigationBars()
            );
            controller.setSystemBarsBehavior(
                WindowInsetsController
                    .BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            );
            return;
        }
        decorView.setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        );
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.loadUrl("about:blank");
            webView.clearHistory();
            webView.destroy();
            webView = null;
        }
        if (splash != null) {
            android.graphics.drawable.Drawable d = splash.getDrawable();
            if (d instanceof android.graphics.drawable.BitmapDrawable) {
                Bitmap bmp = ((android.graphics.drawable.BitmapDrawable) d).getBitmap();
                if (bmp != null && !bmp.isRecycled()) bmp.recycle();
            }
            splash.setImageBitmap(null);
        }
        super.onDestroy();
    }

    @Override
    public void onBackPressed() {
        haptic();
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
            exitTwice = false;
            return;
        }
        if (exitTwice) { super.onBackPressed(); return; }
        exitTwice = true;
        Toast.makeText(this, "再按一次退出", Toast.LENGTH_SHORT).show();
        new Handler().postDelayed(new Runnable() {
            public void run() { exitTwice = false; }
        }, 2000);
    }

    private int dp(int px) {
        return (int)(px * getResources().getDisplayMetrics().density);
    }
}
