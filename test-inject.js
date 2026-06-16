// Replicate the EXACT JavaScript that Java will inject
// (this is what the WebView will execute)

// First, let's construct the JS string exactly as Java will
// Java concatenation produces this string value:

var style = document.createElement('style');
style.textContent = '* { -webkit-overflow-scrolling: touch; scroll-behavior: smooth; }';
document.head.appendChild(style);

var overlay = document.createElement('div');
overlay.id = '_disclaimer_overlay';
// The innerHTML below is exactly what Java's string concatenation produces
overlay.innerHTML = '<div style="position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.75);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);animation:fadeIn 0.4s ease;"><div style="background:rgba(22,22,30,0.92);border:1px solid rgba(212,167,84,0.3);border-radius:20px;padding:36px 28px 28px;max-width:340px;width:88%;text-align:center;box-shadow:0 24px 80px rgba(0,0,0,0.6),0 0 40px rgba(212,167,84,0.06);animation:slideUp 0.5s cubic-bezier(0.16,1,0.3,1);"><div style="font-size:40px;margin-bottom:16px;line-height:1;">\u2694\uFE0F</div><h3 style="color:#f0d78c;font-size:19px;font-weight:700;margin:0 0 14px;letter-spacing:0.06em;">\u58F0\u660E</h3><p style="color:rgba(224,213,192,0.78);font-size:14.5px;line-height:1.9;margin:0 0 24px;">\u8BE5\u5185\u5BB9\u4E3A\u73A9\u5BB6\u5171\u521B\uFF0C\u4E0D\u4EE3\u8868\u5B98\u65B9\u7ACB\u573A\uFF0C\u4E0D\u4EE3\u8868\u5B98\u65B9\u6D88\u606F\uFF0C\u4EC5\u4E3A\u7EAA\u5FF5\u8BF8\u795E\u7EC8\u5E94\u77E5\u6653\u3002</p><button onclick="document.getElementById(\'_disclaimer_overlay\').remove()" style="background:linear-gradient(135deg,#8b6914,#d4a754);color:#0a0a0f;border:none;padding:12px 42px;border-radius:30px;font-size:15px;font-weight:600;letter-spacing:0.06em;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s;box-shadow:0 4px 20px rgba(212,167,84,0.25);">\u6211\u77E5\u9053\u4E86</button></div></div>';
document.body.appendChild(overlay);

var animStyle = document.createElement('style');
animStyle.textContent = '@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(30px)scale(0.96)}to{opacity:1;transform:translateY(0)scale(1)}}';
document.head.appendChild(animStyle);

// If we got here, the script parsed successfully
console.log('OK');
