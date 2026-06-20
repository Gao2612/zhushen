package com.zhushen.game;

import android.Manifest;
import android.annotation.SuppressLint;
import android.annotation.TargetApi;
import android.content.ActivityNotFoundException;
import android.content.ContentValues;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageManager;
import android.content.res.AssetFileDescriptor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.SurfaceTexture;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.provider.MediaStore;
import android.util.Log;
import android.view.Gravity;
import android.view.Surface;
import android.view.TextureView;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.view.animation.AlphaAnimation;
import android.view.animation.Animation;
import android.webkit.JavascriptInterface;
import android.webkit.MimeTypeMap;
import android.webkit.SafeBrowsingResponse;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
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

import androidx.annotation.NonNull;
import androidx.activity.ComponentActivity;
import androidx.activity.OnBackPressedCallback;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import androidx.core.view.WindowCompat;
import androidx.webkit.WebViewAssetLoader;

import java.io.File;
import java.io.FileOutputStream;
import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public final class MainActivity extends ComponentActivity {

    private static final String TAG = "ZhushenApp";
    private static final String BASE_URL =
        "https://appassets.androidplatform.net/assets/";
    private static final String HOME_PAGE = "zy.html";
    private static final int STORAGE_PERMISSION_REQUEST = 1001;
    private static final int AVATAR_FILE_REQUEST = 1002;
    private static final String PREFS_NAME = "zhushen_prefs";
    private static final String PREF_SKIP_DISCLAIMER = "disclaimer_skip";
    private static final String PREF_ORIENTATION_MODE = "orientation_mode";
    private static final String PREF_SPLASH_VIDEO_MODE = "splash_video_mode";
    private static final String PREF_BACKGROUND_MUSIC_ENABLED =
        "background_music_enabled";
    private static final String PREF_BACKGROUND_MUSIC_VOLUME =
        "background_music_volume";
    private static final String BACKGROUND_MUSIC_ASSET_PATH =
        "audio/background_music.oga";
    private static final int DEFAULT_BACKGROUND_MUSIC_VOLUME = 45;
    private static final String ORIENTATION_PORTRAIT = "portrait";
    private static final String ORIENTATION_LANDSCAPE = "landscape";
    private static final String ORIENTATION_AUTO = "auto";
    private static final String SPLASH_VIDEO_RANDOM = "random";
    private static final String SPLASH_VIDEO_NONE = "none";
    private static final SplashVideo[] SPLASH_VIDEOS = {
        new SplashVideo(
            "atal",
            "阿塔尔",
            "官方-角色/视频/阿塔尔.mp4"
        ),
        new SplashVideo(
            "atal_skill",
            "阿塔尔技能特效",
            "官方-角色/视频/阿塔尔技能特效.mp4"
        ),
        new SplashVideo(
            "atal_huimu",
            "阿塔尔回眸",
            "官方-角色/视频/阿塔尔回睦.mp4"
        ),
        new SplashVideo(
            "dehenu",
            "德赫奴",
            "官方-角色/视频/德赫奴.mp4"
        ),
        new SplashVideo(
            "dehenu_skill",
            "德赫奴技能",
            "官方-角色/视频/德赫奴技能.mp4"
        )
    };

    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private final ExecutorService ioExecutor = Executors.newSingleThreadExecutor();

    private WebView webView;
    private TextureView splashVideoView;
    private TextureView nativeVideoView;
    private MediaPlayer splashPlayer;
    private MediaPlayer pendingSplashPlayer;
    private MediaPlayer nativeVideoPlayer;
    private MediaPlayer backgroundMusicPlayer;
    private Surface splashSurface;
    private Surface nativeVideoSurface;
    private ImageView splash;
    private TextView hintText;
    private LinearLayout loadingOverlay;
    private LinearLayout browserBar;
    private LinearLayout tabBar;
    private FrameLayout nativeVideoOverlay;
    private ProgressBar progressBar;
    private Vibrator vibrator;
    private SharedPreferences preferences;
    private WebViewAssetLoader assetLoader;
    private boolean firstLoad = true;
    private boolean gameStarted = false;
    private boolean exitTwice = false;
    private boolean backgroundMusicPausedByLifecycle = false;
    private String pendingSaveUrl;
    private String pendingNativeVideoAssetPath;
    private ValueCallback<Uri[]> pendingFileChooser;
    private Uri currentExternalUri;
    private TextView browserTitle;
    private TextView nativeVideoTitle;
    private final Random random = new Random();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        vibrator = (Vibrator) getSystemService(VIBRATOR_SERVICE);
        preferences = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
        assetLoader = new WebViewAssetLoader.Builder()
            .addPathHandler(
                "/assets/",
                new WebViewAssetLoader.AssetsPathHandler(this)
            )
            .build();

        configureWindow();
        setContentView(createRootView());
        configureBackNavigation();
    }

    private void configureWindow() {
        Window window = getWindow();
        window.addFlags(
            WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS
        );
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        WindowCompat.setDecorFitsSystemWindows(window, false);
        window.setStatusBarColor(Color.parseColor("#0a0a0f"));
        window.setNavigationBarColor(Color.TRANSPARENT);
        applyImmersiveSystemBars();
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

    private void applyOrientationMode(String mode) {
        if (ORIENTATION_PORTRAIT.equals(mode)) {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
            return;
        }
        if (ORIENTATION_LANDSCAPE.equals(mode)) {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
            return;
        }
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_FULL_SENSOR);
    }

    private String normalizeOrientationMode(String mode) {
        if (ORIENTATION_PORTRAIT.equals(mode)) {
            return ORIENTATION_PORTRAIT;
        }
        if (ORIENTATION_LANDSCAPE.equals(mode)) {
            return ORIENTATION_LANDSCAPE;
        }
        return ORIENTATION_AUTO;
    }

    private void configureBackNavigation() {
        getOnBackPressedDispatcher().addCallback(
            this,
            new OnBackPressedCallback(true) {
                @Override
                public void handleOnBackPressed() {
                    handleBackNavigation();
                }
            }
        );
    }

    private View createRootView() {
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.parseColor("#0a0a0f"));

        webView = createWebView();
        root.addView(webView, matchParentParams());

        browserBar = createBrowserBar();
        FrameLayout.LayoutParams browserBarParams = new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            dp(52)
        );
        browserBarParams.gravity = Gravity.TOP;
        root.addView(browserBar, browserBarParams);

        loadingOverlay = createLoadingOverlay();
        root.addView(loadingOverlay, matchParentParams());

        progressBar = new ProgressBar(
            this,
            null,
            android.R.attr.progressBarStyleHorizontal
        );
        progressBar.setProgressDrawable(
            ContextCompat.getDrawable(this, R.drawable.progress_bar)
        );
        progressBar.setVisibility(View.GONE);
        root.addView(
            progressBar,
            new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                dp(3)
            )
        );

        tabBar = createTabBar();
        FrameLayout.LayoutParams tabParams = new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.WRAP_CONTENT
        );
        tabParams.gravity = Gravity.BOTTOM;
        root.addView(tabBar, tabParams);

        splashVideoView = createSplashVideoView();
        root.addView(splashVideoView, matchParentParams());

        splash = createSplash();
        root.addView(splash, matchParentParams());

        hintText = createHintText();
        FrameLayout.LayoutParams hintParams = new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.WRAP_CONTENT
        );
        hintParams.gravity = Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL;
        hintParams.bottomMargin = dp(50);
        root.addView(hintText, hintParams);

        nativeVideoOverlay = createNativeVideoOverlay();
        root.addView(nativeVideoOverlay, matchParentParams());

        return root;
    }

    private TextureView createSplashVideoView() {
        TextureView textureView = new TextureView(this);
        textureView.setOpaque(false);
        textureView.setOnClickListener(view -> startApplication());
        textureView.setSurfaceTextureListener(
            new TextureView.SurfaceTextureListener() {
                @Override
                public void onSurfaceTextureAvailable(
                    SurfaceTexture surfaceTexture,
                    int width,
                    int height
                ) {
                    splashSurface = new Surface(surfaceTexture);
                    prepareSplashVideo(splashSurface);
                }

                @Override
                public void onSurfaceTextureSizeChanged(
                    SurfaceTexture surfaceTexture,
                    int width,
                    int height
                ) {
                }

                @Override
                public boolean onSurfaceTextureDestroyed(
                    SurfaceTexture surfaceTexture
                ) {
                    releasePendingSplashPlayer();
                    releaseSplashPlayer();
                    if (splashSurface != null) {
                        splashSurface.release();
                        splashSurface = null;
                    }
                    return true;
                }

                @Override
                public void onSurfaceTextureUpdated(
                    SurfaceTexture surfaceTexture
                ) {
                }
            }
        );
        return textureView;
    }

    private FrameLayout createNativeVideoOverlay() {
        FrameLayout overlay = new FrameLayout(this);
        overlay.setBackgroundColor(Color.BLACK);
        overlay.setVisibility(View.GONE);

        nativeVideoView = new TextureView(this);
        nativeVideoView.setOpaque(false);
        nativeVideoView.setSurfaceTextureListener(
            new TextureView.SurfaceTextureListener() {
                @Override
                public void onSurfaceTextureAvailable(
                    SurfaceTexture surfaceTexture,
                    int width,
                    int height
                ) {
                    nativeVideoSurface = new Surface(surfaceTexture);
                    if (pendingNativeVideoAssetPath != null) {
                        playNativeVideoAsset(pendingNativeVideoAssetPath);
                    }
                }

                @Override
                public void onSurfaceTextureSizeChanged(
                    SurfaceTexture surfaceTexture,
                    int width,
                    int height
                ) {
                }

                @Override
                public boolean onSurfaceTextureDestroyed(
                    SurfaceTexture surfaceTexture
                ) {
                    releaseNativeVideoPlayer();
                    if (nativeVideoSurface != null) {
                        nativeVideoSurface.release();
                        nativeVideoSurface = null;
                    }
                    return true;
                }

                @Override
                public void onSurfaceTextureUpdated(
                    SurfaceTexture surfaceTexture
                ) {
                }
            }
        );
        overlay.addView(nativeVideoView, matchParentParams());

        nativeVideoTitle = new TextView(this);
        nativeVideoTitle.setTextColor(Color.parseColor("#f7e7bf"));
        nativeVideoTitle.setTextSize(16);
        nativeVideoTitle.setSingleLine(true);
        nativeVideoTitle.setPadding(dp(18), 0, dp(72), 0);
        nativeVideoTitle.setGravity(Gravity.CENTER_VERTICAL);
        FrameLayout.LayoutParams titleParams = new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            dp(56)
        );
        titleParams.gravity = Gravity.TOP;
        overlay.addView(nativeVideoTitle, titleParams);

        TextView close = createBrowserBarButton("关闭");
        close.setTextSize(15);
        close.setBackgroundColor(Color.argb(160, 0, 0, 0));
        close.setOnClickListener(view -> {
            haptic();
            closeNativeVideoOverlay();
        });
        FrameLayout.LayoutParams closeParams = new FrameLayout.LayoutParams(
            dp(64),
            dp(56)
        );
        closeParams.gravity = Gravity.TOP | Gravity.RIGHT;
        overlay.addView(close, closeParams);
        return overlay;
    }

    @SuppressLint("SetJavaScriptEnabled")
    private WebView createWebView() {
        WebView view = new WebView(this);
        view.setBackgroundColor(Color.parseColor("#1A1A1A"));
        view.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        view.setVisibility(View.INVISIBLE);
        view.setOverScrollMode(WebView.OVER_SCROLL_NEVER);
        view.setVerticalScrollBarEnabled(false);
        view.setHorizontalScrollBarEnabled(false);
        view.setNestedScrollingEnabled(true);
        view.setFocusableInTouchMode(true);

        WebSettings settings = view.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setSupportZoom(true);
        settings.setBuiltInZoomControls(true);
        settings.setDisplayZoomControls(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSaveFormData(false);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            settings.setSafeBrowsingEnabled(true);
        }

        view.addJavascriptInterface(new AppBridge(), "Android");
        view.setWebChromeClient(createChromeClient());
        view.setWebViewClient(createWebViewClient());
        view.setOnLongClickListener(this::showImageActions);
        view.setLongClickable(true);
        return view;
    }

    private WebChromeClient createChromeClient() {
        return new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int progress) {
                if (progress >= 100) {
                    progressBar.setVisibility(View.GONE);
                    loadingOverlay.setVisibility(View.GONE);
                    return;
                }
                progressBar.setVisibility(View.VISIBLE);
                progressBar.setProgress(progress);
            }

            @Override
            public void onReceivedTitle(WebView view, String title) {
                super.onReceivedTitle(view, title);
                if (browserTitle != null && isInternalBrowserVisible()) {
                    browserTitle.setText(title == null || title.isEmpty()
                        ? "内置网页"
                        : title);
                }
            }

            @Override
            public boolean onShowFileChooser(
                WebView view,
                ValueCallback<Uri[]> filePathCallback,
                FileChooserParams fileChooserParams
            ) {
                if (pendingFileChooser != null) {
                    pendingFileChooser.onReceiveValue(null);
                }
                pendingFileChooser = filePathCallback;
                try {
                    Intent intent = fileChooserParams.createIntent();
                    intent.addCategory(Intent.CATEGORY_OPENABLE);
                    String[] acceptTypes = fileChooserParams.getAcceptTypes();
                    if (acceptTypes.length > 0 && !acceptTypes[0].isEmpty()) {
                        intent.setType(acceptTypes[0]);
                    }
                    startActivityForResult(intent, AVATAR_FILE_REQUEST);
                    return true;
                } catch (ActivityNotFoundException error) {
                    pendingFileChooser = null;
                    showToast("未找到可用的图片选择器");
                    return false;
                }
            }
        };
    }

    private WebViewClient createWebViewClient() {
        return new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(
                WebView view,
                WebResourceRequest request
            ) {
                Uri uri = request.getUrl();
                WebResourceResponse mediaResponse =
                    createMediaResponse(uri, request.getRequestHeaders());
                if (mediaResponse != null) {
                    return mediaResponse;
                }
                return assetLoader.shouldInterceptRequest(uri);
            }

            @Override
            public boolean shouldOverrideUrlLoading(
                WebView view,
                WebResourceRequest request
            ) {
                return handleNavigation(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(
                WebView view,
                String url
            ) {
                return handleNavigation(Uri.parse(url));
            }

            @Override
            public void onPageStarted(
                WebView view,
                String url,
                Bitmap favicon
            ) {
                super.onPageStarted(view, url, favicon);
                if (!firstLoad) {
                    showLoading();
                }
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                if (!isTrustedAssetUri(Uri.parse(url))) {
                    revealExternalContentAfterLoad(Uri.parse(url));
                    return;
                }
                closeBrowserBarOnly();
                injectEnhancements(view);
                updateSelectedTab(url);
                revealContentAfterLoad();
            }

            @Override
            public void onReceivedError(
                WebView view,
                WebResourceRequest request,
                WebResourceError error
            ) {
                if (request.isForMainFrame()) {
                    showErrorPage("页面加载失败，请返回后重试");
                }
            }

            @Override
            @TargetApi(Build.VERSION_CODES.O_MR1)
            public void onSafeBrowsingHit(
                WebView view,
                WebResourceRequest request,
                int threatType,
                SafeBrowsingResponse callback
            ) {
                callback.backToSafety(true);
                showToast("已拦截不安全页面");
            }
        };
    }

    private LinearLayout createLoadingOverlay() {
        LinearLayout overlay = new LinearLayout(this);
        overlay.setBackgroundColor(Color.parseColor("#0a0a0f"));
        overlay.setVisibility(View.GONE);
        overlay.setGravity(Gravity.CENTER);
        overlay.setOrientation(LinearLayout.VERTICAL);

        TextView label = new TextView(this);
        label.setText("加载中…");
        label.setTextColor(Color.parseColor("#f0d78c"));
        label.setTextSize(16);
        label.setAlpha(0.7f);
        overlay.addView(label);
        return overlay;
    }

    private LinearLayout createBrowserBar() {
        LinearLayout bar = new LinearLayout(this);
        bar.setOrientation(LinearLayout.HORIZONTAL);
        bar.setGravity(Gravity.CENTER_VERTICAL);
        bar.setVisibility(View.GONE);
        bar.setPadding(dp(10), 0, dp(10), 0);
        bar.setBackgroundColor(Color.parseColor("#15131a"));

        TextView back = createBrowserBarButton("‹");
        back.setTextSize(26);
        back.setContentDescription("返回");
        back.setOnClickListener(view -> {
            haptic();
            if (webView != null && webView.canGoBack()) {
                webView.goBack();
                return;
            }
            loadPage(HOME_PAGE);
        });
        bar.addView(back, new LinearLayout.LayoutParams(dp(42), dp(52)));

        browserTitle = new TextView(this);
        browserTitle.setText("内置网页");
        browserTitle.setTextColor(Color.parseColor("#f0d78c"));
        browserTitle.setTextSize(14);
        browserTitle.setSingleLine(true);
        browserTitle.setGravity(Gravity.CENTER_VERTICAL);
        bar.addView(
            browserTitle,
            new LinearLayout.LayoutParams(0, dp(52), 1f)
        );

        TextView refresh = createBrowserBarButton("刷新");
        refresh.setOnClickListener(view -> {
            haptic();
            if (webView != null) {
                webView.reload();
            }
        });
        bar.addView(refresh, new LinearLayout.LayoutParams(dp(54), dp(52)));

        TextView external = createBrowserBarButton("浏览器");
        external.setOnClickListener(view -> {
            haptic();
            Uri uri = Uri.parse(webView == null ? "" : webView.getUrl());
            if (!"https".equalsIgnoreCase(uri.getScheme())) {
                uri = currentExternalUri;
            }
            if (uri != null) {
                openExternal(uri, "未找到可打开此链接的应用");
            }
        });
        bar.addView(external, new LinearLayout.LayoutParams(dp(64), dp(52)));

        TextView close = createBrowserBarButton("关闭");
        close.setOnClickListener(view -> {
            haptic();
            if (webView != null && webView.canGoBack()) {
                webView.goBack();
                return;
            }
            loadPage(HOME_PAGE);
        });
        bar.addView(close, new LinearLayout.LayoutParams(dp(54), dp(52)));

        return bar;
    }

    private TextView createBrowserBarButton(String text) {
        TextView button = new TextView(this);
        button.setText(text);
        button.setTextColor(Color.parseColor("#f0d78c"));
        button.setTextSize(13);
        button.setGravity(Gravity.CENTER);
        button.setSingleLine(true);
        return button;
    }

    private LinearLayout createTabBar() {
        LinearLayout tabs = new LinearLayout(this);
        tabs.setOrientation(LinearLayout.HORIZONTAL);
        tabs.setBackgroundColor(Color.parseColor("#101016"));
        tabs.setVisibility(View.GONE);
        tabs.setPadding(0, dp(2), 0, dp(2));

        String[] names = {"首页", "官方", "角色", "概念", "二创", "笑话"};
        String[] pages = {
            "zy.html",
            "official.html",
            "gfjs.html",
            "gfgn.html",
            "wjec.html",
            "qyxhhj.html"
        };
        String[] icons = {"⌂", "官", "角", "概", "创", "趣"};

        for (int index = 0; index < names.length; index++) {
            TextView tab = createTab(names[index], icons[index], pages[index]);
            LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                0,
                dp(58),
                1f
            );
            tabs.addView(tab, params);
        }
        return tabs;
    }

    private TextView createTab(String name, String icon, String page) {
        TextView tab = new TextView(this);
        tab.setTag(page);
        tab.setText(icon + "\n" + name);
        tab.setBackgroundColor(Color.parseColor("#101016"));
        tab.setTextSize(12);
        tab.setTextColor(Color.parseColor("#99ffffff"));
        tab.setGravity(Gravity.CENTER);
        tab.setContentDescription(name);
        tab.setOnClickListener(view -> {
            haptic();
            loadPage((String) view.getTag());
        });
        return tab;
    }

    private ImageView createSplash() {
        ImageView image = new ImageView(this);
        image.setScaleType(ImageView.ScaleType.CENTER_CROP);
        image.setBackgroundColor(Color.parseColor("#0a0a0f"));
        image.setContentDescription("诸神终应知晓启动页");

        Bitmap bitmap = loadSplash();
        if (bitmap != null) {
            image.setImageBitmap(bitmap);
        }
        image.setOnClickListener(view -> startApplication());

        AlphaAnimation fadeIn = new AlphaAnimation(0f, 1f);
        fadeIn.setDuration(500);
        fadeIn.setFillAfter(true);
        image.startAnimation(fadeIn);
        return image;
    }

    private void prepareSplashVideo(Surface surface) {
        releaseSplashPlayer();
        releasePendingSplashPlayer();
        SplashVideo video = selectSplashVideo();
        if (video == null) {
            if (splashVideoView != null) {
                splashVideoView.setVisibility(View.GONE);
            }
            if (splash != null && !gameStarted) {
                splash.setVisibility(View.VISIBLE);
            }
            Log.i(TAG, "splash_video_disabled");
            return;
        }
        AssetFileDescriptor descriptor = null;
        MediaPlayer player = null;
        try {
            descriptor = getAssets().openFd(video.assetPath);
            player = new MediaPlayer();
            pendingSplashPlayer = player;
            player.setSurface(surface);
            player.setDataSource(
                descriptor.getFileDescriptor(),
                descriptor.getStartOffset(),
                descriptor.getLength()
            );
            descriptor.close();
            descriptor = null;
            player.setLooping(true);
            player.setVolume(0f, 0f);
            player.setOnPreparedListener(preparedPlayer -> {
                if (pendingSplashPlayer != preparedPlayer) {
                    preparedPlayer.release();
                    return;
                }
                pendingSplashPlayer = null;
                if (gameStarted) {
                    preparedPlayer.release();
                    return;
                }
                splashPlayer = preparedPlayer;
                preparedPlayer.start();
                if (!gameStarted && splash != null) {
                    splash.setVisibility(View.GONE);
                }
            });
            player.setOnErrorListener((ignoredPlayer, what, extra) -> {
                Log.w(
                    TAG,
                    "splash_video_play_failed what=" + what + " extra=" + extra
                );
                pendingSplashPlayer = null;
                if (splash != null && !gameStarted) {
                    splash.setVisibility(View.VISIBLE);
                }
                releasePlayer(ignoredPlayer);
                return true;
            });
            player.prepareAsync();
            player = null;
        } catch (Exception error) {
            Log.w(TAG, "splash_video_prepare_failed", error);
            if (pendingSplashPlayer != null) {
                releasePendingSplashPlayer();
            } else if (player != null) {
                releasePlayer(player);
            }
            if (splash != null && !gameStarted) {
                splash.setVisibility(View.VISIBLE);
            }
        } finally {
            if (descriptor != null) {
                try {
                    descriptor.close();
                } catch (IOException error) {
                    Log.d(TAG, "splash_video_descriptor_close_failed", error);
                }
            }
        }
    }

    private SplashVideo selectSplashVideo() {
        String mode = preferences.getString(
            PREF_SPLASH_VIDEO_MODE,
            SPLASH_VIDEO_RANDOM
        );
        if (SPLASH_VIDEO_NONE.equals(mode)) {
            return null;
        }
        if (SPLASH_VIDEO_RANDOM.equals(mode)) {
            return SPLASH_VIDEOS[random.nextInt(SPLASH_VIDEOS.length)];
        }
        for (SplashVideo video : SPLASH_VIDEOS) {
            if (video.id.equals(mode)) {
                return video;
            }
        }
        return SPLASH_VIDEOS[random.nextInt(SPLASH_VIDEOS.length)];
    }

    private String normalizeSplashVideoMode(String mode) {
        if (SPLASH_VIDEO_NONE.equals(mode)) {
            return SPLASH_VIDEO_NONE;
        }
        if (SPLASH_VIDEO_RANDOM.equals(mode)) {
            return SPLASH_VIDEO_RANDOM;
        }
        for (SplashVideo video : SPLASH_VIDEOS) {
            if (video.id.equals(mode)) {
                return video.id;
            }
        }
        return SPLASH_VIDEO_RANDOM;
    }

    private void releaseSplashPlayer() {
        if (splashPlayer == null) {
            return;
        }
        releasePlayer(splashPlayer);
        splashPlayer = null;
    }

    private void releasePendingSplashPlayer() {
        if (pendingSplashPlayer == null) {
            return;
        }
        releasePlayer(pendingSplashPlayer);
        pendingSplashPlayer = null;
    }

    private void openNativeVideo(String assetPath, String title) {
        pendingNativeVideoAssetPath = assetPath;
        if (nativeVideoTitle != null) {
            nativeVideoTitle.setText(title == null || title.isEmpty()
                ? "视频播放"
                : title);
        }
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
        if (nativeVideoOverlay != null) {
            nativeVideoOverlay.setVisibility(View.VISIBLE);
            nativeVideoOverlay.bringToFront();
        }
        pauseBackgroundMusicForLifecycle();
        if (nativeVideoSurface != null) {
            playNativeVideoAsset(assetPath);
        }
    }

    private void playNativeVideoAsset(String assetPath) {
        if (nativeVideoSurface == null) {
            pendingNativeVideoAssetPath = assetPath;
            return;
        }
        releaseNativeVideoPlayer();
        AssetFileDescriptor descriptor = null;
        MediaPlayer player = null;
        try {
            descriptor = getAssets().openFd(assetPath);
            player = new MediaPlayer();
            nativeVideoPlayer = player;
            player.setSurface(nativeVideoSurface);
            player.setDataSource(
                descriptor.getFileDescriptor(),
                descriptor.getStartOffset(),
                descriptor.getLength()
            );
            descriptor.close();
            descriptor = null;
            player.setLooping(false);
            player.setVolume(1f, 1f);
            player.setOnPreparedListener(preparedPlayer -> {
                if (nativeVideoPlayer != preparedPlayer) {
                    preparedPlayer.release();
                    return;
                }
                preparedPlayer.start();
                Log.i(TAG, "native_video_started asset=" + assetPath);
            });
            player.setOnCompletionListener(ignoredPlayer -> {
                showToast("视频播放完成");
            });
            player.setOnErrorListener((ignoredPlayer, what, extra) -> {
                Log.w(
                    TAG,
                    "native_video_play_failed asset=" + assetPath +
                        " what=" + what + " extra=" + extra
                );
                showToast("视频播放失败");
                closeNativeVideoOverlay();
                return true;
            });
            player.prepareAsync();
            player = null;
        } catch (Exception error) {
            Log.w(TAG, "native_video_prepare_failed asset=" + assetPath, error);
            if (nativeVideoPlayer != null) {
                releaseNativeVideoPlayer();
            } else if (player != null) {
                releasePlayer(player);
            }
            showToast("视频播放失败");
            closeNativeVideoOverlay();
        } finally {
            if (descriptor != null) {
                try {
                    descriptor.close();
                } catch (IOException error) {
                    Log.d(TAG, "native_video_descriptor_close_failed", error);
                }
            }
        }
    }

    private void closeNativeVideoOverlay() {
        pendingNativeVideoAssetPath = null;
        releaseNativeVideoPlayer();
        if (nativeVideoOverlay != null) {
            nativeVideoOverlay.setVisibility(View.GONE);
        }
        resumeBackgroundMusicForLifecycle();
        applyOrientationMode(
            preferences.getString(PREF_ORIENTATION_MODE, ORIENTATION_AUTO)
        );
    }

    private void releaseNativeVideoPlayer() {
        if (nativeVideoPlayer == null) {
            return;
        }
        releasePlayer(nativeVideoPlayer);
        nativeVideoPlayer = null;
    }

    private boolean isBackgroundMusicEnabled() {
        return preferences.getBoolean(PREF_BACKGROUND_MUSIC_ENABLED, true);
    }

    private int getBackgroundMusicVolumePercent() {
        return clampVolumePercent(
            preferences.getInt(
                PREF_BACKGROUND_MUSIC_VOLUME,
                DEFAULT_BACKGROUND_MUSIC_VOLUME
            )
        );
    }

    private int clampVolumePercent(int percent) {
        if (percent < 0) {
            return 0;
        }
        if (percent > 100) {
            return 100;
        }
        return percent;
    }

    private float getBackgroundMusicVolume() {
        return getBackgroundMusicVolumePercent() / 100f;
    }

    private void applyBackgroundMusicVolume() {
        if (backgroundMusicPlayer == null) {
            return;
        }
        float volume = getBackgroundMusicVolume();
        backgroundMusicPlayer.setVolume(volume, volume);
    }

    private void startBackgroundMusicIfEnabled() {
        if (!gameStarted || !isBackgroundMusicEnabled()) {
            releaseBackgroundMusicPlayer();
            return;
        }
        if (backgroundMusicPlayer != null) {
            applyBackgroundMusicVolume();
            try {
                if (!backgroundMusicPlayer.isPlaying()) {
                    backgroundMusicPlayer.start();
                }
            } catch (IllegalStateException error) {
                Log.w(TAG, "background_music_resume_failed", error);
                releaseBackgroundMusicPlayer();
            }
            return;
        }
        prepareBackgroundMusic();
    }

    private void prepareBackgroundMusic() {
        AssetFileDescriptor descriptor = null;
        MediaPlayer player = null;
        try {
            descriptor = getAssets().openFd(BACKGROUND_MUSIC_ASSET_PATH);
            player = new MediaPlayer();
            player.setDataSource(
                descriptor.getFileDescriptor(),
                descriptor.getStartOffset(),
                descriptor.getLength()
            );
            descriptor.close();
            descriptor = null;
            player.setLooping(true);
            backgroundMusicPlayer = player;
            applyBackgroundMusicVolume();
            player.setOnPreparedListener(preparedPlayer -> {
                if (backgroundMusicPlayer != preparedPlayer) {
                    preparedPlayer.release();
                    return;
                }
                if (!gameStarted || !isBackgroundMusicEnabled()) {
                    releaseBackgroundMusicPlayer();
                    return;
                }
                preparedPlayer.start();
                Log.i(
                    TAG,
                    "background_music_started volume_percent=" +
                        getBackgroundMusicVolumePercent()
                );
            });
            player.setOnErrorListener((ignoredPlayer, what, extra) -> {
                Log.w(
                    TAG,
                    "background_music_play_failed what=" + what +
                        " extra=" + extra
                );
                if (backgroundMusicPlayer == ignoredPlayer) {
                    backgroundMusicPlayer = null;
                }
                releasePlayer(ignoredPlayer);
                return true;
            });
            player.prepareAsync();
            player = null;
        } catch (Exception error) {
            Log.w(TAG, "background_music_prepare_failed", error);
            if (backgroundMusicPlayer != null) {
                releaseBackgroundMusicPlayer();
            } else if (player != null) {
                releasePlayer(player);
            }
        } finally {
            if (descriptor != null) {
                try {
                    descriptor.close();
                } catch (IOException error) {
                    Log.d(
                        TAG,
                        "background_music_descriptor_close_failed",
                        error
                    );
                }
            }
        }
    }

    private void pauseBackgroundMusicForLifecycle() {
        backgroundMusicPausedByLifecycle = false;
        if (backgroundMusicPlayer == null) {
            return;
        }
        try {
            if (backgroundMusicPlayer.isPlaying()) {
                backgroundMusicPlayer.pause();
                backgroundMusicPausedByLifecycle = true;
            }
        } catch (IllegalStateException error) {
            Log.w(TAG, "background_music_pause_failed", error);
            releaseBackgroundMusicPlayer();
        }
    }

    private void resumeBackgroundMusicForLifecycle() {
        if (!backgroundMusicPausedByLifecycle) {
            return;
        }
        backgroundMusicPausedByLifecycle = false;
        startBackgroundMusicIfEnabled();
    }

    private void releaseBackgroundMusicPlayer() {
        if (backgroundMusicPlayer == null) {
            return;
        }
        releasePlayer(backgroundMusicPlayer);
        backgroundMusicPlayer = null;
        backgroundMusicPausedByLifecycle = false;
    }

    private void releasePlayer(MediaPlayer player) {
        if (player == null) {
            return;
        }
        try {
            player.stop();
        } catch (IllegalStateException error) {
            Log.d(TAG, "splash_player_stop_ignored", error);
        }
        player.release();
    }

    private TextView createHintText() {
        TextView hint = new TextView(this);
        hint.setText("点击任意位置开始");
        hint.setTextColor(Color.argb(190, 240, 215, 140));
        hint.setTextSize(15);
        hint.setGravity(Gravity.CENTER);

        AlphaAnimation pulse = new AlphaAnimation(0.45f, 1f);
        pulse.setDuration(1500);
        pulse.setRepeatMode(Animation.REVERSE);
        pulse.setRepeatCount(Animation.INFINITE);
        hint.startAnimation(pulse);
        return hint;
    }

    private void startApplication() {
        if (gameStarted) {
            return;
        }
        gameStarted = true;
        haptic();
        applyOrientationMode(
            preferences.getString(PREF_ORIENTATION_MODE, ORIENTATION_AUTO)
        );
        hintText.clearAnimation();
        hintText.setVisibility(View.GONE);
        releaseSplashPlayer();
        splashVideoView.setVisibility(View.GONE);
        startBackgroundMusicIfEnabled();
        showLoading();
        loadPage(HOME_PAGE);
    }

    private void loadPage(String page) {
        if (!isKnownPage(page)) {
            showToast("页面地址无效");
            return;
        }
        closeBrowserBarOnly();
        webView.loadUrl(BASE_URL + page);
    }

    private boolean isKnownPage(String page) {
        return "zy.html".equals(page)
            || "official.html".equals(page)
            || "gfjs.html".equals(page)
            || "gfgn.html".equals(page)
            || "wjec.html".equals(page)
            || "qyxhhj.html".equals(page)
            || "settings.html".equals(page);
    }

    private boolean handleNavigation(Uri uri) {
        if ("zhushen-video".equalsIgnoreCase(uri.getScheme())) {
            openNativeVideoFromUri(uri);
            return true;
        }
        if (isTrustedAssetUri(uri)) {
            return false;
        }
        if ("mqqapi".equalsIgnoreCase(uri.getScheme())) {
            openExternal(uri, "未找到可处理 QQ 群链接的应用");
            return true;
        }
        if ("https".equalsIgnoreCase(uri.getScheme())
            && isAllowedExternalHost(uri.getHost())) {
            openInternalBrowser(uri);
            return true;
        }
        if (isInternalBrowserVisible()
            && "https".equalsIgnoreCase(uri.getScheme())) {
            openExternal(uri, "未找到可打开此链接的应用");
            return true;
        }
        showToast("已拦截未授权的外部链接");
        return true;
    }

    private void openNativeVideoFromUri(Uri uri) {
        String host = uri.getHost();
        if (!"play".equalsIgnoreCase(host)) {
            showToast("视频地址无效");
            return;
        }
        try {
            String src = uri.getQueryParameter("src");
            String title = uri.getQueryParameter("title");
            openNativeVideo(normalizeVideoAssetPath(src), title);
        } catch (IllegalArgumentException error) {
            Log.w(TAG, "native_video_uri_rejected uri=" + uri, error);
            showToast("视频地址无效");
        }
    }

    private void openInternalBrowser(Uri uri) {
        currentExternalUri = uri;
        browserTitle.setText(labelForExternalHost(uri.getHost()));
        browserBar.setVisibility(View.VISIBLE);
        tabBar.setVisibility(View.GONE);
        updateWebViewTopInset(dp(52));
        showLoading();
        webView.loadUrl(uri.toString());
    }

    private boolean isInternalBrowserVisible() {
        return browserBar != null && browserBar.getVisibility() == View.VISIBLE;
    }

    private void closeBrowserBarOnly() {
        currentExternalUri = null;
        if (browserBar != null) {
            browserBar.setVisibility(View.GONE);
        }
        if (webView != null) {
            updateWebViewTopInset(0);
        }
    }

    private void updateWebViewTopInset(int topInset) {
        if (webView == null) {
            return;
        }
        if (webView.getLayoutParams() instanceof FrameLayout.LayoutParams) {
            FrameLayout.LayoutParams params =
                (FrameLayout.LayoutParams) webView.getLayoutParams();
            params.topMargin = topInset;
            webView.setLayoutParams(params);
        }
        webView.setPadding(0, 0, 0, 0);
    }

    private String labelForExternalHost(String host) {
        if (host == null) {
            return "内置网页";
        }
        String normalized = host.toLowerCase(Locale.ROOT);
        if (normalized.contains("docs.qq.com")) {
            return "问答";
        }
        if (normalized.contains("taptap.cn")) {
            return "论坛";
        }
        return host;
    }

    private boolean isTrustedAssetUri(Uri uri) {
        return "https".equalsIgnoreCase(uri.getScheme())
            && "appassets.androidplatform.net".equalsIgnoreCase(uri.getHost())
            && uri.getPath() != null
            && uri.getPath().startsWith("/assets/");
    }

    private boolean isAllowedExternalHost(String host) {
        if (host == null) {
            return false;
        }
        String normalized = host.toLowerCase(Locale.ROOT);
        return normalized.equals("docs.qq.com")
            || normalized.endsWith(".docs.qq.com")
            || normalized.equals("www.taptap.cn")
            || normalized.equals("taptap.cn")
            || normalized.endsWith(".taptap.cn");
    }

    private void openExternal(Uri uri, String errorMessage) {
        Intent intent = new Intent(Intent.ACTION_VIEW, uri);
        try {
            startActivity(intent);
        } catch (ActivityNotFoundException error) {
            Log.w(TAG, "external_navigation_unavailable", error);
            showToast(errorMessage);
        }
    }

    private WebResourceResponse createMediaResponse(
        Uri uri,
        Map<String, String> requestHeaders
    ) {
        if (!isTrustedAssetUri(uri) || !isMediaPath(uri.getPath())) {
            return null;
        }

        String assetPath = assetPathFromUri(uri);
        try {
            AssetFileDescriptor descriptor = getAssets().openFd(assetPath);
            long assetLength = descriptor.getLength();
            long start = parseRangeStart(requestHeaders.get("Range"));
            if (start < 0 || start >= assetLength) {
                descriptor.close();
                return null;
            }

            long responseLength = assetLength - start;
            InputStream stream = descriptor.createInputStream();
            skipFully(stream, start);
            InputStream boundedStream = new BoundedInputStream(
                stream,
                responseLength,
                descriptor
            );

            Map<String, String> responseHeaders = new HashMap<>();
            responseHeaders.put("Accept-Ranges", "bytes");
            responseHeaders.put(
                "Content-Length",
                Long.toString(responseLength)
            );

            int statusCode = 200;
            String reason = "OK";
            if (start > 0) {
                statusCode = 206;
                reason = "Partial Content";
                responseHeaders.put(
                    "Content-Range",
                    "bytes "
                        + start
                        + "-"
                        + (assetLength - 1)
                        + "/"
                        + assetLength
                );
            }

            return new WebResourceResponse(
                mimeTypeForPath(assetPath),
                null,
                statusCode,
                reason,
                responseHeaders,
                boundedStream
            );
        } catch (IOException | NumberFormatException error) {
            Log.e(TAG, "media_asset_open_failed", error);
            return null;
        }
    }

    private long parseRangeStart(String rangeHeader) {
        if (rangeHeader == null || !rangeHeader.startsWith("bytes=")) {
            return 0;
        }
        String value = rangeHeader.substring("bytes=".length());
        int separator = value.indexOf('-');
        String startValue = separator >= 0
            ? value.substring(0, separator)
            : value;
        return Long.parseLong(startValue);
    }

    private boolean isMediaPath(String path) {
        if (path == null) {
            return false;
        }
        String normalized = path.toLowerCase(Locale.ROOT);
        return normalized.endsWith(".mp4")
            || normalized.endsWith(".webm")
            || normalized.endsWith(".ogg");
    }

    private String assetPathFromUri(Uri uri) {
        String path = uri.getPath();
        if (path == null || !path.startsWith("/assets/")) {
            throw new IllegalArgumentException("不受信任的资源地址");
        }
        return Uri.decode(path.substring("/assets/".length()));
    }

    private String normalizeVideoAssetPath(String src) {
        if (src == null || src.trim().isEmpty()) {
            throw new IllegalArgumentException("视频地址为空");
        }
        String normalized = src.trim();
        if (normalized.startsWith(BASE_URL)) {
            normalized = normalized.substring(BASE_URL.length());
        } else if (normalized.startsWith("/assets/")) {
            normalized = normalized.substring("/assets/".length());
        } else if (normalized.startsWith("https://")) {
            Uri uri = Uri.parse(normalized);
            if (!isTrustedAssetUri(uri)) {
                throw new IllegalArgumentException("视频地址不是应用内资源");
            }
            normalized = assetPathFromUri(uri);
        }
        while (normalized.startsWith("/")) {
            normalized = normalized.substring(1);
        }
        normalized = Uri.decode(normalized);
        if (normalized.contains("..") || !normalized.endsWith(".mp4")) {
            throw new IllegalArgumentException("视频资源路径不合法");
        }
        return normalized;
    }

    private void skipFully(InputStream stream, long amount) throws IOException {
        long remaining = amount;
        while (remaining > 0) {
            long skipped = stream.skip(remaining);
            if (skipped <= 0) {
                if (stream.read() == -1) {
                    throw new IOException("资源数据提前结束");
                }
                skipped = 1;
            }
            remaining -= skipped;
        }
    }

    private void injectEnhancements(WebView view) {
        String script =
            "(function(){"
                + "if(document.getElementById('_app_enhancements'))return;"
                + "var s=document.createElement('script');"
                + "s.id='_app_enhancements';"
                + "s.src='"
                + BASE_URL
                + "app-enhancements.js';"
                + "document.head.appendChild(s);"
                + "})();";
        view.evaluateJavascript(script, null);
    }

    private void revealContentAfterLoad() {
        if (!firstLoad) {
            loadingOverlay.setVisibility(View.GONE);
            tabBar.setVisibility(View.VISIBLE);
            return;
        }
        firstLoad = false;
        mainHandler.postDelayed(() -> {
            AlphaAnimation fade = new AlphaAnimation(1f, 0f);
            fade.setDuration(250);
            fade.setAnimationListener(new Animation.AnimationListener() {
                @Override
                public void onAnimationStart(Animation animation) {
                }

                @Override
                public void onAnimationEnd(Animation animation) {
                    releaseSplashPlayer();
                    splashVideoView.setVisibility(View.GONE);
                    splash.setVisibility(View.GONE);
                    webView.setVisibility(View.VISIBLE);
                    loadingOverlay.setVisibility(View.GONE);
                    tabBar.setVisibility(View.VISIBLE);
                }

                @Override
                public void onAnimationRepeat(Animation animation) {
                }
            });
            splash.startAnimation(fade);
        }, 120);
    }

    private void revealExternalContentAfterLoad(Uri uri) {
        currentExternalUri = uri;
        if (!isInternalBrowserVisible()) {
            loadingOverlay.setVisibility(View.GONE);
            return;
        }
        tabBar.setVisibility(View.GONE);
        if (!firstLoad) {
            loadingOverlay.setVisibility(View.GONE);
            return;
        }
        firstLoad = false;
        mainHandler.postDelayed(() -> {
            splash.setVisibility(View.GONE);
            webView.setVisibility(View.VISIBLE);
            loadingOverlay.setVisibility(View.GONE);
        }, 120);
    }

    private void updateSelectedTab(String url) {
        for (int index = 0; index < tabBar.getChildCount(); index++) {
            TextView tab = (TextView) tabBar.getChildAt(index);
            String page = (String) tab.getTag();
            boolean selected = url.endsWith("/" + page);
            tab.setTextColor(
                Color.parseColor(selected ? "#f0d78c" : "#99ffffff")
            );
            tab.setSelected(selected);
        }
    }

    private boolean showImageActions(View ignoredView) {
        WebView.HitTestResult result = webView.getHitTestResult();
        if (result == null
            || result.getType() != WebView.HitTestResult.IMAGE_TYPE) {
            return false;
        }

        String imageUrl = result.getExtra();
        if (!isTrustedAssetUri(Uri.parse(imageUrl))) {
            showToast("只能处理应用内图片");
            return true;
        }

        PopupMenu menu = new PopupMenu(this, webView);
        menu.getMenu().add("保存图片");
        menu.getMenu().add("分享图片");
        menu.setOnMenuItemClickListener(item -> {
            if ("保存图片".contentEquals(item.getTitle())) {
                requestSaveImage(imageUrl);
            } else {
                shareImage(imageUrl);
            }
            return true;
        });
        menu.show();
        return true;
    }

    private void requestSaveImage(String imageUrl) {
        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.P
            && ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.WRITE_EXTERNAL_STORAGE
            ) != PackageManager.PERMISSION_GRANTED) {
            pendingSaveUrl = imageUrl;
            requestPermissions(
                new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE},
                STORAGE_PERMISSION_REQUEST
            );
            return;
        }
        saveImage(imageUrl);
    }

    private void saveImage(String imageUrl) {
        ioExecutor.execute(() -> {
            Uri imageUri = null;
            try {
                Uri sourceUri = Uri.parse(imageUrl);
                String assetPath = assetPathFromUri(sourceUri);
                String fileName = fileNameForPath(assetPath);
                String mimeType = mimeTypeForPath(assetPath);

                ContentValues values = new ContentValues();
                values.put(MediaStore.Images.Media.DISPLAY_NAME, fileName);
                values.put(MediaStore.Images.Media.MIME_TYPE, mimeType);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    values.put(
                        MediaStore.Images.Media.RELATIVE_PATH,
                        Environment.DIRECTORY_PICTURES + "/诸神终应知晓"
                    );
                    values.put(MediaStore.Images.Media.IS_PENDING, 1);
                } else {
                    File directory = new File(
                        Environment.getExternalStoragePublicDirectory(
                            Environment.DIRECTORY_PICTURES
                        ),
                        "诸神终应知晓"
                    );
                    if (!directory.exists() && !directory.mkdirs()) {
                        throw new IOException("无法创建图片目录");
                    }
                    values.put(
                        MediaStore.Images.Media.DATA,
                        new File(directory, fileName).getAbsolutePath()
                    );
                }

                imageUri = getContentResolver().insert(
                    MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                    values
                );
                if (imageUri == null) {
                    throw new IOException("系统未创建图片记录");
                }

                try (
                    InputStream input = getAssets().open(assetPath);
                    OutputStream output =
                        getContentResolver().openOutputStream(imageUri)
                ) {
                    if (output == null) {
                        throw new IOException("无法打开图片输出流");
                    }
                    copyStream(input, output);
                }

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    ContentValues readyValues = new ContentValues();
                    readyValues.put(MediaStore.Images.Media.IS_PENDING, 0);
                    getContentResolver().update(
                        imageUri,
                        readyValues,
                        null,
                        null
                    );
                }
                showToast("图片已保存到系统相册");
            } catch (IOException | IllegalArgumentException error) {
                if (imageUri != null) {
                    getContentResolver().delete(imageUri, null, null);
                }
                Log.e(TAG, "image_save_failed", error);
                showToast("保存失败，请检查存储空间后重试");
            }
        });
    }

    private void shareImage(String imageUrl) {
        ioExecutor.execute(() -> {
            try {
                Uri sourceUri = Uri.parse(imageUrl);
                String assetPath = assetPathFromUri(sourceUri);
                File shareDirectory = new File(
                    getCacheDir(),
                    "shared_images"
                );
                if (!shareDirectory.exists() && !shareDirectory.mkdirs()) {
                    throw new IOException("无法创建分享缓存目录");
                }

                File shareFile = new File(
                    shareDirectory,
                    fileNameForPath(assetPath)
                );
                try (
                    InputStream input = getAssets().open(assetPath);
                    OutputStream output = new FileOutputStream(shareFile)
                ) {
                    copyStream(input, output);
                }

                Uri contentUri = FileProvider.getUriForFile(
                    this,
                    getPackageName() + ".fileprovider",
                    shareFile
                );
                Intent shareIntent = new Intent(Intent.ACTION_SEND);
                shareIntent.setType(mimeTypeForPath(assetPath));
                shareIntent.putExtra(Intent.EXTRA_STREAM, contentUri);
                shareIntent.addFlags(
                    Intent.FLAG_GRANT_READ_URI_PERMISSION
                );

                mainHandler.post(() -> {
                    try {
                        startActivity(
                            Intent.createChooser(shareIntent, "分享图片")
                        );
                    } catch (ActivityNotFoundException error) {
                        Log.w(TAG, "image_share_target_missing", error);
                        showToast("未找到可分享图片的应用");
                    }
                });
            } catch (IOException | IllegalArgumentException error) {
                Log.e(TAG, "image_share_failed", error);
                showToast("图片准备失败，请稍后重试");
            }
        });
    }

    private String fileNameForPath(String path) {
        int separator = path.lastIndexOf('/');
        String rawName = separator >= 0 ? path.substring(separator + 1) : path;
        String safeName = rawName.replaceAll(
            "[\\\\/:*?\"<>|\\p{Cntrl}]",
            "_"
        );
        if (safeName.trim().isEmpty()) {
            return "zhushen_image_" + System.currentTimeMillis() + ".jpg";
        }
        return safeName;
    }

    private String mimeTypeForPath(String path) {
        String extension = MimeTypeMap.getFileExtensionFromUrl(path);
        String mimeType = MimeTypeMap.getSingleton()
            .getMimeTypeFromExtension(extension.toLowerCase(Locale.ROOT));
        return mimeType == null ? "application/octet-stream" : mimeType;
    }

    private void copyStream(InputStream input, OutputStream output)
        throws IOException {
        byte[] buffer = new byte[64 * 1024];
        int read;
        while ((read = input.read(buffer)) != -1) {
            output.write(buffer, 0, read);
        }
        output.flush();
    }

    private Bitmap loadSplash() {
        try (InputStream input = getAssets().open("splash.jpg")) {
            BitmapFactory.Options options = new BitmapFactory.Options();
            options.inPreferredConfig = Bitmap.Config.RGB_565;
            return BitmapFactory.decodeStream(input, null, options);
        } catch (IOException error) {
            Log.e(TAG, "splash_asset_load_failed", error);
            return BitmapFactory.decodeResource(
                getResources(),
                R.drawable.splash
            );
        }
    }

    private void showErrorPage(String message) {
        String escaped = message
            .replace("\\", "\\\\")
            .replace("'", "\\'");
        webView.loadDataWithBaseURL(
            BASE_URL,
            "<!doctype html><html lang=\"zh-CN\"><meta charset=\"utf-8\">"
                + "<meta name=\"viewport\" content=\"width=device-width,"
                + "initial-scale=1\"><body style=\"margin:0;background:#0a0a0f;"
                + "color:#f0d78c;font-family:sans-serif;text-align:center;"
                + "padding:40vh 24px 0;font-size:18px;\">"
                + escaped
                + "</body></html>",
            "text/html",
            "UTF-8",
            null
        );
        loadingOverlay.setVisibility(View.GONE);
    }

    private void showLoading() {
        loadingOverlay.setVisibility(View.VISIBLE);
    }

    private void showToast(String message) {
        mainHandler.post(
            () -> Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
        );
    }

    private void haptic() {
        if (vibrator == null || !vibrator.hasVibrator()) {
            return;
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(
                VibrationEffect.createOneShot(
                    30,
                    VibrationEffect.DEFAULT_AMPLITUDE
                )
            );
        } else {
            vibrator.vibrate(30);
        }
    }

    private FrameLayout.LayoutParams matchParentParams() {
        return new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        );
    }

    private int dp(int value) {
        return (int) (
            value * getResources().getDisplayMetrics().density + 0.5f
        );
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != AVATAR_FILE_REQUEST || pendingFileChooser == null) {
            return;
        }
        Uri[] result = WebChromeClient.FileChooserParams.parseResult(
            resultCode,
            data
        );
        pendingFileChooser.onReceiveValue(result);
        pendingFileChooser = null;
    }

    @Override
    public void onRequestPermissionsResult(
        int requestCode,
        @NonNull String[] permissions,
        @NonNull int[] grantResults
    ) {
        super.onRequestPermissionsResult(
            requestCode,
            permissions,
            grantResults
        );
        if (requestCode != STORAGE_PERMISSION_REQUEST) {
            return;
        }
        String imageUrl = pendingSaveUrl;
        pendingSaveUrl = null;
        if (grantResults.length > 0
            && grantResults[0] == PackageManager.PERMISSION_GRANTED
            && imageUrl != null) {
            saveImage(imageUrl);
            return;
        }
        showToast("未获得存储权限，无法保存图片");
    }

    @Override
    protected void onPause() {
        super.onPause();
        pauseBackgroundMusicForLifecycle();
        if (webView != null) {
            webView.onPause();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        applyImmersiveSystemBars();
        if (webView != null) {
            webView.onResume();
        }
        resumeBackgroundMusicForLifecycle();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            applyImmersiveSystemBars();
        }
    }

    @Override
    protected void onDestroy() {
        mainHandler.removeCallbacksAndMessages(null);
        if (pendingFileChooser != null) {
            pendingFileChooser.onReceiveValue(null);
            pendingFileChooser = null;
        }
        ioExecutor.shutdownNow();
        if (webView != null) {
            webView.removeJavascriptInterface("Android");
            webView.stopLoading();
            webView.loadUrl("about:blank");
            webView.clearHistory();
            webView.destroy();
            webView = null;
        }
        releasePendingSplashPlayer();
        releaseSplashPlayer();
        closeNativeVideoOverlay();
        releaseBackgroundMusicPlayer();
        if (splashSurface != null) {
            splashSurface.release();
            splashSurface = null;
        }
        if (nativeVideoSurface != null) {
            nativeVideoSurface.release();
            nativeVideoSurface = null;
        }
        if (splash != null) {
            splash.setImageDrawable(null);
        }
        super.onDestroy();
    }

    private void handleBackNavigation() {
        haptic();
        if (nativeVideoOverlay != null
            && nativeVideoOverlay.getVisibility() == View.VISIBLE) {
            closeNativeVideoOverlay();
            exitTwice = false;
            return;
        }
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
            exitTwice = false;
            return;
        }
        if (exitTwice) {
            finish();
            return;
        }
        exitTwice = true;
        showToast("再按一次退出");
        mainHandler.postDelayed(() -> exitTwice = false, 2000);
    }

    public final class AppBridge {
        @JavascriptInterface
        public void setSkipDisclaimer(boolean skip) {
            preferences.edit()
                .putBoolean(PREF_SKIP_DISCLAIMER, skip)
                .apply();
        }

        @JavascriptInterface
        public boolean shouldShowDisclaimer() {
            return !preferences.getBoolean(
                PREF_SKIP_DISCLAIMER,
                false
            );
        }

        @JavascriptInterface
        public void setOrientationMode(String mode) {
            String normalizedMode = normalizeOrientationMode(mode);
            preferences.edit()
                .putString(PREF_ORIENTATION_MODE, normalizedMode)
                .apply();
            mainHandler.post(() -> applyOrientationMode(normalizedMode));
        }

        @JavascriptInterface
        public String getOrientationMode() {
            return preferences.getString(
                PREF_ORIENTATION_MODE,
                ORIENTATION_AUTO
            );
        }

        @JavascriptInterface
        public void setSplashVideoMode(String mode) {
            String normalizedMode = normalizeSplashVideoMode(mode);
            preferences.edit()
                .putString(PREF_SPLASH_VIDEO_MODE, normalizedMode)
                .apply();
        }

        @JavascriptInterface
        public String getSplashVideoMode() {
            return preferences.getString(
                PREF_SPLASH_VIDEO_MODE,
                SPLASH_VIDEO_RANDOM
            );
        }

        @JavascriptInterface
        public void setBackgroundMusicEnabled(boolean enabled) {
            preferences.edit()
                .putBoolean(PREF_BACKGROUND_MUSIC_ENABLED, enabled)
                .apply();
            mainHandler.post(() -> {
                if (enabled) {
                    startBackgroundMusicIfEnabled();
                    return;
                }
                releaseBackgroundMusicPlayer();
            });
        }

        @JavascriptInterface
        public boolean isBackgroundMusicEnabled() {
            return MainActivity.this.isBackgroundMusicEnabled();
        }

        @JavascriptInterface
        public void setBackgroundMusicVolume(int percent) {
            int normalizedPercent = clampVolumePercent(percent);
            preferences.edit()
                .putInt(PREF_BACKGROUND_MUSIC_VOLUME, normalizedPercent)
                .apply();
            mainHandler.post(() -> {
                applyBackgroundMusicVolume();
                startBackgroundMusicIfEnabled();
            });
        }

        @JavascriptInterface
        public int getBackgroundMusicVolume() {
            return getBackgroundMusicVolumePercent();
        }

        @JavascriptInterface
        public void openNativeVideo(String src, String title) {
            try {
                String assetPath = normalizeVideoAssetPath(src);
                mainHandler.post(() -> openNativeVideo(assetPath, title));
            } catch (IllegalArgumentException error) {
                Log.w(TAG, "native_video_path_rejected src=" + src, error);
                mainHandler.post(() -> showToast("视频地址无效"));
            }
        }
    }

    private static final class SplashVideo {
        private final String id;
        private final String label;
        private final String assetPath;

        private SplashVideo(String id, String label, String assetPath) {
            this.id = id;
            this.label = label;
            this.assetPath = assetPath;
        }
    }

    private static final class BoundedInputStream extends FilterInputStream {

        private long remaining;
        private final AssetFileDescriptor descriptor;

        private BoundedInputStream(
            InputStream stream,
            long remaining,
            AssetFileDescriptor descriptor
        ) {
            super(stream);
            this.remaining = remaining;
            this.descriptor = descriptor;
        }

        @Override
        public int read() throws IOException {
            if (remaining <= 0) {
                return -1;
            }
            int value = super.read();
            if (value >= 0) {
                remaining--;
            }
            return value;
        }

        @Override
        public int read(byte[] buffer, int offset, int length)
            throws IOException {
            if (remaining <= 0) {
                return -1;
            }
            int allowedLength = (int) Math.min(length, remaining);
            int read = super.read(buffer, offset, allowedLength);
            if (read > 0) {
                remaining -= read;
            }
            return read;
        }

        @Override
        public void close() throws IOException {
            IOException failure = null;
            try {
                super.close();
            } catch (IOException error) {
                failure = error;
            }
            try {
                descriptor.close();
            } catch (IOException error) {
                if (failure == null) {
                    failure = error;
                }
            }
            if (failure != null) {
                throw failure;
            }
        }
    }
}
