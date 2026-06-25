(function () {
  'use strict';

  var favoritesKey = 'zhushen:favorites:v1';
  var recentKey = 'zhushen:recent:v1';
  var favoriteGroupKey = 'zhushen:favorite-group:v1';
  var searchSections = [["全部","全部"],["官方","官方发布"],["角色","角色"],["概念","概念"],["二创","二创"],["笑话","笑话"]];
  var favoriteGroups = ["全部收藏","官方发布","角色","概念","二创","笑话","图片"];
  var globalSearchIndex = [{"section":"页面","title":"首页","desc":"进入首页页面","href":"zy.html","text":"页面 首页 进入首页页面 首页"},{"section":"页面","title":"官方发布","desc":"进入官方发布页面","href":"official.html","text":"页面 官方发布 进入官方发布页面 官方发布"},{"section":"页面","title":"角色","desc":"进入角色页面","href":"gfjs.html","text":"页面 角色 进入角色页面 角色"},{"section":"页面","title":"概念","desc":"进入概念页面","href":"gfgn.html","text":"页面 概念 进入概念页面 概念"},{"section":"页面","title":"二创","desc":"进入二创页面","href":"wjec.html","text":"页面 二创 进入二创页面 二创"},{"section":"页面","title":"笑话","desc":"进入笑话页面","href":"qyxhhj.html","text":"页面 笑话 进入笑话页面 笑话"},{"section":"官方发布","title":"《诸神终应知晓》线下技术测招募开启","desc":"官方开启上海线下技术测试招募，玩家可体验首曝实拍录制里的完整内容，并提供合理范围内最高 2000 元报销额度。","href":"official.html","text":"官方发布 《诸神终应知晓》线下技术测招募开启 官方开启上海线下技术测试招募，玩家可体验首曝实拍录制里的完整内容，并提供合理范围内最高 2000 元报销额度。 2024/02 诸神终应知晓 梦开始的地方 本次测试为线下技术测试，玩家可以体验到首曝实拍录制里的完整内容。\r\n\r\n问卷链接：https://ycbcj9s09d.feishu.cn/share/base/form/shrcna0QuEOrv2f2xRalylRayrc\r\n\r\n试玩活动地点：上海。\r\n\r\n活动举办时间：3月2日（周六）或3月9日（周六），具体以报名实际情况为准。\r\n\r\n本次测试为线下技术测试，玩家可以体验到首曝实拍录制里的完整内容：2个可观赏/游玩的角色、2个可挑战的BOSS、1张大地图。\r\n\r\n同时，官方为所有获得试玩资格的玩家准备了 2000 元报销额度，报销适用于合理范围内的往返交通费用与活动当晚住宿。\r\n\r\n活动资格将于 2月22日 选出，届时罗老师会通过 QQ-2464090881 私信通知活动相关详细信息。 线下技术测地点为上海。 可体验内容包含 2 个可观赏/游玩的角色、2 个可挑战 BOSS 与 1 张大地图。 获得试玩资格的玩家可获得合理范围内最高 2000 元报销额度。 "},{"section":"官方发布","title":"实机首曝 PV","desc":"首曝 PV 以“为神明带回死亡”为核心宣言，公开了汇流地、送葬人和同行者命运的基础氛围。","href":"official.html","text":"官方发布 实机首曝 PV 首曝 PV 以“为神明带回死亡”为核心宣言，公开了汇流地、送葬人和同行者命运的基础氛围。 2024/01/05 诸神终应知晓 PV 去为诸神带回死亡吧，「送葬人」。\r\n\r\n官方正文将故事定位在少女的归乡之路上，关键词是杀戮、成长、救赎与成王。\r\n\r\nPV 同时把汇流地称作尘世的墓地与摇篮，强调它即将向玩家展开。\r\n\r\n帖子里的情绪核心不是单纯展示战斗，而是送葬人和数十位同行者的邂逅、别离与命运。 故事围绕杀戮、成长、救赎与成王展开。 汇流地被描述为尘世的墓地与摇篮。 强调与数十位拥有闪耀灵魂的同行者相遇和别离。 实机首曝 PV PV 帖内配图 PV 帖内封面"},{"section":"官方发布","title":"手机实拍录制 Player Reaction","desc":"官方发布手机端实机试玩影像，注明设备为 RedMi K70，并提示内容仍处开发阶段。","href":"official.html","text":"官方发布 手机实拍录制 Player Reaction 官方发布手机端实机试玩影像，注明设备为 RedMi K70，并提示内容仍处开发阶段。 2024/01/05 诸神终应知晓 实机影像 游戏开发中，不代表最终品质。\r\n\r\n这条动态的核心是手机端实机试玩影像，标题明确标注 Player Reaction。\r\n\r\n官方正文注明试玩设备为 RedMi K70，并把内容限定在开发中版本。\r\n\r\n已通过 TapTap 视频资源接口补齐 720p 应用内播放版本，保留原帖封面与帖内配图。 视频内容为玩家-投资人罗老师的实机试玩反应。 素材重点展示移动端实机运行效果。 官方明确标注最终品质仍以正式版本为准。 手机实拍录制 Player Reaction 实机影像帖内配图 Player Reaction 视频封面"},{"section":"官方发布","title":"官方玩家群现已建立","desc":"官方宣布玩家群建立，公开群号，并配套发布抽奖活动与首曝 PV、实拍录制入口。","href":"official.html","text":"官方发布 官方玩家群现已建立 官方宣布玩家群建立，公开群号，并配套发布抽奖活动与首曝 PV、实拍录制入口。 2024/01/25 诸神终应知晓 社群 官方玩家群现已建立。\r\n\r\n官方在正文中感谢玩家关注，并公开玩家群建立信息。\r\n\r\n帖子把加群截图互动、抽奖活动和官方内容入口放在同一条动态里。\r\n\r\n本卡片保留群号、活动性质和官方配图，不收录评论区参与截图。 官方玩家群号：130340208。 帖子包含加群互动抽奖活动说明。 官方整理了首曝 PV 与实拍录制两个延伸入口。 官方玩家群配图一 官方玩家群配图二"},{"section":"官方发布","title":"线下试玩活动回顾","desc":"官方回顾上海线下试玩活动，集中回应操作、性能、技能反馈、养成和游戏定位等问题。","href":"official.html","text":"官方发布 线下试玩活动回顾 官方回顾上海线下试玩活动，集中回应操作、性能、技能反馈、养成和游戏定位等问题。 2024/03/06 诸神终应知晓 线下试玩 试玩内容为9个月前的临时版本。\r\n\r\n官方说明线下试玩以群内招募方式在上海举行，用来和玩家见面并收集反馈。\r\n\r\n正文的重点是答疑：从移动端误触、角色切换、性能表现到技能理解都有回应。\r\n\r\n制作组强调测试版本较早，许多问题已经在后续规划或优化中。 误触、切换角色、处决灵敏度、掉帧与穿模均被列入后续优化。 制作人说明正式切人方案会包含头像点击与双指划屏两种方式。 官方将定位描述为带动作要素的刷子游戏，并确认女主锁定。 线下试玩图一 线下试玩图二 线下试玩图三 线下试玩图四 线下试玩图五 线下试玩图六 线下试玩图七 线下试玩图八 线下试玩图九 线下试玩图十"},{"section":"官方发布","title":"线下参展 ComiDay27","desc":"官方宣布首次参展成都 ComiDay27，提供实机试玩、周边领取和 BOSS 挑战等活动。","href":"official.html","text":"官方发布 线下参展 ComiDay27 官方宣布首次参展成都 ComiDay27，提供实机试玩、周边领取和 BOSS 挑战等活动。 2024/04/05 诸神终应知晓 线下参展 黑暗幻想 X 3D点划激爽ACT。\r\n\r\n这条动态是参展预告，核心信息是成都 ComiDay27 的时间、地点和展位。\r\n\r\n现场内容包括实机试玩、周边领取、BOSS 挑战和正式测试资格相关活动。\r\n\r\n卡片内置了帖子宣传图，方便在应用里直接查看参展信息。 活动时间为 4.5 至 4.6。 活动地点为成都西博城会展中心 14 号馆。 展位编号为 T17-19，并设置正式测试资格挑战。 ComiDay27 参展图一 ComiDay27 参展图二 ComiDay27 参展图三"},{"section":"官方发布","title":"诸神终应知晓 X 核聚变","desc":"官方宣布参加广州核聚变，现场开放首曝版实机试玩、周边领取与 BOSS 挑战。","href":"official.html","text":"官方发布 诸神终应知晓 X 核聚变 官方宣布参加广州核聚变，现场开放首曝版实机试玩、周边领取与 BOSS 挑战。 2024/05/01 诸神终应知晓 线下参展 现场有游戏实机可试玩。\r\n\r\n官方把这条动态作为广州核聚变参展公告，说明现场会开放游戏实机试玩。\r\n\r\n活动内容延续线下试玩、周边领取、BOSS 挑战和互动赠票。\r\n\r\n帖子内的主视觉图已放入卡片画廊，可直接在应用里查看。 活动时间为 5.18 至 5.19。 活动地点为广州保利世贸博览馆 6 号馆。 展位编号为 A18，并设置互动赠票活动。 核聚变参展图"},{"section":"官方发布","title":"参展回顾","desc":"魔王圆桌回顾上海线下测、成都 ComicDay 与广州核聚变，并继续公开试玩反馈答疑。","href":"official.html","text":"官方发布 参展回顾 魔王圆桌回顾上海线下测、成都 ComicDay 与广州核聚变，并继续公开试玩反馈答疑。 2024/05/27 魔王圆桌 参展回顾 一千多名玩家试玩过游戏。\r\n\r\n这篇回顾把三次线下见面串成一条时间线：上海线下测、成都 ComicDay、广州核聚变。\r\n\r\n正文继续回应动作手感、闪避、普攻判定、QTE 倒计时、画质差异等玩家反馈。\r\n\r\n卡片保留了大量现场图和一张 GIF，作为参展过程的视觉档案。 回顾三次线下见面，并感谢玩家志愿者协助。 闪避、操作队列、普攻判定、QTE 倒计时等问题进入优化讨论。 官方说明 PC 端画质会高于手机端，但不会与移动端割裂。 参展回顾图一 参展回顾图二 参展回顾图三 参展回顾图四 参展回顾图五 参展回顾图六 参展回顾图七 参展回顾图八 参展回顾图九 参展回顾图十 参展回顾图十一 参展回顾图十二 参展回顾图十三 参展回顾静态封面 参展回顾 GIF"},{"section":"官方发布","title":"不要祈祷，不要合上战斗的双手","desc":"魔王圆桌宣布《诸神终应知晓》无限期冻结研发，并发布来自一醉与罗莎的告别文字。","href":"official.html","text":"官方发布 不要祈祷，不要合上战斗的双手 魔王圆桌宣布《诸神终应知晓》无限期冻结研发，并发布来自一醉与罗莎的告别文字。 2024/08/02 魔王圆桌 研发冻结 我只愿诸位——勇气常在。\r\n\r\n官方在 2024 年 8 月 2 日宣布项目无限期冻结研发。\r\n\r\n帖子由制作组公告、一醉的长文和罗莎的告别文字构成，语气明显偏向阶段性告别。\r\n\r\n卡片保留了帖内 GIF 与静态封面，用作研发冻结公告的视觉档案。 官方说明在与各方沟通后决定无限期冻结研发。 一醉以长文向玩家和行业朋友告别。 罗莎表示短暂告别是为了更好的再见做准备。 研发冻结公告 GIF 研发冻结公告封面"},{"section":"官方发布","title":"To 罗老师最可爱的玩家","desc":"罗老师以告别信的形式向玩家、管理、志愿者和群友致谢，说明项目暂别，并表达未来重启《诸神终应知晓》的愿望。","href":"official.html","text":"官方发布 To 罗老师最可爱的玩家 罗老师以告别信的形式向玩家、管理、志愿者和群友致谢，说明项目暂别，并表达未来重启《诸神终应知晓》的愿望。 2024/08/02 罗老师 暂时的终章 这是个黯淡的世界，但终有人，会成为太阳。\r\n\r\nTo 罗老师最可爱的玩家，\r\n\r\n这大概是我第一次以这种方式来和他人告别。\r\n\r\n大概你们发现了，我有段时间没出现在群里了，一直在做斗争，与融资做斗争，与天命在做斗争，与内心的不甘在做斗争。\r\n\r\n不好意思，渺小如我们，仍然没有打赢这场复活赛，没有办法让你们看到我们所坚信的“奇迹”。\r\n\r\n说出来你们可能不信，以前作为投资人的我其实是很害怕和玩家沟通的，最开始说话都很小心翼翼。\r\n\r\n是你们，让我意识到玩家是这么得可爱，这么得真诚，这么得值得我们努力活下去。\r\n\r\n线下见过的每一位玩家的脸我都记得，线上和我打过招呼的每一位群友我也记得。\r\n\r\n我很害怕失去你们，纵然万般不舍，却又不得不亲自写下这封告别信。\r\n\r\n感谢每一位管理、志愿者、群友、玩家，对我、对诸神终应知晓、对魔王圆桌的支持。\r\n\r\n但我想，强大如我们，不会停下前行的脚步，我们会一直坚持做游戏。\r\n\r\n终有一天，我们会攒足力量，重启《诸神终应知晓》，这场短暂的告别是为了更好的再见做准备。\r\n\r\n这是个黯淡的世界，但终有人，会成为太阳。\r\n\r\n群不会解散，会从官群转为民间朋友群；我也不会走，会时不时出现看看你们。\r\n\r\n祝，各位一切都好。 这是一封面向玩家、管理、志愿者与群友的告别信。 信中说明项目暂别的原因与不舍，并感谢玩家对项目和魔王圆桌的支持。 罗老师表达了未来攒足力量、重启《诸神终应知晓》的愿望。 "},{"section":"角色","title":"阿塔尔","desc":"被国家和盟友背叛的少女骑士。死前与「第十三席的恶魔」定约，堕入名为「汇流地」的异界，成为猎人，代号「送葬人」，开始履行契约——狩猎神明。","href":"gfjs.html","text":"角色 阿塔尔 被国家和盟友背叛的少女骑士。死前与「第十三席的恶魔」定约，堕入名为「汇流地」的异界，成为猎人，代号「送葬人」，开始履行契约——狩猎神明。 少女骑士 · 送葬人 官方 猎人 送葬人 去为诸神带回死亡吧，「送葬人」。 官方-角色/阿塔尔/阿塔尔1 .jpeg 官方-角色/阿塔尔/阿塔尔2.png 官方-角色/阿塔尔/阿塔尔3.png 官方-角色/阿塔尔/阿塔尔4.jpeg 官方-角色/阿塔尔/阿塔尔5.jpeg 阿塔尔展示 阿塔尔回眸 技能特效"},{"section":"角色","title":"德赫奴","desc":"已知身份为神明，设定为无性别。曾在 PV 中对阿塔尔说道：“你的灵魂非常明亮，真是令人怀念呢。”","href":"gfjs.html","text":"角色 德赫奴 已知身份为神明，设定为无性别。曾在 PV 中对阿塔尔说道：“你的灵魂非常明亮，真是令人怀念呢。” 神明 · 无性别 官方 神明 待考证 你的灵魂非常明亮，真是令人怀念呢。 官方-角色/德赫奴/德赫奴1.jpeg 官方-角色/德赫奴/德赫奴2.jpeg 官方-角色/德赫奴/德赫奴3.png 德赫奴展示 技能演示"},{"section":"角色","title":"拉夏·贝乌斯","desc":"汇流地的管理者之一，与阿塔尔定下契约的「第十三席恶魔」。以自身手段深入调查汇流地的异变。","href":"gfjs.html","text":"角色 拉夏·贝乌斯 汇流地的管理者之一，与阿塔尔定下契约的「第十三席恶魔」。以自身手段深入调查汇流地的异变。 第十三席恶魔 官方 恶魔 契约 汇流地的管理者之一。 官方-角色/拉夏·贝乌斯/拉夏1.jpeg 官方-角色/拉夏·贝乌斯/拉夏2.png 官方-角色/拉夏·贝乌斯/拉夏3.jpeg 官方-角色/拉夏·贝乌斯/拉夏4.jpeg 官方-角色/拉夏·贝乌斯/拉夏5.jpeg "},{"section":"角色","title":"梅赛德斯","desc":"在汇流地中出现的另一位神秘角色，其背景和目的尚待揭晓。","href":"gfjs.html","text":"角色 梅赛德斯 在汇流地中出现的另一位神秘角色，其背景和目的尚待揭晓。 神秘旅者 官方 待补充 背景仍待补充。 官方-角色/梅赛德斯/梅赛德斯1.jpeg 官方-角色/梅赛德斯/梅赛德斯2.png "},{"section":"角色","title":"夕岚","desc":"汇流地中的猎人之一。受生命法则影响，在踏入汇流地深层后逐渐产生扭曲与异化。拥有丰富的人气二创作品。","href":"gfjs.html","text":"角色 夕岚 汇流地中的猎人之一。受生命法则影响，在踏入汇流地深层后逐渐产生扭曲与异化。拥有丰富的人气二创作品。 暮色之岚 官方 猎人 异化 汇流地中的猎人之一。 官方-角色/夕岚/夕岚1.jpeg 官方-角色/夕岚/夕岚2.jpeg 官方-角色/夕岚/夕岚3.jpeg 官方-角色/夕岚/夕岚4.jpeg 官方-角色/夕岚/夕岚5.png 官方-角色/夕岚/夕岚6.png 官方-角色/夕岚/夕岚7.jpeg 官方-角色/夕岚/夕岚8.jpeg 官方-角色/夕岚/夕岚9.gif "},{"section":"概念","title":"登场角色：德赫奴","desc":"官方宣传物料","href":"gfgn.html","text":"概念 登场角色：德赫奴 官方宣传物料 官方-概念/登场角色：德赫奴.png 官方宣传物料"},{"section":"概念","title":"登场角色：拉夏·贝乌斯","desc":"官方宣传物料","href":"gfgn.html","text":"概念 登场角色：拉夏·贝乌斯 官方宣传物料 官方-概念/登场角色：拉夏·贝乌斯.png 官方宣传物料"},{"section":"概念","title":"游戏登入界面","desc":"官方宣传物料","href":"gfgn.html","text":"概念 游戏登入界面 官方宣传物料 官方-概念/登入界面.jpeg 官方宣传物料"},{"section":"概念","title":"制作人补充设想","desc":"官方资料","href":"gfgn.html","text":"概念 制作人补充设想 官方资料 官方-概念/一醉关于游戏定位的补充和设想~.jpeg 官方资料"},{"section":"概念","title":"白国主与拉夏的角色定位","desc":"角色定位","href":"gfgn.html","text":"概念 白国主与拉夏的角色定位 角色定位 官方-概念/白国主&拉夏的角色定位.png 角色定位"},{"section":"概念","title":"原官方世界观概念图 1","desc":"世界观","href":"gfgn.html","text":"概念 原官方世界观概念图 1 世界观 官方-概念/官方概念（原官方世界观）/1_官方概念（原官方世界观）.jpeg 世界观"},{"section":"概念","title":"原官方世界观概念图 2","desc":"世界观","href":"gfgn.html","text":"概念 原官方世界观概念图 2 世界观 官方-概念/官方概念（原官方世界观）/2_官方概念（原官方世界观）.jpeg 世界观"},{"section":"概念","title":"原官方世界观概念图 3","desc":"世界观","href":"gfgn.html","text":"概念 原官方世界观概念图 3 世界观 官方-概念/官方概念（原官方世界观）/3_官方概念（原官方世界观）.jpeg 世界观"},{"section":"概念","title":"原官方世界观概念图 4","desc":"世界观","href":"gfgn.html","text":"概念 原官方世界观概念图 4 世界观 官方-概念/官方概念（原官方世界观）/4_官方概念（原官方世界观）.png 世界观"},{"section":"概念","title":"原官方世界观概念图 5","desc":"世界观","href":"gfgn.html","text":"概念 原官方世界观概念图 5 世界观 官方-概念/官方概念（原官方世界观）/5_官方概念（原官方世界观）.jpeg 世界观"},{"section":"概念","title":"原官方世界观概念图 6","desc":"世界观","href":"gfgn.html","text":"概念 原官方世界观概念图 6 世界观 官方-概念/官方概念（原官方世界观）/6_官方概念（原官方世界观）.png 世界观"},{"section":"概念","title":"原官方世界观概念图 7","desc":"世界观","href":"gfgn.html","text":"概念 原官方世界观概念图 7 世界观 官方-概念/官方概念（原官方世界观）/7_官方概念（原官方世界观）.jpeg 世界观"},{"section":"概念","title":"原官方世界观概念图 8","desc":"世界观","href":"gfgn.html","text":"概念 原官方世界观概念图 8 世界观 官方-概念/官方概念（原官方世界观）/8_官方概念（原官方世界观）.png 世界观"},{"section":"概念","title":"原官方世界观概念图 9","desc":"世界观","href":"gfgn.html","text":"概念 原官方世界观概念图 9 世界观 官方-概念/官方概念（原官方世界观）/9_官方概念（原官方世界观）.png 世界观"},{"section":"概念","title":"原官方世界观概念图 10","desc":"世界观","href":"gfgn.html","text":"概念 原官方世界观概念图 10 世界观 官方-概念/官方概念（原官方世界观）/10_官方概念（原官方世界观）.png 世界观"},{"section":"概念","title":"原官方世界观概念图 11","desc":"世界观","href":"gfgn.html","text":"概念 原官方世界观概念图 11 世界观 官方-概念/官方概念（原官方世界观）/11_官方概念（原官方世界观）.png 世界观"},{"section":"概念","title":"原官方世界观概念图 12","desc":"世界观","href":"gfgn.html","text":"概念 原官方世界观概念图 12 世界观 官方-概念/官方概念（原官方世界观）/12_官方概念（原官方世界观）.png 世界观"},{"section":"概念","title":"原官方世界观概念图 13","desc":"世界观","href":"gfgn.html","text":"概念 原官方世界观概念图 13 世界观 官方-概念/官方概念（原官方世界观）/13_官方概念（原官方世界观）.png 世界观"},{"section":"概念","title":"原官方世界观概念图 14","desc":"世界观","href":"gfgn.html","text":"概念 原官方世界观概念图 14 世界观 官方-概念/官方概念（原官方世界观）/14_官方概念（原官方世界观）.png 世界观"},{"section":"概念","title":"原官方世界观概念图 15","desc":"世界观","href":"gfgn.html","text":"概念 原官方世界观概念图 15 世界观 官方-概念/官方概念（原官方世界观）/15_官方概念（原官方世界观）.png 世界观"},{"section":"二创","title":"阿钰钰钰拉夏1","desc":"阿钰钰钰 · 拉夏 · 动图","href":"wjec.html","text":"二创 阿钰钰钰拉夏1 阿钰钰钰 · 拉夏 · 动图 阿钰钰钰 拉夏 动图 玩家-二创图/阿钰钰钰/阿钰钰钰拉夏1.gif"},{"section":"二创","title":"阿钰钰钰拉夏2","desc":"阿钰钰钰 · 拉夏 · 动图","href":"wjec.html","text":"二创 阿钰钰钰拉夏2 阿钰钰钰 · 拉夏 · 动图 阿钰钰钰 拉夏 动图 玩家-二创图/阿钰钰钰/阿钰钰钰拉夏2.gif"},{"section":"二创","title":"阿钰钰钰夕岚1","desc":"阿钰钰钰 · 夕岚 · 图片","href":"wjec.html","text":"二创 阿钰钰钰夕岚1 阿钰钰钰 · 夕岚 · 图片 阿钰钰钰 夕岚 图片 玩家-二创图/阿钰钰钰/阿钰钰钰夕岚1.png"},{"section":"二创","title":"初月wy夕岚1","desc":"初月wy · 夕岚 · 图片","href":"wjec.html","text":"二创 初月wy夕岚1 初月wy · 夕岚 · 图片 初月wy 夕岚 图片 玩家-二创图/初月wy/初月wy夕岚1.png"},{"section":"二创","title":"初月wy夕岚2","desc":"初月wy · 夕岚 · 图片","href":"wjec.html","text":"二创 初月wy夕岚2 初月wy · 夕岚 · 图片 初月wy 夕岚 图片 玩家-二创图/初月wy/初月wy夕岚2.png"},{"section":"二创","title":"电子水泥沥灰夕岚1","desc":"电子水泥沥灰 · 夕岚 · 图片","href":"wjec.html","text":"二创 电子水泥沥灰夕岚1 电子水泥沥灰 · 夕岚 · 图片 电子水泥沥灰 夕岚 图片 玩家-二创图/电子水泥沥灰/电子水泥沥灰夕岚1.jpeg"},{"section":"二创","title":"范斯梅耶拉夏1","desc":"范斯梅耶 · 拉夏 · 图片","href":"wjec.html","text":"二创 范斯梅耶拉夏1 范斯梅耶 · 拉夏 · 图片 范斯梅耶 拉夏 图片 玩家-二创图/范斯梅耶/范斯梅耶拉夏1.jpeg"},{"section":"二创","title":"范斯梅耶拉夏2","desc":"范斯梅耶 · 拉夏 · 图片","href":"wjec.html","text":"二创 范斯梅耶拉夏2 范斯梅耶 · 拉夏 · 图片 范斯梅耶 拉夏 图片 玩家-二创图/范斯梅耶/范斯梅耶拉夏2.jpeg"},{"section":"二创","title":"范斯梅耶拉夏3","desc":"范斯梅耶 · 拉夏 · 图片","href":"wjec.html","text":"二创 范斯梅耶拉夏3 范斯梅耶 · 拉夏 · 图片 范斯梅耶 拉夏 图片 玩家-二创图/范斯梅耶/范斯梅耶拉夏3.png"},{"section":"二创","title":"范斯梅耶拉夏4","desc":"范斯梅耶 · 拉夏 · 图片","href":"wjec.html","text":"二创 范斯梅耶拉夏4 范斯梅耶 · 拉夏 · 图片 范斯梅耶 拉夏 图片 玩家-二创图/范斯梅耶/范斯梅耶拉夏4.jpeg"},{"section":"二创","title":"范斯梅耶拉夏5","desc":"范斯梅耶 · 拉夏 · 图片","href":"wjec.html","text":"二创 范斯梅耶拉夏5 范斯梅耶 · 拉夏 · 图片 范斯梅耶 拉夏 图片 玩家-二创图/范斯梅耶/范斯梅耶拉夏5.jpeg"},{"section":"二创","title":"范斯梅耶拉夏6","desc":"范斯梅耶 · 拉夏 · 图片","href":"wjec.html","text":"二创 范斯梅耶拉夏6 范斯梅耶 · 拉夏 · 图片 范斯梅耶 拉夏 图片 玩家-二创图/范斯梅耶/范斯梅耶拉夏6.jpeg"},{"section":"二创","title":"范斯梅耶拉夏7","desc":"范斯梅耶 · 拉夏 · 图片","href":"wjec.html","text":"二创 范斯梅耶拉夏7 范斯梅耶 · 拉夏 · 图片 范斯梅耶 拉夏 图片 玩家-二创图/范斯梅耶/范斯梅耶拉夏7.jpeg"},{"section":"二创","title":"共创（已获取画师同意）1","desc":"共创（已获取画师同意） · 综合 · 图片","href":"wjec.html","text":"二创 共创（已获取画师同意）1 共创（已获取画师同意） · 综合 · 图片 共创（已获取画师同意） 综合 图片 玩家-二创图/共创（已获取画师同意）/共创（已获取画师同意）1.jpeg"},{"section":"二创","title":"共创（已获取画师同意）2","desc":"共创（已获取画师同意） · 综合 · 图片","href":"wjec.html","text":"二创 共创（已获取画师同意）2 共创（已获取画师同意） · 综合 · 图片 共创（已获取画师同意） 综合 图片 玩家-二创图/共创（已获取画师同意）/共创（已获取画师同意）2.jpeg"},{"section":"二创","title":"共创（已获取画师同意）3","desc":"共创（已获取画师同意） · 综合 · 图片","href":"wjec.html","text":"二创 共创（已获取画师同意）3 共创（已获取画师同意） · 综合 · 图片 共创（已获取画师同意） 综合 图片 玩家-二创图/共创（已获取画师同意）/共创（已获取画师同意）3.jpeg"},{"section":"二创","title":"共创（已获取画师同意）4","desc":"共创（已获取画师同意） · 综合 · 图片","href":"wjec.html","text":"二创 共创（已获取画师同意）4 共创（已获取画师同意） · 综合 · 图片 共创（已获取画师同意） 综合 图片 玩家-二创图/共创（已获取画师同意）/共创（已获取画师同意）4.jpeg"},{"section":"二创","title":"共创（已获取画师同意）5","desc":"共创（已获取画师同意） · 综合 · 图片","href":"wjec.html","text":"二创 共创（已获取画师同意）5 共创（已获取画师同意） · 综合 · 图片 共创（已获取画师同意） 综合 图片 玩家-二创图/共创（已获取画师同意）/共创（已获取画师同意）5.jpeg"},{"section":"二创","title":"共创（已获取画师同意）6","desc":"共创（已获取画师同意） · 综合 · 图片","href":"wjec.html","text":"二创 共创（已获取画师同意）6 共创（已获取画师同意） · 综合 · 图片 共创（已获取画师同意） 综合 图片 玩家-二创图/共创（已获取画师同意）/共创（已获取画师同意）6.jpeg"},{"section":"二创","title":"共创（已获取画师同意）7","desc":"共创（已获取画师同意） · 综合 · 图片","href":"wjec.html","text":"二创 共创（已获取画师同意）7 共创（已获取画师同意） · 综合 · 图片 共创（已获取画师同意） 综合 图片 玩家-二创图/共创（已获取画师同意）/共创（已获取画师同意）7.jpeg"},{"section":"二创","title":"共创（已获取画师同意）8","desc":"共创（已获取画师同意） · 综合 · 图片","href":"wjec.html","text":"二创 共创（已获取画师同意）8 共创（已获取画师同意） · 综合 · 图片 共创（已获取画师同意） 综合 图片 玩家-二创图/共创（已获取画师同意）/共创（已获取画师同意）8.jpeg"},{"section":"二创","title":"共创（已获取画师同意）9","desc":"共创（已获取画师同意） · 综合 · 图片","href":"wjec.html","text":"二创 共创（已获取画师同意）9 共创（已获取画师同意） · 综合 · 图片 共创（已获取画师同意） 综合 图片 玩家-二创图/共创（已获取画师同意）/共创（已获取画师同意）9.jpeg"},{"section":"二创","title":"共创（已获取画师同意）11","desc":"共创（已获取画师同意） · 综合 · 图片","href":"wjec.html","text":"二创 共创（已获取画师同意）11 共创（已获取画师同意） · 综合 · 图片 共创（已获取画师同意） 综合 图片 玩家-二创图/共创（已获取画师同意）/共创（已获取画师同意）11.jpeg"},{"section":"二创","title":"共创（已获取画师同意）12","desc":"共创（已获取画师同意） · 综合 · 图片","href":"wjec.html","text":"二创 共创（已获取画师同意）12 共创（已获取画师同意） · 综合 · 图片 共创（已获取画师同意） 综合 图片 玩家-二创图/共创（已获取画师同意）/共创（已获取画师同意）12.jpeg"},{"section":"二创","title":"共创（已获取画师同意）13","desc":"共创（已获取画师同意） · 综合 · 图片","href":"wjec.html","text":"二创 共创（已获取画师同意）13 共创（已获取画师同意） · 综合 · 图片 共创（已获取画师同意） 综合 图片 玩家-二创图/共创（已获取画师同意）/共创（已获取画师同意）13.jpeg"},{"section":"二创","title":"精神病系教主拉夏1","desc":"精神病系教主 · 拉夏 · 图片","href":"wjec.html","text":"二创 精神病系教主拉夏1 精神病系教主 · 拉夏 · 图片 精神病系教主 拉夏 图片 玩家-二创图/精神病系教主/精神病系教主拉夏1.jpeg"},{"section":"二创","title":"精神病系教主拉夏2","desc":"精神病系教主 · 拉夏 · 图片","href":"wjec.html","text":"二创 精神病系教主拉夏2 精神病系教主 · 拉夏 · 图片 精神病系教主 拉夏 图片 玩家-二创图/精神病系教主/精神病系教主拉夏2.jpeg"},{"section":"二创","title":"精神病系教主拉夏3","desc":"精神病系教主 · 拉夏 · 图片","href":"wjec.html","text":"二创 精神病系教主拉夏3 精神病系教主 · 拉夏 · 图片 精神病系教主 拉夏 图片 玩家-二创图/精神病系教主/精神病系教主拉夏3.jpeg"},{"section":"二创","title":"莲生夕岚1","desc":"莲生 · 夕岚 · 图片","href":"wjec.html","text":"二创 莲生夕岚1 莲生 · 夕岚 · 图片 莲生 夕岚 图片 玩家-二创图/莲生/莲生夕岚1.png"},{"section":"二创","title":"莲生夕岚2","desc":"莲生 · 夕岚 · 图片","href":"wjec.html","text":"二创 莲生夕岚2 莲生 · 夕岚 · 图片 莲生 夕岚 图片 玩家-二创图/莲生/莲生夕岚2.png"},{"section":"二创","title":"皮皮阿塔尔1","desc":"皮皮 · 阿塔尔 · 图片","href":"wjec.html","text":"二创 皮皮阿塔尔1 皮皮 · 阿塔尔 · 图片 皮皮 阿塔尔 图片 玩家-二创图/皮皮/皮皮阿塔尔1.png"},{"section":"二创","title":"皮皮德赫奴1","desc":"皮皮 · 德赫奴 · 图片","href":"wjec.html","text":"二创 皮皮德赫奴1 皮皮 · 德赫奴 · 图片 皮皮 德赫奴 图片 玩家-二创图/皮皮/皮皮德赫奴1.jpeg"},{"section":"二创","title":"皮皮夕岚1","desc":"皮皮 · 夕岚 · 图片","href":"wjec.html","text":"二创 皮皮夕岚1 皮皮 · 夕岚 · 图片 皮皮 夕岚 图片 玩家-二创图/皮皮/皮皮夕岚1.jpeg"},{"section":"二创","title":"皮皮夕岚2","desc":"皮皮 · 夕岚 · 图片","href":"wjec.html","text":"二创 皮皮夕岚2 皮皮 · 夕岚 · 图片 皮皮 夕岚 图片 玩家-二创图/皮皮/皮皮夕岚2.jpeg"},{"section":"二创","title":"皮皮夕岚3","desc":"皮皮 · 夕岚 · 图片","href":"wjec.html","text":"二创 皮皮夕岚3 皮皮 · 夕岚 · 图片 皮皮 夕岚 图片 玩家-二创图/皮皮/皮皮夕岚3.jpeg"},{"section":"二创","title":"皮皮夕岚4","desc":"皮皮 · 夕岚 · 图片","href":"wjec.html","text":"二创 皮皮夕岚4 皮皮 · 夕岚 · 图片 皮皮 夕岚 图片 玩家-二创图/皮皮/皮皮夕岚4.jpeg"},{"section":"二创","title":"巧枝椅水墨1","desc":"巧枝椅 · 综合 · 图片","href":"wjec.html","text":"二创 巧枝椅水墨1 巧枝椅 · 综合 · 图片 巧枝椅 综合 图片 玩家-二创图/巧枝椅/巧枝椅水墨1.jpeg"},{"section":"二创","title":"巧枝椅水墨2","desc":"巧枝椅 · 综合 · 图片","href":"wjec.html","text":"二创 巧枝椅水墨2 巧枝椅 · 综合 · 图片 巧枝椅 综合 图片 玩家-二创图/巧枝椅/巧枝椅水墨2.jpeg"},{"section":"二创","title":"巧枝椅水墨3","desc":"巧枝椅 · 综合 · 图片","href":"wjec.html","text":"二创 巧枝椅水墨3 巧枝椅 · 综合 · 图片 巧枝椅 综合 图片 玩家-二创图/巧枝椅/巧枝椅水墨3.jpeg"},{"section":"二创","title":"巧枝椅水墨4","desc":"巧枝椅 · 综合 · 图片","href":"wjec.html","text":"二创 巧枝椅水墨4 巧枝椅 · 综合 · 图片 巧枝椅 综合 图片 玩家-二创图/巧枝椅/巧枝椅水墨4.jpeg"},{"section":"二创","title":"巧枝椅水墨5","desc":"巧枝椅 · 综合 · 图片","href":"wjec.html","text":"二创 巧枝椅水墨5 巧枝椅 · 综合 · 图片 巧枝椅 综合 图片 玩家-二创图/巧枝椅/巧枝椅水墨5.jpeg"},{"section":"二创","title":"巧枝椅水墨6","desc":"巧枝椅 · 综合 · 图片","href":"wjec.html","text":"二创 巧枝椅水墨6 巧枝椅 · 综合 · 图片 巧枝椅 综合 图片 玩家-二创图/巧枝椅/巧枝椅水墨6.jpeg"},{"section":"二创","title":"巧枝椅夕岚1","desc":"巧枝椅 · 夕岚 · 图片","href":"wjec.html","text":"二创 巧枝椅夕岚1 巧枝椅 · 夕岚 · 图片 巧枝椅 夕岚 图片 玩家-二创图/巧枝椅/巧枝椅夕岚1.jpeg"},{"section":"二创","title":"巧枝椅夕岚2","desc":"巧枝椅 · 夕岚 · 图片","href":"wjec.html","text":"二创 巧枝椅夕岚2 巧枝椅 · 夕岚 · 图片 巧枝椅 夕岚 图片 玩家-二创图/巧枝椅/巧枝椅夕岚2.jpeg"},{"section":"二创","title":"夕岚老公夕岚1","desc":"夕岚老公 · 夕岚 · 图片","href":"wjec.html","text":"二创 夕岚老公夕岚1 夕岚老公 · 夕岚 · 图片 夕岚老公 夕岚 图片 玩家-二创图/夕岚老公/夕岚老公夕岚1.jpeg"},{"section":"二创","title":"夕岚老公夕岚2","desc":"夕岚老公 · 夕岚 · 图片","href":"wjec.html","text":"二创 夕岚老公夕岚2 夕岚老公 · 夕岚 · 图片 夕岚老公 夕岚 图片 玩家-二创图/夕岚老公/夕岚老公夕岚2.png"},{"section":"二创","title":"心理素质叼差阿塔尔1","desc":"心理素质叼差 · 阿塔尔 · 图片","href":"wjec.html","text":"二创 心理素质叼差阿塔尔1 心理素质叼差 · 阿塔尔 · 图片 心理素质叼差 阿塔尔 图片 玩家-二创图/心理素质叼差/心理素质叼差阿塔尔1.jpeg"},{"section":"二创","title":"心理素质叼差拉夏1","desc":"心理素质叼差 · 拉夏 · 图片","href":"wjec.html","text":"二创 心理素质叼差拉夏1 心理素质叼差 · 拉夏 · 图片 心理素质叼差 拉夏 图片 玩家-二创图/心理素质叼差/心理素质叼差拉夏1.jpeg"},{"section":"二创","title":"心理素质叼差拉夏2","desc":"心理素质叼差 · 拉夏 · 图片","href":"wjec.html","text":"二创 心理素质叼差拉夏2 心理素质叼差 · 拉夏 · 图片 心理素质叼差 拉夏 图片 玩家-二创图/心理素质叼差/心理素质叼差拉夏2.jpeg"},{"section":"二创","title":"心理素质叼差拉夏3","desc":"心理素质叼差 · 拉夏 · 图片","href":"wjec.html","text":"二创 心理素质叼差拉夏3 心理素质叼差 · 拉夏 · 图片 心理素质叼差 拉夏 图片 玩家-二创图/心理素质叼差/心理素质叼差拉夏3.jpeg"},{"section":"二创","title":"心理素质叼差拉夏4","desc":"心理素质叼差 · 拉夏 · 图片","href":"wjec.html","text":"二创 心理素质叼差拉夏4 心理素质叼差 · 拉夏 · 图片 心理素质叼差 拉夏 图片 玩家-二创图/心理素质叼差/心理素质叼差拉夏4.jpeg"},{"section":"二创","title":"心理素质叼差梅赛德斯1","desc":"心理素质叼差 · 梅赛德斯 · 图片","href":"wjec.html","text":"二创 心理素质叼差梅赛德斯1 心理素质叼差 · 梅赛德斯 · 图片 心理素质叼差 梅赛德斯 图片 玩家-二创图/心理素质叼差/心理素质叼差梅赛德斯1.jpeg"},{"section":"二创","title":"心理素质叼差夕岚1","desc":"心理素质叼差 · 夕岚 · 图片","href":"wjec.html","text":"二创 心理素质叼差夕岚1 心理素质叼差 · 夕岚 · 图片 心理素质叼差 夕岚 图片 玩家-二创图/心理素质叼差/心理素质叼差夕岚1.jpeg"},{"section":"二创","title":"心理素质叼差夕岚2","desc":"心理素质叼差 · 夕岚 · 图片","href":"wjec.html","text":"二创 心理素质叼差夕岚2 心理素质叼差 · 夕岚 · 图片 心理素质叼差 夕岚 图片 玩家-二创图/心理素质叼差/心理素质叼差夕岚2.jpeg"},{"section":"二创","title":"鸭鸭夕岚1","desc":"鸭鸭 · 夕岚 · 图片","href":"wjec.html","text":"二创 鸭鸭夕岚1 鸭鸭 · 夕岚 · 图片 鸭鸭 夕岚 图片 玩家-二创图/鸭鸭（待补充整理）/鸭鸭夕岚1.jpeg"},{"section":"二创","title":"鸭鸭夕岚2","desc":"鸭鸭 · 夕岚 · 图片","href":"wjec.html","text":"二创 鸭鸭夕岚2 鸭鸭 · 夕岚 · 图片 鸭鸭 夕岚 图片 玩家-二创图/鸭鸭（待补充整理）/鸭鸭夕岚2.jpeg"},{"section":"二创","title":"鸭鸭夕岚3","desc":"鸭鸭 · 夕岚 · 图片","href":"wjec.html","text":"二创 鸭鸭夕岚3 鸭鸭 · 夕岚 · 图片 鸭鸭 夕岚 图片 玩家-二创图/鸭鸭（待补充整理）/鸭鸭夕岚3.jpeg"},{"section":"二创","title":"鸭鸭夕岚4","desc":"鸭鸭 · 夕岚 · 图片","href":"wjec.html","text":"二创 鸭鸭夕岚4 鸭鸭 · 夕岚 · 图片 鸭鸭 夕岚 图片 玩家-二创图/鸭鸭（待补充整理）/鸭鸭夕岚4.jpeg"},{"section":"二创","title":"鸭鸭夕岚6","desc":"鸭鸭 · 夕岚 · 图片","href":"wjec.html","text":"二创 鸭鸭夕岚6 鸭鸭 · 夕岚 · 图片 鸭鸭 夕岚 图片 玩家-二创图/鸭鸭（待补充整理）/鸭鸭夕岚6.jpeg"},{"section":"二创","title":"鸭鸭夕岚7","desc":"鸭鸭 · 夕岚 · 图片","href":"wjec.html","text":"二创 鸭鸭夕岚7 鸭鸭 · 夕岚 · 图片 鸭鸭 夕岚 图片 玩家-二创图/鸭鸭（待补充整理）/鸭鸭夕岚7.jpeg"},{"section":"二创","title":"鸭鸭夕岚8","desc":"鸭鸭 · 夕岚 · 图片","href":"wjec.html","text":"二创 鸭鸭夕岚8 鸭鸭 · 夕岚 · 图片 鸭鸭 夕岚 图片 玩家-二创图/鸭鸭（待补充整理）/鸭鸭夕岚8.png"},{"section":"二创","title":"鸭鸭夕岚9","desc":"鸭鸭 · 夕岚 · 图片","href":"wjec.html","text":"二创 鸭鸭夕岚9 鸭鸭 · 夕岚 · 图片 鸭鸭 夕岚 图片 玩家-二创图/鸭鸭（待补充整理）/鸭鸭夕岚9.png"},{"section":"二创","title":"鸭鸭夕岚10","desc":"鸭鸭 · 夕岚 · 图片","href":"wjec.html","text":"二创 鸭鸭夕岚10 鸭鸭 · 夕岚 · 图片 鸭鸭 夕岚 图片 玩家-二创图/鸭鸭（待补充整理）/鸭鸭夕岚10.png"},{"section":"二创","title":"鸭鸭夕岚11","desc":"鸭鸭 · 夕岚 · 图片","href":"wjec.html","text":"二创 鸭鸭夕岚11 鸭鸭 · 夕岚 · 图片 鸭鸭 夕岚 图片 玩家-二创图/鸭鸭（待补充整理）/鸭鸭夕岚11.png"},{"section":"二创","title":"hsj拉夏1","desc":"hsj · 拉夏 · 图片","href":"wjec.html","text":"二创 hsj拉夏1 hsj · 拉夏 · 图片 hsj 拉夏 图片 玩家-二创图/hsj/hsj拉夏1.jpeg"},{"section":"二创","title":"jk凯威阿塔尔1","desc":"jk凯威 · 阿塔尔 · 图片","href":"wjec.html","text":"二创 jk凯威阿塔尔1 jk凯威 · 阿塔尔 · 图片 jk凯威 阿塔尔 图片 玩家-二创图/jk凯威/jk凯威阿塔尔1.jpeg"},{"section":"二创","title":"jk凯威拉夏1","desc":"jk凯威 · 拉夏 · 图片","href":"wjec.html","text":"二创 jk凯威拉夏1 jk凯威 · 拉夏 · 图片 jk凯威 拉夏 图片 玩家-二创图/jk凯威/jk凯威拉夏1.png"},{"section":"二创","title":"夕岚玩家二创一","desc":"从角色官方页移入二创归档，避免与官方设定混放。","href":"wjec.html","text":"二创 夕岚玩家二创一 从角色官方页移入二创归档，避免与官方设定混放。 夕岚 官方-角色/视频/夕岚玩家二创1.mp4 视频 玩家二创"},{"section":"二创","title":"夕岚玩家二创二","desc":"从角色官方页移入二创归档，保留应用内播放入口。","href":"wjec.html","text":"二创 夕岚玩家二创二 从角色官方页移入二创归档，保留应用内播放入口。 夕岚 官方-角色/视频/夕岚玩家二创2.mp4 视频 玩家二创"},{"section":"二创","title":"夕岚我的世界","desc":"玩家自制内容，作为二创视频单独收录。","href":"wjec.html","text":"二创 夕岚我的世界 玩家自制内容，作为二创视频单独收录。 夕岚 官方-角色/视频/夕岚我的世界.mp4 视频 玩家二创"},{"section":"笑话","title":"罗老师的画饼","desc":"罗老师24年年初在游戏官群画的饼","href":"qyxhhj.html","text":"笑话 罗老师的画饼 罗老师24年年初在游戏官群画的饼 社区切片 1 群友笑话合集/1_群友笑话合集.png"},{"section":"笑话","title":"版号戏谈","desc":"可惜，本来一测那会儿就要申请版号的","href":"qyxhhj.html","text":"笑话 版号戏谈 可惜，本来一测那会儿就要申请版号的 社区切片 2 群友笑话合集/2_群友笑话合集.png"},{"section":"笑话","title":"群友“虾”的嚣张","desc":"虾自从线下测试见过罗老师后就放开了自己","href":"qyxhhj.html","text":"笑话 群友“虾”的嚣张 虾自从线下测试见过罗老师后就放开了自己 社区切片 3 群友笑话合集/3_群友笑话合集.jpeg"},{"section":"笑话","title":"虾是罗老师的狗","desc":"一段很有社区记忆点的群聊片段","href":"qyxhhj.html","text":"笑话 虾是罗老师的狗 一段很有社区记忆点的群聊片段 社区切片 4 群友笑话合集/4_群友笑话合集.jpeg"},{"section":"笑话","title":"罗老师疯狂星期四V50","desc":"真的给安装包吗","href":"qyxhhj.html","text":"笑话 罗老师疯狂星期四V50 真的给安装包吗 社区切片 5 群友笑话合集/5_群友笑话合集.jpeg"},{"section":"笑话","title":"虾你在干什么","desc":"不是哥们","href":"qyxhhj.html","text":"笑话 虾你在干什么 不是哥们 社区切片 6 群友笑话合集/6_群友笑话合集.jpeg"},{"section":"笑话","title":"两个屑屑的家伙","desc":"屑屑的罗老师和群友“小孩”","href":"qyxhhj.html","text":"笑话 两个屑屑的家伙 屑屑的罗老师和群友“小孩” 社区切片 7 群友笑话合集/7_群友笑话合集.png"},{"section":"笑话","title":"瑟瑟，不要瑟瑟","desc":"有一段时间群里有点闹腾","href":"qyxhhj.html","text":"笑话 瑟瑟，不要瑟瑟 有一段时间群里有点闹腾 社区切片 8 群友笑话合集/8_群友笑话合集.png"},{"section":"笑话","title":"游戏备用名","desc":"关于备用名的社区讨论","href":"qyxhhj.html","text":"笑话 游戏备用名 关于备用名的社区讨论 社区切片 9 群友笑话合集/9_群友笑话合集.png"},{"section":"笑话","title":"备用名后续的讨论1","desc":"时间流逝","href":"qyxhhj.html","text":"笑话 备用名后续的讨论1 时间流逝 社区切片 10 群友笑话合集/10_群友笑话合集.png"},{"section":"笑话","title":"备用名后续的讨论2","desc":"群友都很活跃","href":"qyxhhj.html","text":"笑话 备用名后续的讨论2 群友都很活跃 社区切片 11 群友笑话合集/11_群友笑话合集.png"},{"section":"笑话","title":"汇流地的往事","desc":"多少故事随风而去，徒留满地狼藉","href":"qyxhhj.html","text":"笑话 汇流地的往事 多少故事随风而去，徒留满地狼藉 社区切片 12 群友笑话合集/12_群友笑话合集.png"},{"section":"笑话","title":"似曾相识","desc":"一段疑似前脚说完后脚忘记的聊天记录","href":"qyxhhj.html","text":"笑话 似曾相识 一段疑似前脚说完后脚忘记的聊天记录 社区切片 13 群友笑话合集/13_群友笑话合集.jpeg"},{"section":"笑话","title":"傲娇的罗老师什么时候直播","desc":"希望知诸还有复活的那一天","href":"qyxhhj.html","text":"笑话 傲娇的罗老师什么时候直播 希望知诸还有复活的那一天 社区切片 14 群友笑话合集/14_群友笑话合集.jpeg"}];

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

  function normalizeFavorite(item) {
    var source = item && typeof item === 'object' ? item : {};
    return {
      schemaVersion: 2,
      id: String(source.id || ''),
      title: String(source.title || '收藏'),
      href: String(source.href || 'zy.html'),
      note: String(source.note || ''),
      tags: Array.isArray(source.tags) ? source.tags.filter(Boolean).map(String).slice(0, 8) : [],
      pinned: source.pinned === true,
      createdAt: source.createdAt || source.updatedAt || new Date().toISOString(),
      updatedAt: source.updatedAt || new Date().toISOString()
    };
  }

  function readFavorites() {
    var migrated = false;
    var list = readList(favoritesKey).map(function (item) {
      var normalized = normalizeFavorite(item);
      if (!item || item.schemaVersion !== normalized.schemaVersion) {
        migrated = true;
      }
      return normalized;
    }).filter(function (item) {
      return item.id;
    });
    list.sort(function (a, b) {
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1;
      }
      return String(b.updatedAt).localeCompare(String(a.updatedAt));
    });
    if (migrated) {
      writeList(favoritesKey, list);
    }
    return list;
  }

  function writeFavorites(list) {
    writeList(favoritesKey, list.map(normalizeFavorite));
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function findFavorite(id) {
    return readFavorites().find(function (item) {
      return item.id === id;
    });
  }

  function toggleFavorite(id, title, href) {
    var list = readFavorites();
    var index = list.findIndex(function (item) { return item.id === id; });
    if (index >= 0) {
      list.splice(index, 1);
    } else {
      list.unshift(normalizeFavorite({
        id: id,
        title: title,
        href: href,
        updatedAt: new Date().toISOString()
      }));
    }
    writeFavorites(list);
    syncFavorites();
  }

  function favoriteGroupForId(id) {
    if (id.indexOf('official-media:') === 0 || id.indexOf('image:') === 0 || id.indexOf('lightbox:') === 0) {
      return '图片';
    }
    if (id.indexOf('official:') === 0) {
      return '官方发布';
    }
    if (id.indexOf('character:') === 0) {
      return '角色';
    }
    if (id.indexOf('concept:') === 0) {
      return '概念';
    }
    if (id.indexOf('fanart:') === 0) {
      return '二创';
    }
    if (id.indexOf('joke:') === 0) {
      return '笑话';
    }
    return '全部收藏';
  }

  function getActiveFavoriteGroup() {
    var group = localStorage.getItem(favoriteGroupKey) || '全部收藏';
    return favoriteGroups.indexOf(group) >= 0 ? group : '全部收藏';
  }

  function setActiveFavoriteGroup(group) {
    localStorage.setItem(favoriteGroupKey, favoriteGroups.indexOf(group) >= 0 ? group : '全部收藏');
  }

  function filteredFavorites(list, group) {
    if (group === '全部收藏') {
      return list;
    }
    return list.filter(function (item) {
      return favoriteGroupForId(item.id || '') === group;
    });
  }

  function renderFavoriteTags(tags) {
    if (!tags || tags.length === 0) {
      return '';
    }
    return '<span class="favorite-tags">' + tags.map(function (tag) {
      return '<em>' + escapeHtml(tag) + '</em>';
    }).join('') + '</span>';
  }

  function syncFavorites() {
    var list = readFavorites();
    var ids = list.map(function (item) { return item.id; });
    var activeGroup = getActiveFavoriteGroup();
    document.querySelectorAll('[data-favorite]').forEach(function (button) {
      button.classList.toggle('active', ids.indexOf(button.dataset.favorite) >= 0);
      button.textContent = ids.indexOf(button.dataset.favorite) >= 0 ? '已收藏' : '收藏';
    });
    document.querySelectorAll('[data-favorite-groups]').forEach(function (node) {
      node.innerHTML = favoriteGroups.map(function (group) {
        return '<button type="button" class="' + (group === activeGroup ? 'active' : '') + '" data-favorite-group="' + group + '">' + group + '</button>';
      }).join('');
    });
    document.querySelectorAll('[data-favorite-list]').forEach(function (node) {
      var shownList = filteredFavorites(list, activeGroup);
      if (list.length === 0) {
        node.innerHTML = '<p>暂无收藏。点资料卡片里的收藏按钮后，会在这里显示。</p>';
        return;
      }
      if (shownList.length === 0) {
        node.innerHTML = '<p>当前分组暂无收藏。</p>';
        return;
      }
      node.innerHTML = shownList.slice(0, 8).map(function (item) {
        return '<article class="favorite-row">'
          + '<a href="' + escapeHtml(item.href) + '">' + escapeHtml(item.title) + '</a>'
          + renderFavoriteTags(item.tags)
          + (item.note ? '<p>' + escapeHtml(item.note) + '</p>' : '')
          + '<div class="favorite-row-actions">'
          + '<button type="button" data-favorite-edit="' + escapeHtml(item.id) + '">备注</button>'
          + '<button type="button" data-favorite-pin="' + escapeHtml(item.id) + '">' + (item.pinned ? '取消置顶' : '置顶') + '</button>'
          + '</div></article>';
      }).join('');
    });
  }

  function editFavorite(id) {
    var list = readFavorites();
    var index = list.findIndex(function (item) { return item.id === id; });
    if (index < 0) {
      return;
    }
    var current = list[index];
    var note = window.prompt('收藏备注', current.note || '');
    if (note === null) {
      return;
    }
    var tagInput = window.prompt('收藏标签，用逗号分隔', current.tags.join(','));
    if (tagInput === null) {
      return;
    }
    list[index] = normalizeFavorite({
      ...current,
      note: note.trim(),
      tags: tagInput.split(/[,，]/).map(function (tag) { return tag.trim(); }).filter(Boolean),
      updatedAt: new Date().toISOString()
    });
    writeFavorites(list);
    syncFavorites();
  }

  function toggleFavoritePin(id) {
    var list = readFavorites();
    var index = list.findIndex(function (item) { return item.id === id; });
    if (index < 0) {
      return;
    }
    list[index] = normalizeFavorite({
      ...list[index],
      pinned: !list[index].pinned,
      updatedAt: new Date().toISOString()
    });
    writeFavorites(list);
    syncFavorites();
  }

  function installFavorites() {
    document.addEventListener('click', function (event) {
      var button = event.target.closest('[data-favorite]');
      if (!button) {
        var editButton = event.target.closest('[data-favorite-edit]');
        if (editButton) {
          event.preventDefault();
          editFavorite(editButton.dataset.favoriteEdit);
          return;
        }
        var pinButton = event.target.closest('[data-favorite-pin]');
        if (pinButton) {
          event.preventDefault();
          toggleFavoritePin(pinButton.dataset.favoritePin);
          return;
        }
        var groupButton = event.target.closest('[data-favorite-group]');
        if (!groupButton) {
          return;
        }
        setActiveFavoriteGroup(groupButton.dataset.favoriteGroup);
        syncFavorites();
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
      if (input.dataset.searchReady === 'true') {
        return;
      }
      input.dataset.searchReady = 'true';
      var actions = input.closest('.hero-actions');
      if (actions && input.dataset.search === 'global') {
        actions.querySelectorAll('[data-search-section]').forEach(function (button) {
          button.addEventListener('click', function () {
            actions.querySelectorAll('[data-search-section]').forEach(function (item) {
              item.classList.remove('active');
            });
            button.classList.add('active');
            runSearch(input);
          });
        });
      }
      input.addEventListener('input', function () {
        runSearch(input);
      });
    });
  }

  function getActiveSearchSection(input) {
    var actions = input.closest('.hero-actions');
    var active = actions ? actions.querySelector('[data-search-section].active') : null;
    return active ? active.dataset.searchSection : '全部';
  }

  function runSearch(input) {
    var keyword = input.value.trim().toLowerCase();
    var results = input.closest('.hero-actions')
      ? input.closest('.hero-actions').querySelector('[data-search-results]')
      : null;
    var visibleCount = 0;
    document.querySelectorAll('[data-search-text]').forEach(function (node) {
      var text = node.dataset.searchText.toLowerCase();
      var matched = !keyword || text.indexOf(keyword) >= 0;
      node.classList.toggle('is-hidden', !matched);
      if (matched && keyword) {
        visibleCount += 1;
      }
    });
    if (!results) {
      return;
    }
    if (!keyword) {
      results.hidden = true;
      results.innerHTML = '';
      return;
    }
    if (input.dataset.search === 'global') {
      renderGlobalSearchResults(results, keyword, getActiveSearchSection(input));
      return;
    }
    results.hidden = false;
    results.innerHTML = visibleCount > 0
      ? '<p class="search-empty">当前页面命中 ' + visibleCount + ' 条资料。</p>'
      : '<p class="search-empty">当前页面没有找到匹配内容。</p>';
  }

  function renderGlobalSearchResults(results, keyword, section) {
    var hits = globalSearchIndex.filter(function (item) {
      var sectionMatched = section === '全部' || item.section === section;
      return sectionMatched && item.text.toLowerCase().indexOf(keyword) >= 0;
    }).slice(0, 10);
    results.hidden = false;
    if (hits.length === 0) {
      results.innerHTML = '<p class="search-empty">没有找到匹配内容。</p>';
      return;
    }
    results.innerHTML = hits.map(function (item) {
      return '<a class="search-result" href="' + item.href + '">'
        + '<span>' + item.section + '</span>'
        + '<strong>' + item.title + '</strong>'
        + '<p>' + item.desc + '</p>'
        + '</a>';
    }).join('');
  }

  function syncRecent() {
    var enabled = localStorage.getItem('zhushen_recent_history_enabled') !== 'false';
    var list = readList(recentKey);
    document.querySelectorAll('[data-recent-list]').forEach(function (node) {
      if (!enabled) {
        node.innerHTML = '<p>最近浏览记录已关闭，可在设置页重新开启。</p>';
        return;
      }
      if (list.length === 0) {
        node.innerHTML = '<p>暂无最近浏览。打开几个档案页面后会显示在这里。</p>';
        return;
      }
      node.innerHTML = list.slice(0, 6).map(function (item) {
        return '<a href="' + item.href + '">' + item.title + '</a>';
      }).join('');
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
    var pointers = new Map();
    var transform = {scale: 1, x: 0, y: 0};
    var lastTapAt = 0;
    var longPressTimer = 0;
    var pinchStart = null;
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
      resetTransform();
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
    document.querySelectorAll('[data-save-current]').forEach(function (button) {
      button.addEventListener('click', function () {
        saveCurrentImage();
      });
    });
    image.addEventListener('pointerdown', function (event) {
      if (!current) {
        return;
      }
      image.setPointerCapture(event.pointerId);
      image.style.cursor = 'grabbing';
      pointers.set(event.pointerId, pointerFromEvent(event));
      if (pointers.size === 1) {
        startLongPress();
      }
      if (pointers.size === 2) {
        window.clearTimeout(longPressTimer);
        pinchStart = createPinchStart();
      }
    });
    image.addEventListener('pointermove', function (event) {
      if (!pointers.has(event.pointerId)) {
        return;
      }
      var previous = pointers.get(event.pointerId);
      var next = pointerFromEvent(event);
      pointers.set(event.pointerId, next);
      window.clearTimeout(longPressTimer);
      if (pointers.size === 1 && transform.scale > 1) {
        transform.x += next.x - previous.x;
        transform.y += next.y - previous.y;
        applyTransform();
        return;
      }
      if (pointers.size >= 2 && pinchStart) {
        applyPinchTransform();
      }
    });
    image.addEventListener('pointerup', endPointer);
    image.addEventListener('pointercancel', endPointer);
    image.addEventListener('dblclick', function (event) {
      event.preventDefault();
      resetTransform();
    });
    image.addEventListener('click', function (event) {
      var now = Date.now();
      if (now - lastTapAt < 280) {
        event.preventDefault();
        resetTransform();
      }
      lastTapAt = now;
    });
    function close() {
      box.classList.remove('active');
      box.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('lightbox-open');
      image.removeAttribute('src');
      image.removeAttribute('alt');
      pointers.clear();
      window.clearTimeout(longPressTimer);
      pinchStart = null;
      resetTransform();
    }

    function pointerFromEvent(event) {
      return {id: event.pointerId, x: event.clientX, y: event.clientY};
    }

    function endPointer(event) {
      if (pointers.has(event.pointerId)) {
        pointers.delete(event.pointerId);
      }
      window.clearTimeout(longPressTimer);
      image.style.cursor = 'grab';
      pinchStart = pointers.size >= 2 ? createPinchStart() : null;
    }

    function startLongPress() {
      window.clearTimeout(longPressTimer);
      longPressTimer = window.setTimeout(function () {
        saveCurrentImage();
      }, 650);
    }

    function createPinchStart() {
      var values = Array.from(pointers.values()).slice(0, 2);
      if (values.length < 2) {
        return null;
      }
      return {
        distance: distance(values[0], values[1]),
        center: center(values[0], values[1]),
        scale: transform.scale,
        x: transform.x,
        y: transform.y
      };
    }

    function applyPinchTransform() {
      var values = Array.from(pointers.values()).slice(0, 2);
      if (!pinchStart || values.length < 2 || pinchStart.distance <= 0) {
        return;
      }
      var nextCenter = center(values[0], values[1]);
      var nextDistance = distance(values[0], values[1]);
      transform.scale = clamp(
        pinchStart.scale * (nextDistance / pinchStart.distance),
        1,
        4
      );
      transform.x = pinchStart.x + nextCenter.x - pinchStart.center.x;
      transform.y = pinchStart.y + nextCenter.y - pinchStart.center.y;
      if (transform.scale === 1) {
        transform.x = 0;
        transform.y = 0;
      }
      applyTransform();
    }

    function distance(first, second) {
      var deltaX = first.x - second.x;
      var deltaY = first.y - second.y;
      return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }

    function center(first, second) {
      return {
        x: (first.x + second.x) / 2,
        y: (first.y + second.y) / 2
      };
    }

    function clamp(value, min, max) {
      return Math.min(max, Math.max(min, value));
    }

    function resetTransform() {
      transform = {scale: 1, x: 0, y: 0};
      applyTransform();
    }

    function applyTransform() {
      image.style.transform = 'translate3d('
        + transform.x
        + 'px, '
        + transform.y
        + 'px, 0) scale('
        + transform.scale
        + ')';
    }

    function saveCurrentImage() {
      if (!current || !current.src) {
        return;
      }
      if (window.Android && typeof window.Android.saveImage === 'function') {
        window.Android.saveImage(new URL(current.src, location.href).href);
        return;
      }
      var link = document.createElement('a');
      link.href = current.src;
      link.download = current.title || 'zhushen-image';
      document.body.appendChild(link);
      link.click();
      link.remove();
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
    var splashVideoLabels = {"random":"随机播放","none":"关闭启动视频","atal":"阿塔尔","atal_skill":"阿塔尔技能特效","atal_huimu":"阿塔尔回眸","dehenu":"德赫奴","dehenu_skill":"德赫奴技能"};
    var splashEntryLabels = {
      skippable: '可点击跳过',
      complete: '播放完进入'
    };

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

    function getSplashEntryMode() {
      return localStorage.getItem('zhushen_splash_entry_mode') || 'skippable';
    }

    function setSplashEntryMode(mode) {
      localStorage.setItem('zhushen_splash_entry_mode', mode);
    }

    function syncSplashEntryControls() {
      var mode = getSplashEntryMode();
      document.querySelectorAll('[data-splash-entry-mode]').forEach(function (button) {
        button.classList.toggle('active', button.dataset.splashEntryMode === mode);
      });
      document.querySelectorAll('[data-splash-entry-status]').forEach(function (node) {
        node.textContent = '进入方式：' + (splashEntryLabels[mode] || '可点击跳过');
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

    function isReducedMotionEnabled() {
      return localStorage.getItem('zhushen_reduced_motion_enabled') === 'true';
    }

    function setReducedMotionEnabled(enabled) {
      localStorage.setItem('zhushen_reduced_motion_enabled', String(enabled));
      document.documentElement.classList.toggle('reduced-motion', enabled);
    }

    function isRecentHistoryEnabled() {
      return localStorage.getItem('zhushen_recent_history_enabled') !== 'false';
    }

    function setRecentHistoryEnabled(enabled) {
      localStorage.setItem('zhushen_recent_history_enabled', String(enabled));
      syncRecent();
    }

    function syncDisplayHistoryControls() {
      var reducedMotion = isReducedMotionEnabled();
      var recentHistory = isRecentHistoryEnabled();
      document.querySelectorAll('[data-reduced-motion-set]').forEach(function (button) {
        var buttonEnabled = button.dataset.reducedMotionSet === 'true';
        button.classList.toggle('active', buttonEnabled === reducedMotion);
      });
      document.querySelectorAll('[data-recent-history-set]').forEach(function (button) {
        var buttonEnabled = button.dataset.recentHistorySet === 'true';
        button.classList.toggle('active', buttonEnabled === recentHistory);
      });
      document.querySelectorAll('[data-display-history-status]').forEach(function (node) {
        node.textContent = '显示与记录：'
          + (reducedMotion ? '低动态开启' : '低动态关闭')
          + ' · '
          + (recentHistory ? '记录最近浏览' : '不记录最近浏览');
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
    document.querySelectorAll('[data-splash-entry-mode]').forEach(function (button) {
      button.addEventListener('click', function () {
        setSplashEntryMode(button.dataset.splashEntryMode);
        syncSplashEntryControls();
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
    document.querySelectorAll('[data-reduced-motion-set]').forEach(function (button) {
      button.addEventListener('click', function () {
        setReducedMotionEnabled(button.dataset.reducedMotionSet === 'true');
        syncDisplayHistoryControls();
      });
    });
    document.querySelectorAll('[data-recent-history-set]').forEach(function (button) {
      button.addEventListener('click', function () {
        setRecentHistoryEnabled(button.dataset.recentHistorySet === 'true');
        syncDisplayHistoryControls();
      });
    });
    syncOrientationControls();
    syncSplashVideoControls();
    syncSplashEntryControls();
    syncBackgroundMusicControls();
    syncDisplayHistoryControls();
  }

  function recordRecent() {
    if (localStorage.getItem('zhushen_recent_history_enabled') === 'false') {
      syncRecent();
      return;
    }
    var title = document.title;
    var href = location.pathname.split('/').pop();
    var list = readList(recentKey).filter(function (item) { return item.href !== href; });
    list.unshift({title: title, href: href});
    writeList(recentKey, list);
    syncRecent();
  }

  function refreshPage() {
    installSearch();
    installFilters();
    installNativeVideoBridge();
    installSettings();
    syncFavorites();
    syncRecent();
    recordRecent();
  }

  installNavigation();
  installLightbox();
  installFavorites();
  refreshPage();
  window.ZhushenUIRefresh = refreshPage;
})();
