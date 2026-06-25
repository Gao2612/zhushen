const { existsSync, readFileSync, writeFileSync } = require('fs');
const { join, resolve } = require('path');

const root = resolve(__dirname, '..');
const assetsRoot = join(root, 'manual-build', 'assets');
const packageJson = require('../package.json');

const fallbackPages = [
  { href: 'zy.html', label: '首页' },
  { href: 'official.html', label: '官方发布' },
  { href: 'gfjs.html', label: '角色' },
  { href: 'gfgn.html', label: '概念' },
  { href: 'wjec.html', label: '二创' },
  { href: 'qyxhhj.html', label: '笑话' }
];

const fallbackSearchSections = [
  ['全部', '全部'],
  ['官方', '官方发布'],
  ['角色', '角色'],
  ['概念', '概念'],
  ['二创', '二创'],
  ['笑话', '笑话']
];

const fallbackFavoriteGroups = [
  '全部收藏',
  '官方发布',
  '角色',
  '概念',
  '二创',
  '笑话',
  '图片'
];

const fallbackCharacters = [
  {
    key: 'atal',
    name: '阿塔尔',
    title: '少女骑士 · 送葬人',
    tags: ['官方', '猎人', '送葬人'],
    cover: '官方-角色/阿塔尔/阿塔尔1 .jpeg',
    desc:
      '被国家和盟友背叛的少女骑士。死前与「第十三席的恶魔」定约，' +
      '堕入名为「汇流地」的异界，成为猎人，代号「送葬人」，' +
      '开始履行契约——狩猎神明。',
    quote: '去为诸神带回死亡吧，「送葬人」。',
    images: [
      '官方-角色/阿塔尔/阿塔尔1 .jpeg',
      '官方-角色/阿塔尔/阿塔尔2.png',
      '官方-角色/阿塔尔/阿塔尔3.png',
      '官方-角色/阿塔尔/阿塔尔4.jpeg',
      '官方-角色/阿塔尔/阿塔尔5.jpeg'
    ],
    videos: [
      { src: '官方-角色/视频/阿塔尔.mp4', label: '阿塔尔展示' },
      { src: '官方-角色/视频/阿塔尔回睦.mp4', label: '阿塔尔回眸' },
      { src: '官方-角色/视频/阿塔尔技能特效.mp4', label: '技能特效' }
    ]
  },
  {
    key: 'dehenu',
    name: '德赫奴',
    title: '神明 · 无性别',
    tags: ['官方', '神明', '待考证'],
    cover: '官方-角色/德赫奴/德赫奴1.jpeg',
    desc:
      '已知身份为神明，设定为无性别。曾在 PV 中对阿塔尔说道：' +
      '“你的灵魂非常明亮，真是令人怀念呢。”',
    quote: '你的灵魂非常明亮，真是令人怀念呢。',
    images: [
      '官方-角色/德赫奴/德赫奴1.jpeg',
      '官方-角色/德赫奴/德赫奴2.jpeg',
      '官方-角色/德赫奴/德赫奴3.png'
    ],
    videos: [
      { src: '官方-角色/视频/德赫奴.mp4', label: '德赫奴展示' },
      { src: '官方-角色/视频/德赫奴技能.mp4', label: '技能演示' }
    ]
  },
  {
    key: 'laxia',
    name: '拉夏·贝乌斯',
    title: '第十三席恶魔',
    tags: ['官方', '恶魔', '契约'],
    cover: '官方-角色/拉夏·贝乌斯/拉夏1.jpeg',
    desc:
      '汇流地的管理者之一，与阿塔尔定下契约的「第十三席恶魔」。' +
      '以自身手段深入调查汇流地的异变。',
    quote: '汇流地的管理者之一。',
    images: [
      '官方-角色/拉夏·贝乌斯/拉夏1.jpeg',
      '官方-角色/拉夏·贝乌斯/拉夏2.png',
      '官方-角色/拉夏·贝乌斯/拉夏3.jpeg',
      '官方-角色/拉夏·贝乌斯/拉夏4.jpeg',
      '官方-角色/拉夏·贝乌斯/拉夏5.jpeg'
    ],
    videos: []
  },
  {
    key: 'meisaidesi',
    name: '梅赛德斯',
    title: '神秘旅者',
    tags: ['官方', '待补充'],
    cover: '官方-角色/梅赛德斯/梅赛德斯1.jpeg',
    desc: '在汇流地中出现的另一位神秘角色，其背景和目的尚待揭晓。',
    quote: '背景仍待补充。',
    images: [
      '官方-角色/梅赛德斯/梅赛德斯1.jpeg',
      '官方-角色/梅赛德斯/梅赛德斯2.png'
    ],
    videos: []
  },
  {
    key: 'xilan',
    name: '夕岚',
    title: '暮色之岚',
    tags: ['官方', '猎人', '异化'],
    cover: '官方-角色/夕岚/夕岚1.jpeg',
    desc:
      '汇流地中的猎人之一。受生命法则影响，在踏入汇流地深层后' +
      '逐渐产生扭曲与异化。拥有丰富的人气二创作品。',
    quote: '汇流地中的猎人之一。',
    images: [
      '官方-角色/夕岚/夕岚1.jpeg',
      '官方-角色/夕岚/夕岚2.jpeg',
      '官方-角色/夕岚/夕岚3.jpeg',
      '官方-角色/夕岚/夕岚4.jpeg',
      '官方-角色/夕岚/夕岚5.png',
      '官方-角色/夕岚/夕岚6.png',
      '官方-角色/夕岚/夕岚7.jpeg',
      '官方-角色/夕岚/夕岚8.jpeg',
      '官方-角色/夕岚/夕岚9.gif'
    ],
    videos: []
  }
];

const fallbackFanVideos = [
  {
    src: '官方-角色/视频/夕岚玩家二创1.mp4',
    title: '夕岚玩家二创一',
    desc: '从角色官方页移入二创归档，避免与官方设定混放。',
    character: '夕岚'
  },
  {
    src: '官方-角色/视频/夕岚玩家二创2.mp4',
    title: '夕岚玩家二创二',
    desc: '从角色官方页移入二创归档，保留应用内播放入口。',
    character: '夕岚'
  },
  {
    src: '官方-角色/视频/夕岚我的世界.mp4',
    title: '夕岚我的世界',
    desc: '玩家自制内容，作为二创视频单独收录。',
    character: '夕岚'
  }
];

const fallbackConceptCards = [
  {
    title: '登场角色：德赫奴',
    src: '官方-概念/登场角色：德赫奴.png',
    tag: '官方宣传物料'
  },
  {
    title: '登场角色：拉夏·贝乌斯',
    src: '官方-概念/登场角色：拉夏·贝乌斯.png',
    tag: '官方宣传物料'
  },
  {
    title: '游戏登入界面',
    src: '官方-概念/登入界面.jpeg',
    tag: '官方宣传物料'
  },
  {
    title: '制作人补充设想',
    src: '官方-概念/一醉关于游戏定位的补充和设想~.jpeg',
    tag: '官方资料'
  },
  {
    title: '白国主与拉夏的角色定位',
    src: '官方-概念/白国主&拉夏的角色定位.png',
    tag: '角色定位'
  }
];

for (let index = 1; index <= 15; index += 1) {
  const ext = [1, 2, 3, 5, 7].includes(index) ? 'jpeg' : 'png';
  fallbackConceptCards.push({
    title: `原官方世界观概念图 ${index}`,
    src: `官方-概念/官方概念（原官方世界观）/${index}_官方概念（原官方世界观）.${ext}`,
    tag: '世界观'
  });
}

const fallbackArtists = [
  ['阿钰钰钰', '玩家-二创图/阿钰钰钰/', ['阿钰钰钰拉夏1.gif', '阿钰钰钰拉夏2.gif', '阿钰钰钰夕岚1.png']],
  ['初月wy', '玩家-二创图/初月wy/', ['初月wy夕岚1.png', '初月wy夕岚2.png']],
  ['电子水泥沥灰', '玩家-二创图/电子水泥沥灰/', ['电子水泥沥灰夕岚1.jpeg']],
  ['范斯梅耶', '玩家-二创图/范斯梅耶/', ['范斯梅耶拉夏1.jpeg', '范斯梅耶拉夏2.jpeg', '范斯梅耶拉夏3.png', '范斯梅耶拉夏4.jpeg', '范斯梅耶拉夏5.jpeg', '范斯梅耶拉夏6.jpeg', '范斯梅耶拉夏7.jpeg']],
  ['共创（已获取画师同意）', '玩家-二创图/共创（已获取画师同意）/', ['共创（已获取画师同意）1.jpeg', '共创（已获取画师同意）2.jpeg', '共创（已获取画师同意）3.jpeg', '共创（已获取画师同意）4.jpeg', '共创（已获取画师同意）5.jpeg', '共创（已获取画师同意）6.jpeg', '共创（已获取画师同意）7.jpeg', '共创（已获取画师同意）8.jpeg', '共创（已获取画师同意）9.jpeg', '共创（已获取画师同意）11.jpeg', '共创（已获取画师同意）12.jpeg', '共创（已获取画师同意）13.jpeg']],
  ['精神病系教主', '玩家-二创图/精神病系教主/', ['精神病系教主拉夏1.jpeg', '精神病系教主拉夏2.jpeg', '精神病系教主拉夏3.jpeg']],
  ['莲生', '玩家-二创图/莲生/', ['莲生夕岚1.png', '莲生夕岚2.png']],
  ['皮皮', '玩家-二创图/皮皮/', ['皮皮阿塔尔1.png', '皮皮德赫奴1.jpeg', '皮皮夕岚1.jpeg', '皮皮夕岚2.jpeg', '皮皮夕岚3.jpeg', '皮皮夕岚4.jpeg']],
  ['巧枝椅', '玩家-二创图/巧枝椅/', ['巧枝椅水墨1.jpeg', '巧枝椅水墨2.jpeg', '巧枝椅水墨3.jpeg', '巧枝椅水墨4.jpeg', '巧枝椅水墨5.jpeg', '巧枝椅水墨6.jpeg', '巧枝椅夕岚1.jpeg', '巧枝椅夕岚2.jpeg']],
  ['夕岚老公', '玩家-二创图/夕岚老公/', ['夕岚老公夕岚1.jpeg', '夕岚老公夕岚2.png']],
  ['心理素质叼差', '玩家-二创图/心理素质叼差/', ['心理素质叼差阿塔尔1.jpeg', '心理素质叼差拉夏1.jpeg', '心理素质叼差拉夏2.jpeg', '心理素质叼差拉夏3.jpeg', '心理素质叼差拉夏4.jpeg', '心理素质叼差梅赛德斯1.jpeg', '心理素质叼差夕岚1.jpeg', '心理素质叼差夕岚2.jpeg']],
  ['鸭鸭', '玩家-二创图/鸭鸭（待补充整理）/', ['鸭鸭夕岚1.jpeg', '鸭鸭夕岚2.jpeg', '鸭鸭夕岚3.jpeg', '鸭鸭夕岚4.jpeg', '鸭鸭夕岚6.jpeg', '鸭鸭夕岚7.jpeg', '鸭鸭夕岚8.png', '鸭鸭夕岚9.png', '鸭鸭夕岚10.png', '鸭鸭夕岚11.png']],
  ['hsj', '玩家-二创图/hsj/', ['hsj拉夏1.jpeg']],
  ['jk凯威', '玩家-二创图/jk凯威/', ['jk凯威阿塔尔1.jpeg', 'jk凯威拉夏1.png']]
].map(([name, base, files]) => ({
  name,
  base,
  files,
  entries: files.map((file) => ({
    title: file.replace(/\.(jpeg|jpg|png|gif)$/i, ''),
    src: base + file,
    artist: name,
    type: file.toLowerCase().endsWith('.gif') ? '动图' : '图片',
    character: detectCharacter(file)
  }))
}));

const fallbackJokes = [
  ['罗老师的画饼', '罗老师24年年初在游戏官群画的饼'],
  ['版号戏谈', '可惜，本来一测那会儿就要申请版号的'],
  ['群友“虾”的嚣张', '虾自从线下测试见过罗老师后就放开了自己'],
  ['虾是罗老师的狗', '一段很有社区记忆点的群聊片段'],
  ['罗老师疯狂星期四V50', '真的给安装包吗'],
  ['虾你在干什么', '不是哥们'],
  ['两个屑屑的家伙', '屑屑的罗老师和群友“小孩”'],
  ['瑟瑟，不要瑟瑟', '有一段时间群里有点闹腾'],
  ['游戏备用名', '关于备用名的社区讨论'],
  ['备用名后续的讨论1', '时间流逝'],
  ['备用名后续的讨论2', '群友都很活跃'],
  ['汇流地的往事', '多少故事随风而去，徒留满地狼藉'],
  ['似曾相识', '一段疑似前脚说完后脚忘记的聊天记录'],
  ['傲娇的罗老师什么时候直播', '希望知诸还有复活的那一天']
].map(([title, desc], index) => ({
  title,
  desc,
  src: `群友笑话合集/${index + 1}_群友笑话合集.${[1, 2, 7, 8, 9, 10, 11, 12].includes(index + 1) ? 'png' : 'jpeg'}`
}));

const fallbackSplashVideos = [
  ['random', '随机播放'],
  ['none', '关闭启动视频'],
  ['atal', '阿塔尔'],
  ['atal_skill', '阿塔尔技能特效'],
  ['atal_huimu', '阿塔尔回眸'],
  ['dehenu', '德赫奴'],
  ['dehenu_skill', '德赫奴技能']
];

const fallbackOfficialPosts = [
  {
    id: 'offline-tech-test-recruit',
    title: '《诸神终应知晓》线下技术测招募开启',
    date: '2024/02',
    sourceName: '诸神终应知晓',
    category: '梦开始的地方',
    sourceUrl: 'https://ycbcj9s09d.feishu.cn/share/base/form/shrcna0QuEOrv2f2xRalylRayrc',
    sourceLabel: '来源：官方线下技术测招募信息，已整理为应用内档案',
    summary:
      '官方开启上海线下技术测试招募，玩家可体验首曝实拍录制里的完整内容，并提供合理范围内最高 2000 元报销额度。',
    quote: '本次测试为线下技术测试，玩家可以体验到首曝实拍录制里的完整内容。',
    content: [
      '问卷链接：https://ycbcj9s09d.feishu.cn/share/base/form/shrcna0QuEOrv2f2xRalylRayrc',
      '试玩活动地点：上海。',
      '活动举办时间：3月2日（周六）或3月9日（周六），具体以报名实际情况为准。',
      '本次测试为线下技术测试，玩家可以体验到首曝实拍录制里的完整内容：2个可观赏/游玩的角色、2个可挑战的BOSS、1张大地图。',
      '同时，官方为所有获得试玩资格的玩家准备了 2000 元报销额度，报销适用于合理范围内的往返交通费用与活动当晚住宿。',
      '活动资格将于 2月22日 选出，届时罗老师会通过 QQ-2464090881 私信通知活动相关详细信息。'
    ],
    points: [
      '线下技术测地点为上海。',
      '可体验内容包含 2 个可观赏/游玩的角色、2 个可挑战 BOSS 与 1 张大地图。',
      '获得试玩资格的玩家可获得合理范围内最高 2000 元报销额度。'
    ],
    media: []
  },
  {
    id: '492288870839223557',
    title: '实机首曝 PV',
    date: '2024/01/05',
    sourceName: '诸神终应知晓',
    category: 'PV',
    sourceUrl: 'https://www.taptap.cn/moment/492288870839223557?group_id=708622',
    summary:
      '首曝 PV 以“为神明带回死亡”为核心宣言，公开了汇流地、送葬人和同行者命运的基础氛围。',
    quote: '去为诸神带回死亡吧，「送葬人」。',
    content: [
      '官方正文将故事定位在少女的归乡之路上，关键词是杀戮、成长、救赎与成王。',
      'PV 同时把汇流地称作尘世的墓地与摇篮，强调它即将向玩家展开。',
      '帖子里的情绪核心不是单纯展示战斗，而是送葬人和数十位同行者的邂逅、别离与命运。'
    ],
    points: [
      '故事围绕杀戮、成长、救赎与成王展开。',
      '汇流地被描述为尘世的墓地与摇篮。',
      '强调与数十位拥有闪耀灵魂的同行者相遇和别离。'
    ],
    media: [
      {
        type: 'video',
        src: 'official-posts/492288870839223557/pv.mp4',
        poster: 'official-posts/492288870839223557/cover.jpg',
        label: '实机首曝 PV'
      },
      { type: 'image', src: 'official-posts/492288870839223557/media-01.jpg', label: 'PV 帖内配图' },
      { type: 'image', src: 'official-posts/492288870839223557/media-02.jpg', label: 'PV 帖内封面' }
    ]
  },
  {
    id: '492294102788866561',
    title: '手机实拍录制 Player Reaction',
    date: '2024/01/05',
    sourceName: '诸神终应知晓',
    category: '实机影像',
    sourceUrl: 'https://www.taptap.cn/moment/492294102788866561?group_id=708622',
    summary:
      '官方发布手机端实机试玩影像，注明设备为 RedMi K70，并提示内容仍处开发阶段。',
    quote: '游戏开发中，不代表最终品质。',
    content: [
      '这条动态的核心是手机端实机试玩影像，标题明确标注 Player Reaction。',
      '官方正文注明试玩设备为 RedMi K70，并把内容限定在开发中版本。',
      '已通过 TapTap 视频资源接口补齐 720p 应用内播放版本，保留原帖封面与帖内配图。'
    ],
    points: [
      '视频内容为玩家-投资人罗老师的实机试玩反应。',
      '素材重点展示移动端实机运行效果。',
      '官方明确标注最终品质仍以正式版本为准。'
    ],
    media: [
      {
        type: 'video',
        src: 'official-posts/492294102788866561/player-reaction.mp4',
        poster: 'official-posts/492294102788866561/media-02.jpg',
        label: '手机实拍录制 Player Reaction'
      },
      { type: 'image', src: 'official-posts/492294102788866561/media-01.jpg', label: '实机影像帖内配图' },
      { type: 'image', src: 'official-posts/492294102788866561/media-02.jpg', label: 'Player Reaction 视频封面' }
    ]
  },
  {
    id: '499956228982573909',
    title: '官方玩家群现已建立',
    date: '2024/01/25',
    sourceName: '诸神终应知晓',
    category: '社群',
    sourceUrl: 'https://www.taptap.cn/moment/499956228982573909?group_id=708622',
    summary:
      '官方宣布玩家群建立，公开群号，并配套发布抽奖活动与首曝 PV、实拍录制入口。',
    quote: '官方玩家群现已建立。',
    content: [
      '官方在正文中感谢玩家关注，并公开玩家群建立信息。',
      '帖子把加群截图互动、抽奖活动和官方内容入口放在同一条动态里。',
      '本卡片保留群号、活动性质和官方配图，不收录评论区参与截图。'
    ],
    points: [
      '官方玩家群号：130340208。',
      '帖子包含加群互动抽奖活动说明。',
      '官方整理了首曝 PV 与实拍录制两个延伸入口。'
    ],
    media: [
      { type: 'image', src: 'official-posts/499956228982573909/media-01.jpg', label: '官方玩家群配图一' },
      { type: 'image', src: 'official-posts/499956228982573909/media-02.jpg', label: '官方玩家群配图二' }
    ]
  },
  {
    id: '514519781039145122',
    title: '线下试玩活动回顾',
    date: '2024/03/06',
    sourceName: '诸神终应知晓',
    category: '线下试玩',
    sourceUrl: 'https://www.taptap.cn/moment/514519781039145122?group_id=708622',
    summary:
      '官方回顾上海线下试玩活动，集中回应操作、性能、技能反馈、养成和游戏定位等问题。',
    quote: '试玩内容为9个月前的临时版本。',
    content: [
      '官方说明线下试玩以群内招募方式在上海举行，用来和玩家见面并收集反馈。',
      '正文的重点是答疑：从移动端误触、角色切换、性能表现到技能理解都有回应。',
      '制作组强调测试版本较早，许多问题已经在后续规划或优化中。'
    ],
    points: [
      '误触、切换角色、处决灵敏度、掉帧与穿模均被列入后续优化。',
      '制作人说明正式切人方案会包含头像点击与双指划屏两种方式。',
      '官方将定位描述为带动作要素的刷子游戏，并确认女主锁定。'
    ],
    media: [
      { type: 'image', src: 'official-posts/514519781039145122/media-01.jpg', label: '线下试玩图一' },
      { type: 'image', src: 'official-posts/514519781039145122/media-02.jpg', label: '线下试玩图二' },
      { type: 'image', src: 'official-posts/514519781039145122/media-03.jpg', label: '线下试玩图三' },
      { type: 'image', src: 'official-posts/514519781039145122/media-04.jpg', label: '线下试玩图四' },
      { type: 'image', src: 'official-posts/514519781039145122/media-05.jpg', label: '线下试玩图五' },
      { type: 'image', src: 'official-posts/514519781039145122/media-06.jpg', label: '线下试玩图六' },
      { type: 'image', src: 'official-posts/514519781039145122/media-07.jpg', label: '线下试玩图七' },
      { type: 'image', src: 'official-posts/514519781039145122/media-08.jpg', label: '线下试玩图八' },
      { type: 'image', src: 'official-posts/514519781039145122/media-09.jpg', label: '线下试玩图九' },
      { type: 'image', src: 'official-posts/514519781039145122/media-10.jpg', label: '线下试玩图十' }
    ]
  },
  {
    id: '525136274135190081',
    title: '线下参展 ComiDay27',
    date: '2024/04/05',
    sourceName: '诸神终应知晓',
    category: '线下参展',
    sourceUrl: 'https://www.taptap.cn/moment/525136274135190081?group_id=708622',
    summary:
      '官方宣布首次参展成都 ComiDay27，提供实机试玩、周边领取和 BOSS 挑战等活动。',
    quote: '黑暗幻想 X 3D点划激爽ACT。',
    content: [
      '这条动态是参展预告，核心信息是成都 ComiDay27 的时间、地点和展位。',
      '现场内容包括实机试玩、周边领取、BOSS 挑战和正式测试资格相关活动。',
      '卡片内置了帖子宣传图，方便在应用里直接查看参展信息。'
    ],
    points: [
      '活动时间为 4.5 至 4.6。',
      '活动地点为成都西博城会展中心 14 号馆。',
      '展位编号为 T17-19，并设置正式测试资格挑战。'
    ],
    media: [
      { type: 'image', src: 'official-posts/525136274135190081/media-01.jpg', label: 'ComiDay27 参展图一' },
      { type: 'image', src: 'official-posts/525136274135190081/media-02.jpg', label: 'ComiDay27 参展图二' },
      { type: 'image', src: 'official-posts/525136274135190081/media-03.jpg', label: 'ComiDay27 参展图三' }
    ]
  },
  {
    id: '534736525926074207',
    title: '诸神终应知晓 X 核聚变',
    date: '2024/05/01',
    sourceName: '诸神终应知晓',
    category: '线下参展',
    sourceUrl: 'https://www.taptap.cn/moment/534736525926074207?group_id=708622',
    summary:
      '官方宣布参加广州核聚变，现场开放首曝版实机试玩、周边领取与 BOSS 挑战。',
    quote: '现场有游戏实机可试玩。',
    content: [
      '官方把这条动态作为广州核聚变参展公告，说明现场会开放游戏实机试玩。',
      '活动内容延续线下试玩、周边领取、BOSS 挑战和互动赠票。',
      '帖子内的主视觉图已放入卡片画廊，可直接在应用里查看。'
    ],
    points: [
      '活动时间为 5.18 至 5.19。',
      '活动地点为广州保利世贸博览馆 6 号馆。',
      '展位编号为 A18，并设置互动赠票活动。'
    ],
    media: [
      { type: 'image', src: 'official-posts/534736525926074207/media-01.jpg', label: '核聚变参展图' }
    ]
  },
  {
    id: '544236913331014741',
    title: '参展回顾',
    date: '2024/05/27',
    sourceName: '魔王圆桌',
    category: '参展回顾',
    sourceUrl: 'https://www.taptap.cn/moment/544236913331014741?group_id=708622',
    summary:
      '魔王圆桌回顾上海线下测、成都 ComicDay 与广州核聚变，并继续公开试玩反馈答疑。',
    quote: '一千多名玩家试玩过游戏。',
    content: [
      '这篇回顾把三次线下见面串成一条时间线：上海线下测、成都 ComicDay、广州核聚变。',
      '正文继续回应动作手感、闪避、普攻判定、QTE 倒计时、画质差异等玩家反馈。',
      '卡片保留了大量现场图和一张 GIF，作为参展过程的视觉档案。'
    ],
    points: [
      '回顾三次线下见面，并感谢玩家志愿者协助。',
      '闪避、操作队列、普攻判定、QTE 倒计时等问题进入优化讨论。',
      '官方说明 PC 端画质会高于手机端，但不会与移动端割裂。'
    ],
    media: [
      { type: 'image', src: 'official-posts/544236913331014741/media-01.jpg', label: '参展回顾图一' },
      { type: 'image', src: 'official-posts/544236913331014741/media-02.jpg', label: '参展回顾图二' },
      { type: 'image', src: 'official-posts/544236913331014741/media-03.jpg', label: '参展回顾图三' },
      { type: 'image', src: 'official-posts/544236913331014741/media-04.jpg', label: '参展回顾图四' },
      { type: 'image', src: 'official-posts/544236913331014741/media-05.jpg', label: '参展回顾图五' },
      { type: 'image', src: 'official-posts/544236913331014741/media-06.jpg', label: '参展回顾图六' },
      { type: 'image', src: 'official-posts/544236913331014741/media-07.jpg', label: '参展回顾图七' },
      { type: 'image', src: 'official-posts/544236913331014741/media-08.jpg', label: '参展回顾图八' },
      { type: 'image', src: 'official-posts/544236913331014741/media-09.jpg', label: '参展回顾图九' },
      { type: 'image', src: 'official-posts/544236913331014741/media-10.jpg', label: '参展回顾图十' },
      { type: 'image', src: 'official-posts/544236913331014741/media-11.jpg', label: '参展回顾图十一' },
      { type: 'image', src: 'official-posts/544236913331014741/media-12.jpg', label: '参展回顾图十二' },
      { type: 'image', src: 'official-posts/544236913331014741/media-13.jpg', label: '参展回顾图十三' },
      { type: 'image', src: 'official-posts/544236913331014741/media-14.jpg', label: '参展回顾静态封面' },
      { type: 'gif', src: 'official-posts/544236913331014741/media-15.gif', label: '参展回顾 GIF' }
    ]
  },
  {
    id: '568559847222545007',
    title: '不要祈祷，不要合上战斗的双手',
    date: '2024/08/02',
    sourceName: '魔王圆桌',
    category: '研发冻结',
    sourceUrl: 'https://www.taptap.cn/moment/568559847222545007?group_id=708622',
    summary:
      '魔王圆桌宣布《诸神终应知晓》无限期冻结研发，并发布来自一醉与罗莎的告别文字。',
    quote: '我只愿诸位——勇气常在。',
    content: [
      '官方在 2024 年 8 月 2 日宣布项目无限期冻结研发。',
      '帖子由制作组公告、一醉的长文和罗莎的告别文字构成，语气明显偏向阶段性告别。',
      '卡片保留了帖内 GIF 与静态封面，用作研发冻结公告的视觉档案。'
    ],
    points: [
      '官方说明在与各方沟通后决定无限期冻结研发。',
      '一醉以长文向玩家和行业朋友告别。',
      '罗莎表示短暂告别是为了更好的再见做准备。'
    ],
    media: [
      { type: 'gif', src: 'official-posts/568559847222545007/media-01.gif', label: '研发冻结公告 GIF' },
      { type: 'image', src: 'official-posts/568559847222545007/media-02.jpg', label: '研发冻结公告封面' }
    ]
  },
  {
    id: 'luo-teacher-goodbye-letter',
    title: 'To 罗老师最可爱的玩家',
    date: '2024/08/02',
    sourceName: '罗老师',
    category: '暂时的终章',
    sourceUrl: '',
    sourceLabel: '来源：罗老师给玩家的告别信，已整理为应用内档案',
    summary:
      '罗老师以告别信的形式向玩家、管理、志愿者和群友致谢，说明项目暂别，并表达未来重启《诸神终应知晓》的愿望。',
    quote: '这是个黯淡的世界，但终有人，会成为太阳。',
    content: [
      'To 罗老师最可爱的玩家，',
      '这大概是我第一次以这种方式来和他人告别。',
      '大概你们发现了，我有段时间没出现在群里了，一直在做斗争，与融资做斗争，与天命在做斗争，与内心的不甘在做斗争。',
      '不好意思，渺小如我们，仍然没有打赢这场复活赛，没有办法让你们看到我们所坚信的“奇迹”。',
      '说出来你们可能不信，以前作为投资人的我其实是很害怕和玩家沟通的，最开始说话都很小心翼翼。',
      '是你们，让我意识到玩家是这么得可爱，这么得真诚，这么得值得我们努力活下去。',
      '线下见过的每一位玩家的脸我都记得，线上和我打过招呼的每一位群友我也记得。',
      '我很害怕失去你们，纵然万般不舍，却又不得不亲自写下这封告别信。',
      '感谢每一位管理、志愿者、群友、玩家，对我、对诸神终应知晓、对魔王圆桌的支持。',
      '但我想，强大如我们，不会停下前行的脚步，我们会一直坚持做游戏。',
      '终有一天，我们会攒足力量，重启《诸神终应知晓》，这场短暂的告别是为了更好的再见做准备。',
      '这是个黯淡的世界，但终有人，会成为太阳。',
      '群不会解散，会从官群转为民间朋友群；我也不会走，会时不时出现看看你们。',
      '祝，各位一切都好。'
    ],
    points: [
      '这是一封面向玩家、管理、志愿者与群友的告别信。',
      '信中说明项目暂别的原因与不舍，并感谢玩家对项目和魔王圆桌的支持。',
      '罗老师表达了未来攒足力量、重启《诸神终应知晓》的愿望。'
    ],
    media: []
  }
];

function readContentJson(fileName, fallbackValue) {
  const filePath = join(root, 'content', fileName);
  if (!existsSync(filePath)) {
    return fallbackValue;
  }
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

const navigationContent = readContentJson('navigation.json', {
  pages: fallbackPages,
  searchSections: fallbackSearchSections,
  favoriteGroups: fallbackFavoriteGroups
});
const fanCreationContent = readContentJson('fan-creations.json', {
  fanVideos: fallbackFanVideos,
  artists: fallbackArtists
});
const pages = navigationContent.pages || fallbackPages;
const searchSections =
  navigationContent.searchSections || fallbackSearchSections;
const favoriteGroups =
  navigationContent.favoriteGroups || fallbackFavoriteGroups;
const characters = readContentJson('characters.json', fallbackCharacters);
const fanVideos = fanCreationContent.fanVideos || fallbackFanVideos;
const conceptCards = readContentJson('concepts.json', fallbackConceptCards);
const artists = fanCreationContent.artists || fallbackArtists;
const jokes = readContentJson('jokes.json', fallbackJokes);
const splashVideos = readContentJson('splash-videos.json', fallbackSplashVideos);
const officialPosts = readContentJson(
  'official-posts.json',
  fallbackOfficialPosts
);

function dateValue(date) {
  const parts = date.split('/').map((part) => Number(part));
  const year = parts[0] || 1970;
  const month = parts[1] || 1;
  const day = parts[2] || new Date(year, month, 0).getDate();
  return new Date(year, month - 1, day).getTime();
}

function officialPostsByDate() {
  return officialPosts
    .map((post, index) => ({ post, index }))
    .sort((left, right) => {
      const dateDiff = dateValue(right.post.date) - dateValue(left.post.date);
      return dateDiff || left.index - right.index;
    })
    .map((entry) => entry.post);
}

function detectCharacter(file) {
  for (const name of ['阿塔尔', '德赫奴', '拉夏', '梅赛德斯', '夕岚']) {
    if (file.includes(name)) {
      return name;
    }
  }
  return '综合';
}

function buildSearchIndex() {
  const entries = [];
  const pushEntry = ({ section, title, desc, href, keywords }) => {
    entries.push({
      section,
      title,
      desc,
      href,
      text: [section, title, desc, keywords].filter(Boolean).join(' ')
    });
  };

  pages.forEach((page) => {
    pushEntry({
      section: '页面',
      title: page.label,
      desc: `进入${page.label}页面`,
      href: page.href,
      keywords: page.label
    });
  });

  officialPosts.forEach((post) => {
    pushEntry({
      section: '官方发布',
      title: post.title,
      desc: post.summary,
      href: 'official.html',
      keywords: [
        post.date,
        post.sourceName,
        post.category,
        post.content.join(' '),
        post.points.join(' '),
        post.media.map((item) => item.label).join(' ')
      ].join(' ')
    });
  });

  characters.forEach((character) => {
    pushEntry({
      section: '角色',
      title: character.name,
      desc: character.desc,
      href: 'gfjs.html',
      keywords: [
        character.title,
        character.tags.join(' '),
        character.quote,
        character.images.join(' '),
        character.videos.map((video) => video.label).join(' ')
      ].join(' ')
    });
  });

  conceptCards.forEach((concept) => {
    pushEntry({
      section: '概念',
      title: concept.title,
      desc: concept.tag,
      href: 'gfgn.html',
      keywords: [concept.src, concept.tag].join(' ')
    });
  });

  artists.forEach((artist) => {
    artist.entries.forEach((entry) => {
      pushEntry({
        section: '二创',
        title: entry.title,
        desc: `${entry.artist} · ${entry.character} · ${entry.type}`,
        href: 'wjec.html',
        keywords: [entry.artist, entry.character, entry.type, entry.src].join(' ')
      });
    });
  });

  fanVideos.forEach((video) => {
    pushEntry({
      section: '二创',
      title: video.title,
      desc: video.desc,
      href: 'wjec.html',
      keywords: [video.character, video.src, '视频', '玩家二创'].join(' ')
    });
  });

  jokes.forEach((joke, index) => {
    pushEntry({
      section: '笑话',
      title: joke.title,
      desc: joke.desc,
      href: 'qyxhhj.html',
      keywords: `社区切片 ${index + 1} ${joke.src}`
    });
  });

  return entries;
}

function htmlPage({ title, active, hero, body, extraClass = '' }) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link href="lib/font-awesome.css" rel="stylesheet">
  <link href="lib/app-theme.css" rel="stylesheet">
</head>
<body class="${extraClass}">
  ${nav(active)}
  <main class="app-shell">
    ${heroBlock(hero)}
    ${body}
  </main>
  ${footer()}
  <div class="lightbox" id="lightbox" aria-hidden="true">
    <button class="lightbox-close" data-lightbox-close aria-label="关闭">×</button>
    <button class="lightbox-action" data-favorite-current>收藏</button>
    <button class="lightbox-action lightbox-save" data-save-current>保存</button>
    <img id="lightboxImg" alt="预览">
    <p id="lightboxCaption"></p>
  </div>
  <script src="app-ui.js"></script>
  <script src="app-enhancements.js"></script>
</body>
</html>
`;
}

function nav(active) {
  return `<nav class="archive-nav">
    <div class="brand">
      <button class="brand-avatar" type="button" data-profile-open title="个人档案" aria-label="打开个人档案">
        <img src="logo/logo.png" alt="">
      </button>
      <a class="brand-copy" href="zy.html" aria-label="诸神终应知晓首页">
        <strong>诸神终应知晓</strong><small>玩家自制史记</small>
      </a>
    </div>
    <button class="nav-toggle" data-nav-toggle aria-label="打开导航">☰</button>
    <ul class="nav-menu" data-nav-menu>
      ${pages.map((page) => `<li><a class="${page.label === active ? 'active' : ''}" href="${page.href}">${page.label}</a></li>`).join('')}
    </ul>
  </nav>`;
}

function heroBlock(hero) {
  const searchFilters = hero.searchScope === 'global'
    ? `<div class="search-categories" data-search-categories>
        ${searchSections.map(([label, section], index) => `<button type="button" class="${index === 0 ? 'active' : ''}" data-search-section="${section}">${label}</button>`).join('')}
      </div>`
    : '';
  return `<section class="hero-panel">
    <div>
      <p class="eyebrow">${hero.eyebrow}</p>
      <h1>${hero.title}</h1>
      <p class="hero-desc">${hero.desc}</p>
    </div>
    <div class="hero-actions">
      <label class="search-box">
        <span>搜索</span>
        <input data-search="${hero.searchScope || 'global'}" type="search" placeholder="搜索角色、作者、资料">
      </label>
      ${searchFilters}
      <div class="search-results" data-search-results hidden></div>
      <a class="ghost-button" href="settings.html">版权与设置</a>
    </div>
  </section>`;
}

function footer() {
  return `<footer class="archive-footer">
    <p>本应用为玩家整理的非商业纪念资料集，不代表官方立场或官方消息。</p>
    <p>游戏官方内容及相关知识产权归上海魔王圆桌科技有限公司所有；玩家作品权利归各自创作者所有。</p>
  </footer>`;
}

function card({ title, desc, src, href, meta, kind, favoriteId }) {
  const openAttr = href ? `href="${href}"` : `href="${src}" data-lightbox-src="${src}"`;
  const favorite = favoriteId ? `<button class="fav-button" data-favorite="${favoriteId}" aria-label="收藏${title}">收藏</button>` : '';
  return `<article class="archive-card" data-search-text="${escapeAttr([title, desc, meta, kind].join(' '))}" data-kind="${kind || ''}">
    <a ${openAttr}>
      <img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" data-src="${src}" alt="${title}" loading="lazy" decoding="async">
      <span class="card-kind">${kind || '档案'}</span>
    </a>
    <div class="card-body">
      <p class="card-meta">${meta || ''}</p>
      <h3>${title}</h3>
      <p>${desc}</p>
      ${favorite}
    </div>
  </article>`;
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function homePage() {
  const body = `<section class="stats-grid">
    <div><strong>${characters.length}</strong><span>角色档案</span></div>
    <div><strong>${conceptCards.length}</strong><span>概念资料</span></div>
    <div><strong>${artists.reduce((sum, item) => sum + item.files.length, 0)}</strong><span>二创作品</span></div>
    <div><strong>${officialPosts.length}</strong><span>官方发布</span></div>
  </section>
  <section class="section-head">
    <p class="eyebrow">Archive Entrance</p>
    <h2>进入汇流地档案馆</h2>
  </section>
  <section class="feature-grid">
    ${card({ title: '官方角色', desc: '角色身份、设定、图集与视频资料。', src: 'zy/诸神终应知晓角色设定.jpg', href: 'gfjs.html', meta: '角色档案', kind: '官方' })}
    ${card({ title: '官方概念', desc: '宣传物料、世界观与早期概念图。', src: 'zy/诸神终应知晓概念图.jpg', href: 'gfgn.html', meta: '概念图鉴', kind: '官方' })}
    ${card({ title: '官方发布', desc: '整理 TapTap 官方动态正文，不收录评论区内容。', src: 'zy/诸神终应知晓概念图.jpg', href: 'official.html', meta: '官方动态', kind: '公告' })}
    ${card({ title: '玩家二创', desc: '按作者和角色整理的玩家创作。', src: 'zy/玩家二创.jpg', href: 'wjec.html', meta: '社群共创', kind: '二创' })}
    ${card({ title: '群友笑话', desc: '留住社区里的轻松片段。', src: 'zy/群友笑话合集.jpg', href: 'qyxhhj.html', meta: '社区记忆', kind: '笑话' })}
  </section>
  <section class="split-panel">
    <div>
      <p class="eyebrow">My Archive</p>
      <h2>我的档案</h2>
      <p>收藏、最近浏览与免责声明偏好仅保存在当前设备。你可以把常看的角色、概念图和二创作品留在这里，方便回溯。</p>
      <button class="wide-button" type="button" data-profile-open>编辑个人档案</button>
    </div>
    <div class="personal-archive-panel">
      <div>
        <div class="mini-title">
          <h3>收藏夹</h3>
          <span>默认分组</span>
        </div>
        <div class="favorite-groups" data-favorite-groups></div>
        <div class="mini-list" data-favorite-list></div>
      </div>
      <div>
        <div class="mini-title">
          <h3>最近浏览</h3>
          <span>设置页可关闭记录</span>
        </div>
        <div class="mini-list" data-recent-list></div>
      </div>
    </div>
  </section>`;
  return htmlPage({
    title: '诸神终应知晓 · 玩家自制史记',
    active: '首页',
    hero: {
      eyebrow: 'Abyss Knights Archive',
      title: '诸神终应知晓<br>玩家自制史记',
      desc: '以档案馆的形式，整理官方物料、角色信息、玩家二创和社群记忆。',
      searchScope: 'global'
    },
    body
  });
}

function renderOfficialContent(post) {
  return `<div class="official-content">
    <p class="official-label">帖子正文档案</p>
    ${post.content.map((line) => `<p>${line}</p>`).join('')}
  </div>`;
}

function nativeVideoHref(src, title) {
  return `zhushen-video://play?src=${encodeURIComponent(src)}&title=${encodeURIComponent(title)}`;
}

function renderOfficialMedia(post) {
  if (!post.media.length) {
    return '';
  }
  const videos = post.media
    .filter((item) => item.type === 'video')
    .map((item) => `<article class="official-video">
      <video controls preload="none" playsinline webkit-playsinline poster="${item.poster}" data-lazy-video>
        <source data-src="${item.src}" type="video/mp4">
      </video>
      <a class="native-video-button" href="${nativeVideoHref(item.src, `${post.title} · ${item.label}`)}">应用内播放</a>
      <p>${item.label}</p>
    </article>`)
    .join('');
  const gallery = post.media
    .filter((item) => item.type !== 'video')
    .map((item) => `<a class="official-media-card" href="${item.src}" data-lightbox-src="${item.src}" data-favorite-id="official-media:${item.src}">
      <img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" data-src="${item.src}" alt="${item.label}" loading="lazy" decoding="async">
      <span>${item.label}</span>
    </a>`)
    .join('');
  return `<div class="official-media">
    ${videos ? `<div class="official-video-grid">${videos}</div>` : ''}
    ${gallery ? `<div class="official-gallery">${gallery}</div>` : ''}
  </div>`;
}

function officialPostCard(post, index) {
  return `<article class="official-post" data-search-text="${escapeAttr([
    post.title,
    post.date,
    post.sourceName,
    post.category,
    post.summary,
    post.content.join(' '),
    post.points.join(' '),
    post.media.map((item) => item.label).join(' ')
  ].join(' '))}" data-kind="${post.category}">
    <div class="official-index">
      <span>${post.date}</span>
      <small>#${String(index + 1).padStart(2, '0')}</small>
    </div>
    <div class="official-body">
      <p class="card-meta">${post.date} · ${post.sourceName} · ${post.category}</p>
      <h2>${post.title}</h2>
      <p>${post.summary}</p>
      <blockquote>${post.quote}</blockquote>
      ${renderOfficialContent(post)}
      <ul>
        ${post.points.map((point) => `<li>${point}</li>`).join('')}
      </ul>
${renderOfficialMedia(post)}
      <div class="official-actions">
        <span class="official-source">${post.sourceLabel || '来源：TapTap 官方动态，已整理为应用内档案'}</span>
        <button class="fav-button" data-favorite="official:${post.id}">收藏</button>
      </div>
    </div>
  </article>`;
}

function officialPage() {
  const posts = officialPostsByDate();
  const categories = ['全部', ...Array.from(new Set(posts.map((post) => post.category)))];
  const body = `<section class="scroll-panel">
    <p class="eyebrow">Official Archive</p>
    <h2>官方动态卡片</h2>
    <p>收录 TapTap 官方动态的正文整理、官方图片、GIF 与可用视频；评论区、用户回复和互动楼层不进入档案。</p>
  </section>
  <section class="filter-row" data-filter-group>
    ${categories.map((name) => `<button data-filter="${name}">${name}</button>`).join('')}
  </section>
  <section class="official-timeline">
    ${posts.map((post, index) => officialPostCard(post, index)).join('')}
  </section>`;
  return htmlPage({
    title: '官方发布 · 诸神终应知晓',
    active: '官方发布',
    hero: {
      eyebrow: 'Official Posts',
      title: '官方发布档案',
      desc: '从 TapTap 官方动态正文中整理 PV、实机、线下活动、答疑与研发冻结公告。',
      searchScope: 'page'
    },
    body
  });
}

function charactersPage() {
  const body = `<section class="section-head">
    <p class="eyebrow">Character Files</p>
    <h2>登场角色</h2>
  </section>
  <section class="character-grid">
    ${characters.map((item) => card({
      title: item.name,
      desc: item.desc,
      src: item.cover,
      meta: item.title,
      kind: item.tags.join(' / '),
      favoriteId: `character:${item.key}`
    })).join('')}
  </section>
  <section class="detail-stack">
    ${characters.map((item) => characterDetail(item)).join('')}
  </section>`;
  return htmlPage({
    title: '角色档案 · 诸神终应知晓',
    active: '角色',
    hero: {
      eyebrow: 'Character Archive',
      title: '角色档案',
      desc: '用档案卡区分已确认资料、待补充信息和视频图集。',
      searchScope: 'page'
    },
    body
  });
}

function characterDetail(item) {
  const media = item.images.map((src) => card({
    title: `${item.name}资料图`,
    desc: '官方角色图像资料',
    src,
    meta: src.toLowerCase().endsWith('.gif') ? '角色动态图' : '角色图集',
    kind: src.toLowerCase().endsWith('.gif') ? '动图' : '官方图像',
    favoriteId: `image:${src}`
  })).join('');
  const videos = item.videos.map((video) => `<article class="video-card" data-search-text="${escapeAttr(item.name + ' ' + video.label)}">
    <video controls preload="none" playsinline webkit-playsinline data-lazy-video>
      <source data-src="${video.src}" type="video/mp4">
    </video>
    <a class="native-video-button" href="${nativeVideoHref(video.src, `${item.name} · ${video.label}`)}">应用内播放</a>
    <p>${video.label}</p>
  </article>`).join('');
  const videoBlock = videos ? `<div class="video-grid">${videos}</div>` : '';
  return `<article class="dossier" data-search-text="${escapeAttr(item.name + ' ' + item.title + ' ' + item.desc)}">
    <div>
      <p class="eyebrow">${item.title}</p>
      <h2>${item.name}</h2>
      <p>${item.desc}</p>
      <blockquote>${item.quote}</blockquote>
    </div>
    <div class="media-grid">${media}</div>
${videoBlock}
  </article>`;
}

function conceptsPage() {
  const body = `<section class="filter-row" data-filter-group>
    ${['全部', '官方宣传物料', '官方资料', '角色定位', '世界观'].map((name) => `<button data-filter="${name}">${name}</button>`).join('')}
  </section>
  <section class="masonry-grid">
    ${conceptCards.map((item) => card({
      title: item.title,
      desc: '来自官方公开物料或早期世界观资料。',
      src: item.src,
      meta: item.tag,
      kind: item.tag,
      favoriteId: `concept:${item.src}`
    })).join('')}
  </section>
  <section class="scroll-panel">
    <p class="eyebrow">Worldview</p>
    <h2>汇流地记录</h2>
    <p>汇流地是生死之河的彼方，一切生命形式的末路。时间、空间、历史与神话交织重叠，循环因未知灾祸陷入停滞。</p>
    <p>阿塔尔成为代号「送葬人」的猎人，开始履行契约——狩猎神明。</p>
  </section>`;
  return htmlPage({
    title: '官方概念 · 诸神终应知晓',
    active: '概念',
    hero: {
      eyebrow: 'Concept Archive',
      title: '官方概念与世界观',
      desc: '将宣传物料、角色定位和早期世界观拆成可筛选的档案。',
      searchScope: 'page'
    },
    body
  });
}

function fanArtPage() {
  const entries = artists.flatMap((artist) => artist.entries);
  const filters = ['全部', '阿塔尔', '德赫奴', '拉夏', '梅赛德斯', '夕岚', '综合', '动图'];
  const body = `<section class="filter-row" data-filter-group>
    ${filters.map((name) => `<button data-filter="${name}">${name}</button>`).join('')}
  </section>
  <section class="section-head compact">
    <p class="eyebrow">Fan Video</p>
    <h2>二创视频</h2>
  </section>
  <section class="video-grid fan-video-grid">
    ${fanVideos.map((video) => `<article class="video-card" data-search-text="${escapeAttr([video.title, video.desc, video.character, '二创 视频'].join(' '))}" data-kind="${video.character}">
      <video controls preload="none" playsinline webkit-playsinline data-lazy-video>
        <source data-src="${video.src}" type="video/mp4">
      </video>
      <a class="native-video-button" href="${nativeVideoHref(video.src, video.title)}">应用内播放</a>
      <p>${video.title}</p>
      <span>${video.desc}</span>
    </article>`).join('')}
  </section>
  <section class="artist-summary">
    ${artists.map((artist) => `<a href="#artist-${slug(artist.name)}">${artist.name}<span>${artist.files.length}</span></a>`).join('')}
  </section>
  ${artists.map((artist) => `<section class="artist-block" id="artist-${slug(artist.name)}">
    <div class="section-head compact">
      <p class="eyebrow">Artist</p>
      <h2>${artist.name}</h2>
    </div>
    <div class="masonry-grid">
      ${artist.entries.map((item) => card({
        title: item.title,
        desc: `${item.artist} · ${item.character}`,
        src: item.src,
        meta: item.type,
        kind: item.type === '动图' ? '动图' : item.character,
        favoriteId: `fanart:${item.src}`
      })).join('')}
    </div>
  </section>`).join('')}
  <script type="application/json" id="fanart-data">${JSON.stringify(entries)}</script>`;
  return htmlPage({
    title: '玩家二创 · 诸神终应知晓',
    active: '二创',
    hero: {
      eyebrow: 'Community Gallery',
      title: '玩家二创作品',
      desc: '按作者、角色和文件类型快速筛选，保留创作者归属。',
      searchScope: 'page'
    },
    body
  });
}

function jokesPage() {
  const body = `<section class="masonry-grid">
    ${jokes.map((item, index) => card({
      title: item.title,
      desc: item.desc,
      src: item.src,
      meta: `社区切片 ${index + 1}/${jokes.length}`,
      kind: '笑话',
      favoriteId: `joke:${item.src}`
    })).join('')}
  </section>`;
  return htmlPage({
    title: '群友笑话合集 · 诸神终应知晓',
    active: '笑话',
    hero: {
      eyebrow: 'Community Memory',
      title: '群友笑话合集',
      desc: '以留言板和档案卡的形式，保存社群里轻松又有记忆点的片段。',
      searchScope: 'page'
    },
    body
  });
}

function settingsPage() {
  const body = `<section class="settings-grid">
    <article class="settings-card">
      <p class="eyebrow">About</p>
      <h2>关于本应用</h2>
      <dl>
        <dt>版本</dt><dd>玩家自制史记 v${packageJson.version}</dd>
        <dt>内容来源</dt><dd>官方公开物料、玩家社群整理与玩家二创授权内容</dd>
        <dt>本地数据</dt><dd>收藏、最近浏览和免责声明偏好仅保存在当前设备</dd>
        <dt>联系作者</dt><dd>china19210703@163.com</dd>
      </dl>
    </article>
    <article class="settings-card">
      <p class="eyebrow">Copyright</p>
      <h2>版权与声明</h2>
      <p>《诸神终应知晓》游戏官方内容、官方美术、官方概念设定、官方宣传物料及相关知识产权归上海魔王圆桌科技有限公司所有。</p>
      <p>本应用为玩家社群自发整理的非商业纪念资料集，不代表上海魔王圆桌科技有限公司或任何官方立场，也不构成官方消息发布渠道。</p>
      <p>玩家二创作品的权利归各自创作者所有；收录目的仅为纪念、学习与交流。若权利人希望补充署名、修正信息或移除内容，请联系整理者处理。</p>
    </article>
    <article class="settings-card">
      <p class="eyebrow">Display</p>
      <h2>屏幕方向</h2>
      <p>可以固定竖屏、固定横屏，也可以开启横竖切换，让应用跟随设备方向变化。</p>
      <div class="orientation-options" data-orientation-options>
        <button class="wide-button" data-orientation-option="portrait">竖屏</button>
        <button class="wide-button" data-orientation-option="landscape">横屏</button>
        <button class="wide-button" data-orientation-option="auto">横竖切换</button>
      </div>
      <p class="settings-note" data-orientation-status>当前方向：读取中</p>
    </article>
    <article class="settings-card">
      <p class="eyebrow">Opening Video</p>
      <h2>启动视频</h2>
      <p>默认每次启动随机播放一个应用内视频；也可以固定为指定视频。系统启动页本身不能播放视频，视频会在应用启动层开始播放。</p>
      <div class="video-options" data-splash-video-options>
        ${splashVideos.map(([value, label]) => `<button class="wide-button" data-splash-video-option="${value}">${label}</button>`).join('')}
      </div>
      <p class="settings-note" data-splash-video-status>当前视频：读取中</p>
      <div class="desktop-combo">
        <span>进入方式</span>
        <div class="segmented-actions">
          <button data-splash-entry-mode="skippable">可点击跳过</button>
          <button data-splash-entry-mode="complete">播放完进入</button>
        </div>
      </div>
      <p class="settings-note" data-splash-entry-status>进入方式：读取中</p>
    </article>
    <article class="settings-card">
      <p class="eyebrow">Background Music</p>
      <h2>背景音乐</h2>
      <p>进入档案馆后循环播放内置音乐；可以关闭，也可以调整音量。应用退到后台时会自动暂停，回到前台后继续。</p>
      <div class="audio-options" data-background-music-options>
        <div class="segmented-actions audio-toggle-row">
          <button data-background-music-set="true">开启背景音乐</button>
          <button data-background-music-set="false">关闭背景音乐</button>
        </div>
        <label class="range-control">
          <span>音量</span>
          <input data-background-music-volume type="range" min="0" max="100" step="5">
        </label>
      </div>
      <button class="wide-button" type="button" data-music-detail-toggle>查看曲名与歌词</button>
      <div class="music-detail-panel" data-music-detail hidden>
        <p><strong>Mass No.19 in D Minor, K.626 Requiem: Introitus: Requiem Aeternam</strong></p>
        <ol data-music-lyrics>
          <li data-lyric-time="0">Requiem aeternam dona eis, Domine.</li>
          <li data-lyric-time="18">Et lux perpetua luceat eis.</li>
          <li data-lyric-time="36">Te decet hymnus, Deus, in Sion.</li>
          <li data-lyric-time="56">Exaudi orationem meam.</li>
          <li data-lyric-time="76">Ad te omnis caro veniet.</li>
        </ol>
      </div>
      <p class="settings-note" data-background-music-status>当前音乐：读取中</p>
    </article>
    <article class="settings-card">
      <p class="eyebrow">Display & History</p>
      <h2>显示与记录</h2>
      <div class="desktop-combo">
        <span>低动态模式</span>
        <div class="segmented-actions">
          <button data-reduced-motion-set="true">开启</button>
          <button data-reduced-motion-set="false">关闭</button>
        </div>
      </div>
      <p class="settings-note">开启后会减少动态背景、淡入动画和部分自动播放视觉效果。</p>
      <div class="desktop-combo">
        <span>最近浏览</span>
        <div class="segmented-actions">
          <button data-recent-history-set="true">记录</button>
          <button data-recent-history-set="false">不记录</button>
        </div>
      </div>
      <p class="settings-note">用于“我的档案”里快速回到刚看过的页面；关闭后不再写入新记录。</p>
      <p class="settings-note" data-display-history-status>显示与记录：读取中</p>
    </article>
    <article class="settings-card desktop-settings-card" data-desktop-settings hidden>
      <p class="eyebrow">Desktop Client</p>
      <h2>桌面客户端</h2>
      <p>这些选项仅在 Windows 桌面客户端内生效；网页和安卓版本不会显示。</p>
      <div class="desktop-combo">
        <span>开机自启动</span>
        <div class="segmented-actions">
          <button data-desktop-startup-set="true">开启</button>
          <button data-desktop-startup-set="false">关闭</button>
        </div>
      </div>
      <div class="desktop-options">
        <button class="wide-button" data-desktop-always-on-top>窗口置顶</button>
        <button class="wide-button" data-desktop-fullscreen>全屏显示</button>
      </div>
      <div class="desktop-options">
        <button class="wide-button" data-desktop-export>导出本地数据</button>
        <button class="wide-button" data-desktop-import>导入本地数据</button>
        <button class="wide-button danger-button" data-desktop-uninstall>卸载桌面客户端</button>
      </div>
      <div class="desktop-combo">
        <span>首页背景</span>
        <div class="segmented-actions">
          <button data-desktop-background-mode="dynamic">动态 PV</button>
          <button data-desktop-background-mode="static">静态封面</button>
        </div>
      </div>
      <p class="settings-note" data-desktop-background-status>背景模式：读取中</p>
      <p class="settings-note">快捷键：F11 全屏/退出全屏，Esc 退出全屏，Ctrl+F 搜索，Ctrl+加号/减号缩放，Ctrl+0 恢复缩放，Alt+左/右前进后退。</p>
      <p class="settings-note" data-desktop-status>桌面功能：读取中</p>
    </article>
    <article class="settings-card">
      <p class="eyebrow">Actions</p>
      <h2>本地操作</h2>
      <button class="wide-button" data-clear-favorites>清空收藏</button>
      <button class="wide-button" data-clear-disclaimer>恢复首次声明提示</button>
      <a class="wide-button" href="zy.html">返回档案馆首页</a>
    </article>
  </section>`;
  return htmlPage({
    title: '设置 · 诸神终应知晓',
    active: '设置',
    hero: {
      eyebrow: 'Settings',
      title: '设置与版权说明',
      desc: '查看版本、版权归属、玩家共创声明和本地数据说明。',
      searchScope: 'page'
    },
    body
  });
}

function slug(value) {
  return Buffer.from(value).toString('hex');
}

writeFileSync(join(assetsRoot, 'zy.html'), homePage());
writeFileSync(join(assetsRoot, 'official.html'), officialPage());
writeFileSync(join(assetsRoot, 'gfjs.html'), charactersPage());
writeFileSync(join(assetsRoot, 'gfgn.html'), conceptsPage());
writeFileSync(join(assetsRoot, 'wjec.html'), fanArtPage());
writeFileSync(join(assetsRoot, 'qyxhhj.html'), jokesPage());
writeFileSync(join(assetsRoot, 'settings.html'), settingsPage());

writeFileSync(join(assetsRoot, 'lib', 'app-theme.css'), `:root {
  --bg: #09090d;
  --panel: rgba(22, 22, 30, .78);
  --panel-strong: rgba(28, 25, 30, .94);
  --gold: #d4a754;
  --gold-soft: #f0d78c;
  --text: #eee4d2;
  --muted: rgba(238, 228, 210, .62);
  --line: rgba(212, 167, 84, .18);
  --danger: #8b2e28;
}
* { box-sizing: border-box; }
html {
  width: 100%;
  overflow-x: hidden;
  background: var(--bg);
  color: var(--text);
  scrollbar-color: rgba(240, 215, 140, .36) rgba(9, 9, 13, .88);
  scrollbar-width: thin;
}
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: rgba(9, 9, 13, .88); }
::-webkit-scrollbar-thumb {
  border: 2px solid rgba(9, 9, 13, .88);
  border-radius: 999px;
  background: rgba(240, 215, 140, .36);
}
::-webkit-scrollbar-thumb:hover { background: rgba(240, 215, 140, .54); }
body {
  margin: 0;
  width: 100%;
  overflow-x: hidden;
  min-height: 100vh;
  font-family: "PingFang SC", "Microsoft YaHei", Arial, sans-serif;
  background: linear-gradient(180deg, #0d0d10 0%, #171416 52%, #09090d 100%);
  letter-spacing: 0;
}
body::before {
  content: none;
}
a { color: inherit; text-decoration: none; }
img { display: block; max-width: 100%; }
button, input { font: inherit; }
.archive-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px clamp(16px, 4vw, 42px);
  background: rgba(9, 9, 13, .82);
  border-bottom: 1px solid var(--line);
  backdrop-filter: blur(18px);
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  max-width: calc(100% - 56px);
}
.brand-avatar { width: 42px; height: 42px; flex: 0 0 auto; overflow: hidden; padding: 0; border: 1px solid var(--line); border-radius: 8px; background: transparent; cursor: pointer; }
.brand-avatar img { width: 100%; height: 100%; object-fit: cover; }
.brand-copy { min-width: 0; }
.brand-copy strong { display: block; color: var(--gold-soft); font-size: 16px; }
.brand-copy small { display: block; color: var(--muted); font-size: 12px; margin-top: 2px; }
.nav-menu { display: flex; align-items: center; gap: 8px; padding: 0; margin: 0; list-style: none; }
.nav-menu a {
  display: block;
  padding: 9px 12px;
  border: 1px solid transparent;
  border-radius: 999px;
  color: var(--muted);
  font-size: 14px;
}
.nav-menu a.active, .nav-menu a:hover {
  color: var(--gold-soft);
  border-color: var(--line);
  background: rgba(212, 167, 84, .08);
}
.nav-toggle { display: none; flex: 0 0 auto; }
.app-shell { width: min(1180px, calc(100% - 28px)); margin: 0 auto; padding: 28px 0 96px; }
.hero-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 380px);
  gap: 28px;
  align-items: end;
  padding: clamp(26px, 6vw, 64px);
  border: 1px solid var(--line);
  border-radius: 30px;
  background:
    linear-gradient(135deg, rgba(212, 167, 84, .1), transparent 36%),
    rgba(16, 15, 22, .82);
  box-shadow: 0 28px 90px rgba(0, 0, 0, .36);
}
.eyebrow {
  margin: 0 0 10px;
  color: var(--gold);
  font-size: 12px;
  letter-spacing: .18em;
  text-transform: uppercase;
}
h1, h2, h3, p { margin-top: 0; }
h1, h2, h3, p, a, span, dd, dt, blockquote {
  overflow-wrap: anywhere;
  word-break: break-word;
}
h1 { margin-bottom: 16px; font-size: clamp(32px, 8vw, 68px); line-height: 1.04; }
h2 { font-size: clamp(24px, 5vw, 38px); }
.hero-desc, .archive-card p, .settings-card p, .scroll-panel p, .split-panel p {
  color: var(--muted);
  line-height: 1.8;
}
.hero-actions { display: grid; gap: 12px; }
.hero-panel > *, .split-panel > *, .settings-card > *, .archive-card > * {
  min-width: 0;
}
.search-box {
  display: grid;
  gap: 8px;
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: rgba(255,255,255,.035);
}
.search-box span { color: var(--gold); font-size: 12px; letter-spacing: .12em; }
.search-box input {
  width: 100%;
  color: var(--text);
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 16px;
}
.search-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.search-categories button {
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 8px 12px;
  color: var(--muted);
  background: rgba(255,255,255,.035);
}
.search-categories button.active {
  color: #100b04;
  background: var(--gold-soft);
}
.search-results {
  display: grid;
  gap: 10px;
  max-height: 320px;
  overflow: auto;
  padding: 10px;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: rgba(8,8,12,.78);
  box-shadow: 0 16px 44px rgba(0,0,0,.32);
}
.search-results[hidden] { display: none; }
.search-result {
  display: grid;
  gap: 4px;
  padding: 12px;
  border: 1px solid rgba(212, 167, 84, .14);
  border-radius: 16px;
  background: rgba(255,255,255,.035);
}
.search-result strong { color: var(--gold-soft); }
.search-result span {
  color: var(--gold);
  font-size: 12px;
  letter-spacing: .14em;
  text-transform: uppercase;
}
.search-result p {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.55;
}
.search-empty {
  margin: 0;
  padding: 12px;
  color: var(--muted);
}
.ghost-button, .wide-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-height: 46px;
  padding: 0 18px;
  border: 1px solid var(--line);
  border-radius: 16px;
  color: var(--gold-soft);
  background: rgba(212, 167, 84, .08);
}
.danger-button {
  border-color: rgba(139, 46, 40, .58);
  color: #f3b7ae;
  background: rgba(139, 46, 40, .14);
}
.danger-button:hover {
  color: #fff6ef;
  background: rgba(139, 46, 40, .48);
}
.stats-grid, .feature-grid, .character-grid, .masonry-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-top: 22px;
}
.stats-grid div, .archive-card, .settings-card, .scroll-panel, .split-panel, .dossier {
  border: 1px solid var(--line);
  border-radius: 22px;
  background: var(--panel);
  box-shadow: 0 18px 50px rgba(0,0,0,.25);
  overflow: hidden;
}
.stats-grid div { padding: 22px; }
.stats-grid strong { display: block; color: var(--gold-soft); font-size: 32px; }
.stats-grid span { color: var(--muted); }
.section-head { margin: 46px 0 14px; }
.section-head.compact { margin: 30px 0 14px; }
.archive-card { position: relative; }
.archive-card > a { position: relative; display: block; overflow: hidden; }
.archive-card img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; transition: transform .35s ease; }
.archive-card img[data-src], .official-media-card img[data-src] { background: #17171c; }
.archive-card:hover img { transform: scale(1.045); }
.card-kind {
  position: absolute;
  left: 12px;
  top: 12px;
  padding: 5px 9px;
  border-radius: 999px;
  color: #15110a;
  background: var(--gold-soft);
  font-size: 12px;
}
.card-body { padding: 16px; }
.card-meta { margin-bottom: 8px; color: var(--gold)!important; font-size: 12px; }
.fav-button, .lightbox-action {
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 8px 12px;
  color: var(--gold-soft);
  background: rgba(212, 167, 84, .08);
}
.fav-button.active, .lightbox-action.active { background: var(--gold); color: #100b04; }
.split-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 26px;
  margin-top: 28px;
}
.mini-list { display: grid; gap: 8px; }
.mini-list a { color: var(--muted); border-bottom: 1px solid rgba(255,255,255,.06); padding-bottom: 8px; }
.personal-archive-panel {
  display: grid;
  gap: 22px;
}
.mini-title {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.mini-title h3 {
  margin: 0;
  color: var(--gold-soft);
  font-size: 18px;
}
.mini-title span {
  color: var(--muted);
  font-size: 12px;
}
.favorite-groups {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.favorite-groups button {
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 7px 10px;
  color: var(--muted);
  background: rgba(255,255,255,.035);
  font-size: 12px;
}
.favorite-groups button.active {
  color: #100b04;
  background: var(--gold-soft);
}
.dossier { padding: clamp(20px, 4vw, 34px); margin-top: 24px; }
.dossier blockquote {
  margin: 18px 0 0;
  padding-left: 16px;
  color: var(--gold-soft);
  border-left: 2px solid var(--gold);
}
.media-grid, .video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  margin-top: 18px;
}
.video-card { position: relative; padding: 12px; border: 1px solid var(--line); border-radius: 18px; background: rgba(0,0,0,.22); }
.video-card video { width: 100%; border-radius: 14px; background: #000; }
.official-timeline {
  position: relative;
  display: grid;
  gap: 26px;
  margin-top: 24px;
}
.official-timeline::before {
  content: "";
  position: absolute;
  top: 12px;
  bottom: 12px;
  left: 105px;
  width: 1px;
  background: linear-gradient(180deg, transparent, rgba(240, 215, 140, .48), transparent);
}
.official-post {
  position: relative;
  display: grid;
  grid-template-columns: 128px 1fr;
  gap: 28px;
  background: transparent;
}
.official-index {
  position: relative;
  display: grid;
  align-content: start;
  justify-items: end;
  gap: 7px;
  padding-top: 22px;
  color: var(--gold-soft);
  font-family: Georgia, serif;
}
.official-index::after {
  content: "";
  position: absolute;
  top: 29px;
  right: -39px;
  width: 13px;
  height: 13px;
  border: 2px solid var(--gold-soft);
  border-radius: 50%;
  background: #111116;
  box-shadow: 0 0 0 7px rgba(240, 215, 140, .08);
}
.official-index span {
  font-size: 15px;
  letter-spacing: .08em;
  white-space: nowrap;
}
.official-index small {
  color: var(--muted);
  font-size: 12px;
  letter-spacing: .16em;
}
.official-body {
  min-width: 0;
  padding: 24px;
  border: 1px solid var(--line);
  border-radius: 26px;
  background:
    linear-gradient(135deg, rgba(212, 167, 84, .1), transparent 42%),
    var(--panel);
  box-shadow: 0 18px 50px rgba(0,0,0,.25);
}
.official-body h2 {
  margin: 8px 0 12px;
}
.official-body blockquote {
  margin: 16px 0;
  padding: 12px 14px;
  border-left: 3px solid var(--gold);
  color: var(--gold-soft);
  background: rgba(212, 167, 84, .08);
}
.official-content {
  display: grid;
  gap: 8px;
  margin-top: 16px;
  padding: 16px;
  border: 1px solid rgba(212, 167, 84, .2);
  border-radius: 18px;
  background: rgba(0,0,0,.18);
}
.official-content p {
  margin: 0;
}
.official-label {
  color: var(--gold);
  font-size: 12px;
  letter-spacing: .16em;
  text-transform: uppercase;
}
.official-body ul {
  display: grid;
  gap: 8px;
  margin: 16px 0 0 18px;
  color: var(--muted);
  line-height: 1.7;
}
.official-media {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}
.official-video-grid {
  display: grid;
  gap: 12px;
}
.official-video {
  position: relative;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: rgba(0,0,0,.24);
}
.official-video video {
  display: block;
  width: 100%;
  max-height: 62vh;
  border-radius: 16px;
  background: #000;
}
.official-video p {
  margin-top: 10px;
  color: var(--gold-soft);
}
.native-video-button {
  position: absolute;
  top: 22px;
  right: 22px;
  z-index: 3;
  border: 1px solid rgba(246, 217, 139, .45);
  border-radius: 999px;
  padding: 8px 14px;
  color: #100b04;
  background: rgba(246, 217, 139, .92);
  font-size: 13px;
  letter-spacing: .08em;
  box-shadow: 0 10px 26px rgba(0,0,0,.32);
}
.video-card .native-video-button {
  top: 20px;
  right: 20px;
}
.official-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}
.official-media-card {
  position: relative;
  min-height: 132px;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: rgba(255,255,255,.035);
}
.official-media-card img {
  width: 100%;
  height: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  transition: transform .35s ease;
}
.official-media-card:hover img {
  transform: scale(1.045);
}
.official-media-card span {
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 8px;
  padding: 6px 8px;
  border-radius: 999px;
  color: var(--text);
  background: rgba(0,0,0,.64);
  font-size: 12px;
}
.official-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 18px;
}
.official-source {
  color: var(--muted);
  font-size: 13px;
}
.filter-row { display: flex; flex-wrap: wrap; gap: 10px; margin: 24px 0; }
.filter-row button {
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 10px 14px;
  color: var(--muted);
  background: rgba(255,255,255,.035);
}
.filter-row button.active { color: #100b04; background: var(--gold-soft); }
.masonry-grid { grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); }
.artist-summary { display: flex; flex-wrap: wrap; gap: 10px; margin: 24px 0; }
.artist-summary a {
  padding: 9px 12px;
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--muted);
}
.artist-summary span { margin-left: 8px; color: var(--gold); }
.scroll-panel { padding: 26px; margin-top: 28px; }
.settings-grid { display: grid; grid-template-columns: 1fr; gap: 18px; margin-top: 24px; }
.settings-card { padding: 24px; }
.profile-workspace {
  display: grid;
  grid-template-columns: minmax(230px, .72fr) minmax(0, 1.5fr);
  gap: 18px;
  margin-top: 24px;
}
.profile-identity, .profile-editor {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: rgba(16, 16, 21, .9);
}
.profile-identity {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 32px 24px;
  text-align: center;
}
.profile-avatar-button {
  width: 116px;
  height: 116px;
  overflow: hidden;
  border: 1px solid rgba(240, 215, 140, .4);
  border-radius: 50%;
  color: #17110a;
  background: var(--gold-soft);
  font-size: 42px;
  cursor: pointer;
}
.profile-avatar-button img { width: 100%; height: 100%; object-fit: cover; }
.profile-identity strong { margin-top: 18px; color: var(--gold-soft); font-size: 22px; }
.profile-number { margin-top: 7px; color: var(--gold); font: 13px Consolas, monospace; }
.profile-identity p { margin: 18px 0 0; color: var(--muted); line-height: 1.7; }
.profile-editor { padding: 28px; }
.profile-section-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.profile-section-head h2 { margin-bottom: 8px; }
.profile-save-state { color: var(--muted); font-size: 12px; }
.profile-field { display: grid; gap: 8px; margin-top: 16px; color: var(--gold); font-size: 13px; }
.profile-field input, .profile-field textarea {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 12px 14px;
  outline: none;
  color: var(--text);
  background: rgba(255,255,255,.035);
  resize: vertical;
}
.profile-field input:focus, .profile-field textarea:focus { border-color: rgba(240,215,140,.58); }
.profile-actions { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 10px; margin-top: 22px; }
.profile-actions .wide-button { margin-top: 0; }
.profile-primary { color: #15110a; background: var(--gold-soft); font-weight: 700; }
.profile-cloud-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: 18px; padding-top: 18px; border-top: 1px solid var(--line); }
.profile-cloud-row p { margin: 5px 0 0; color: var(--muted); font-size: 13px; }
.profile-cloud-row button { min-height: 40px; border: 1px solid var(--line); border-radius: 6px; padding: 0 14px; color: var(--muted); background: transparent; }
.performance-page-hidden { display: none!important; }
.load-more-row { display: flex; justify-content: center; margin: 22px 0; }
.load-more-row button { min-width: 180px; min-height: 44px; border: 1px solid var(--line); border-radius: 6px; color: var(--gold-soft); background: rgba(212,167,84,.08); }
.settings-card dl { display: grid; grid-template-columns: 120px 1fr; gap: 12px; color: var(--muted); }
.settings-card dt { color: var(--gold); }
.settings-note { margin: 14px 0 0; font-size: 13px; }
.orientation-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}
.video-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-top: 14px;
}
.audio-options {
  display: grid;
  grid-template-columns: minmax(160px, 220px) 1fr;
  gap: 14px;
  align-items: center;
  margin-top: 14px;
}
.audio-toggle-row {
  grid-auto-columns: minmax(0, 1fr);
  min-width: 0;
}
.orientation-options .wide-button,
.video-options .wide-button,
.audio-options .wide-button {
  margin-top: 0;
}
.orientation-options .wide-button.active,
.video-options .wide-button.active,
.audio-options .wide-button.active {
  color: #100b04;
  background: var(--gold-soft);
}
.desktop-combo {
  display: grid;
  grid-template-columns: minmax(96px, 150px) 1fr;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding: 10px;
  border: 1px solid rgba(212, 167, 84, .16);
  border-radius: 16px;
  background: rgba(255,255,255,.026);
}
.desktop-combo > span {
  color: var(--gold);
  font-size: 13px;
  letter-spacing: .08em;
}
.segmented-actions {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 8px;
}
.segmented-actions button {
  min-height: 40px;
  border: 1px solid var(--line);
  border-radius: 12px;
  color: var(--gold-soft);
  background: rgba(212, 167, 84, .08);
}
.segmented-actions button.active,
.segmented-actions button:hover {
  color: #100b04;
  background: var(--gold-soft);
}
.range-control {
  display: grid;
  gap: 8px;
  color: var(--muted);
}
.range-control input {
  width: 100%;
  accent-color: var(--gold);
}
.music-detail-panel {
  margin-top: 12px;
  padding: 14px;
  border: 1px solid rgba(212, 167, 84, .16);
  border-radius: 16px;
  background: rgba(255,255,255,.026);
}
.music-detail-panel p {
  margin: 0 0 10px;
}
.music-detail-panel ol {
  display: grid;
  gap: 8px;
  margin: 0;
  padding-left: 22px;
  color: var(--muted);
}
.music-detail-panel li.active {
  color: var(--gold-soft);
  text-shadow: 0 0 16px rgba(240,215,140,.22);
}
.wide-button { width: 100%; margin-top: 10px; }
.archive-footer {
  width: min(1180px, calc(100% - 28px));
  margin: 0 auto;
  padding: 26px 0 110px;
  color: rgba(238, 228, 210, .45);
  font-size: 12px;
  line-height: 1.8;
  text-align: center;
  border-top: 1px solid var(--line);
}
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: none;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0;
  background: rgba(0,0,0,.96);
}
.lightbox.active { display: flex; }
.lightbox img {
  width: auto;
  height: auto;
  max-width: 100vw;
  max-height: 100vh;
  object-fit: contain;
  border-radius: 0;
  cursor: grab;
  touch-action: none;
  transform-origin: center center;
  transition: transform .16s ease;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}
.lightbox-close, .lightbox-action { position: fixed; top: 18px; }
.lightbox-close { right: 18px; width: 44px; height: 44px; border-radius: 50%; border: 1px solid var(--line); color: var(--text); background: rgba(0,0,0,.5); font-size: 28px; }
.lightbox-action { left: 18px; }
.lightbox-save { left: 104px; }
#lightboxCaption {
  position: fixed;
  right: 18px;
  bottom: 18px;
  left: 18px;
  margin: 0;
  color: var(--muted);
  text-align: center;
  text-shadow: 0 2px 8px rgba(0,0,0,.72);
}
html.lightbox-open, html.lightbox-open body { overflow: hidden; }
.is-hidden { display: none!important; }
@media (max-width: 820px) {
  .archive-nav { align-items: flex-start; }
  .nav-toggle { display: block; border: 1px solid var(--line); border-radius: 12px; color: var(--gold-soft); background: transparent; padding: 8px 10px; }
  .nav-menu { display: none; position: absolute; top: 66px; right: 14px; flex-direction: column; min-width: 180px; padding: 12px; border: 1px solid var(--line); border-radius: 18px; background: rgba(10,10,15,.96); }
  .nav-menu.show { display: flex; }
  .hero-panel, .split-panel { grid-template-columns: 1fr; }
  .profile-workspace { grid-template-columns: 1fr; }
  .profile-actions { grid-template-columns: 1fr; }
  .stats-grid, .feature-grid, .character-grid { grid-template-columns: 1fr 1fr; }
  .settings-card dl { grid-template-columns: 1fr; }
  .desktop-combo { grid-template-columns: 1fr; }
  .segmented-actions { grid-auto-flow: row; }
  .orientation-options, .video-options, .audio-options { grid-template-columns: 1fr; }
  .official-timeline::before { left: 18px; }
  .official-post {
    grid-template-columns: 1fr;
    padding-left: 38px;
  }
  .official-index {
    justify-items: start;
    min-height: 0;
    padding-top: 0;
  }
  .official-index::after {
    top: 5px;
    left: -26px;
    right: auto;
  }
  .official-body { padding: 22px; }
}
@media (max-width: 520px) {
  .app-shell { width: calc(100% - 24px); padding-top: 24px; }
  .hero-panel { padding: 26px 22px; border-radius: 24px; overflow: hidden; }
  h1 { font-size: clamp(30px, 9vw, 36px); }
  h2 { font-size: clamp(26px, 8vw, 32px); }
  h1, h2, .settings-card dd {
    line-break: anywhere;
    word-break: break-all;
  }
  .stats-grid, .feature-grid, .character-grid, .masonry-grid { grid-template-columns: 1fr; }
}
`);

writeFileSync(join(assetsRoot, 'app-ui.js'), `(function () {
  'use strict';

  var favoritesKey = 'zhushen:favorites:v1';
  var recentKey = 'zhushen:recent:v1';
  var favoriteGroupKey = 'zhushen:favorite-group:v1';
  var searchSections = ${JSON.stringify(searchSections)};
  var favoriteGroups = ${JSON.stringify(favoriteGroups)};
  var globalSearchIndex = ${JSON.stringify(buildSearchIndex())};

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

  function syncFavorites() {
    var list = readList(favoritesKey);
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
        return '<a href="' + item.href + '">' + item.title + '</a>';
      }).join('');
    });
  }

  function installFavorites() {
    document.addEventListener('click', function (event) {
      var button = event.target.closest('[data-favorite]');
      if (!button) {
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
    var splashVideoLabels = ${JSON.stringify(Object.fromEntries(splashVideos))};
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
`);

console.log('UI 页面已生成。');
