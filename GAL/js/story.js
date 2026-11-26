(function () {
  const CHARS = {
    me: { name: "我", color: "#8fd8c8" },
    kasumi: { name: "霞", color: "#f08aa8", theme: "kasumi" },
    yuina: { name: "结衣", color: "#7fb6f0", theme: "yuina" },
    sion: { name: "栞音", color: "#f6b968", theme: "sion" },
    unknown: { name: "？？？", color: "#b8b8c8" }
  };

  const BG = {
    station: "日落的海边车站",
    boardwalk: "沿海步道",
    classroom: "空荡的教室",
    clubroom: "旧天文社活动室",
    rooftop: "天台",
    beach: "夜的海滩",
    room: "旅馆的房间",
    festival: "夏日祭的摊位前",
    stairs: "通往灯塔的石阶",
    lighthouse: "灯塔顶端",
    sky: "星空"
  };

  const nodes = {};

  function line(speaker, text) {
    const obj = { speaker: speaker, text: text };
    for (let i = 2; i < arguments.length; i += 2) {
      if (arguments[i] !== undefined && arguments[i + 1] !== undefined) {
        obj[arguments[i]] = arguments[i + 1];
      }
    }
    return obj;
  }

  function conv(list) {
    return { type: "lines", list: list };
  }

  function routeLines(theme, list) {
    return { type: "lines", list: list, routeTheme: theme };
  }

  const S = {};

  S.prologue = conv([
    ["bg", "station"],
    line("", "那年夏天，我回到了这座熟悉又陌生的海边小镇。"),
    line("", "蝉鸣声、咸咸的海风、被晒得发白的柏油路——一切都没变。"),
    line("", "手里的旧车票被汗水浸得发软，正是三年前那张，一直没舍得丢。"),
    line("me", "……三年了啊。"),
    line("", "三年前的那个夏天，有个人在这里对我说，等我回来。"),
    line("", "而我，终究还是回来了。"),
    ["effect", "fade"],
    line("", "车站的长椅上，坐着一个正在发呆的少女。"),
    line("unknown", "……新来的？"),
    line("me", "不，是回来的。"),
    line("kasumi", "……", "emotion", "surprise", "theme", "kasumi"),
    line("kasumi", "骗人。你不是……那个三年前就逃掉的人吗。", "emotion", "serious"),
    line("me", "霞。你一点都没变。"),
    line("kasumi", "你倒是变了很多。", "emotion", "teasing"),
    ["bg", "boardwalk"],
    line("", "我们沿着沿海步道慢慢走。夕阳把两个人的影子拉得很长。"),
    line("kasumi", "我还以为，你永远不会回来了呢。", "emotion", "sad", "theme", "kasumi"),
    line("me", "……我也不知道自己为什么会回来。"),
    line("kasumi", "那就别想太多。", "emotion", "smile"),
    line("kasumi", "是你先说了「等我」的。就算迟到了，我也……等了。", "emotion", "shy"),
    ["choice", "prologue_choice"]
  ]);

  S.prologue_choice = {
    type: "choice",
    prompt: "我该怎么回答她？",
    options: [
      {
        text: "「对不起，让你等了这么久。」",
        effects: { affection: { kasumi: 3 }, flag: { sincere: true } },
        goto: "prologue_a"
      },
      {
        text: "「要是知道你在等，我会早点回来。」",
        effects: { affection: { kasumi: 2, yuina: 1 }, flag: { flirty: true } },
        goto: "prologue_b"
      },
      {
        text: "「……我还得确认一下，值不值得留下。」",
        effects: { affection: { sion: 2 }, flag: { distant: true } },
        goto: "prologue_c"
      }
    ]
  };

  S.prologue_a = conv([
    line("kasumi", "……别说对不起。", "emotion", "cry", "theme", "kasumi"),
    line("kasumi", "你回来，就够了。", "emotion", "shy"),
    line("", "她别过头去，耳尖却被夕阳染得很红。"),
    ["choice", "part2_choice"]
  ]);

  S.prologue_b = conv([
    line("kasumi", "你这个人啊，就是嘴甜。", "emotion", "teasing", "theme", "kasumi"),
    line("kasumi", "不过……我不讨厌。", "emotion", "shy"),
    line("", "她轻轻撞了我一下肩膀。"),
    ["choice", "part2_choice"]
  ]);

  S.prologue_c = conv([
    line("kasumi", "……哦。", "emotion", "sad", "theme", "kasumi"),
    line("kasumi", "果然，你还是那个嘴硬的人。", "emotion", "serious"),
    ["choice", "part2_choice"]
  ]);

  S.part2_choice = {
    type: "choice",
    prompt: "夜色渐浓，接下来想做什么？",
    options: [
      {
        text: "陪霞去她常去的旧天文社活动室",
        effects: { affection: { kasumi: 3 }, tag: "kasumi" },
        goto: "kasumi_1"
      },
      {
        text: "去便利店，那边有个人似乎在等我",
        effects: { affection: { yuina: 3 }, tag: "yuina" },
        goto: "yuina_1"
      },
      {
        text: "独自走向灯塔——那里有旧书里的字迹",
        effects: { affection: { sion: 3 }, tag: "sion" },
        goto: "sion_1"
      }
    ]
  };

  S.kasumi_1 = routeLines('kasumi', [
    ["bg", "clubroom"],
    ["effect", "fade"],
    line("", "旧天文社的活动室，比记忆里更暗、更安静。"),
    line("kasumi", "你看，望远镜还在。", "emotion", "smile", "theme", "kasumi"),
    line("me", "当初不是说要把社团做起来吗？"),
    line("kasumi", "社团只剩我一个人了。", "emotion", "sad"),
    line("kasumi", "你走了之后，就没人跟我一起，看南边的夏季大三角了。", "emotion", "cry"),
    line("me", "……霞。"),
    ["effect", "shake"],
    line("kasumi", "我现在……可以再靠近一点吗。", "emotion", "shy"),
    line("", "她解开外套扣子的一颗，露出雪白的锁骨，气息混着夏夜的风靠了过来。"),
    line("kasumi", "难得你回来了，就陪我一会儿……不行吗。", "emotion", "love"),
    line("me", "……当然可以。"),
    line("", "她的指尖在我的手背上，慢慢描了一圈。"),
    ["choice", "kasumi_c"]
  ]);

  S.kasumi_c = {
    type: "choice",
    prompt: "她的眼神在夜色里发亮。",
    options: [
      {
        text: "握紧她的手，什么都不说",
        effects: { affection: { kasumi: 4 }, flag: { held_hand: true } },
        goto: "kasumi_2"
      },
      {
        text: "替她把外套的扣子重新系好",
        effects: { affection: { kasumi: 2 }, flag: { caring: true } },
        goto: "kasumi_2"
      },
      {
        text: "「再靠近的话，我可能走不掉了。」",
        effects: { affection: { kasumi: 3 }, flag: { confession_key: true } },
        goto: "kasumi_2"
      }
    ]
  };

  S.kasumi_2 = routeLines('kasumi', [
    line("kasumi", "……笨蛋。", "emotion", "shy", "theme", "kasumi"),
    line("", "窗外的星星，好像比往年更亮了。"),
    line("kasumi", "那我们说好，这次，你不许再走。", "emotion", "love"),
    line("", "灯塔的光在很远的地方转了一圈，照进她眼底。"),
    ["choice", "kasumi_end"]
  ]);

  S.kasumi_end = {
    type: "choice",
    prompt: "该怎么回应这份等待。",
    options: [
      {
        text: "「我不走了。留下，陪你数星星。」",
        effects: { affection: { kasumi: 2 }, flag: { kasumi_true: true } },
        goto: { end: "kasumi_true" }
      },
      {
        text: "「……对不起，我还需要时间。」",
        effects: { affection: { kasumi: 0 }, flag: { kasumi_normal: true } },
        goto: { end: "kasumi_normal" }
      },
      {
        text: "「其实，你一直知道我为什么回来吧。」",
        effects: { affection: { kasumi: 5 }, flag: { kasumi_true: true, secret: true } },
        goto: { end: "kasumi_secret" }
      }
    ]
  };

  S.yuina_1 = routeLines('yuina', [
    ["bg", "boardwalk"],
    ["effect", "fade"],
    line("", "便利店亮着灯。柜台后面，一个少女正踮着脚理货。"),
    line("yuina", "——欢迎光临！啊，等一下，我马上……", "emotion", "surprise", "theme", "yuina"),
    line("me", "结衣？你在这里打工？"),
    line("yuina", "诶？！你、你回来了？", "emotion", "shy"),
    line("yuina", "真是的！一声不吭就消失三年，班里的通讯录里你是空白栏你知道吗！", "emotion", "anger"),
    line("me", "……抱歉。"),
    line("yuina", "算了算了，既然回来了。", "emotion", "smile"),
    line("yuina", "我刚下班，要一起去海边吗？我请你吃冰淇淋，就当——庆祝？", "emotion", "shy"),
    ["bg", "beach"],
    ["effect", "fade"],
    line("", "夜的海滩没几个人。我们坐在防波堤边，脚尖溅着凉凉的水。"),
    line("yuina", "其实我一直，有点后悔。", "emotion", "sad", "theme", "yuina"),
    line("yuina", "那时候想说的话，没来得及说，你就走了。", "emotion", "shy"),
    line("", "她慢慢靠近，裙摆被海风吹起，露出膝盖上淡淡的旧疤。"),
    line("yuina", "现在说，会不会太迟？", "emotion", "love"),
    ["choice", "yuina_c"]
  ]);

  S.yuina_c = {
    type: "choice",
    prompt: "她抱紧了膝盖，等着我的话。",
    options: [
      {
        text: "「不迟。我听着。」",
        effects: { affection: { yuina: 4 }, flag: { yuina_hear: true } },
        goto: "yuina_2"
      },
      {
        text: "替她披上自己带来的外套",
        effects: { affection: { yuina: 3 }, flag: { warm: true } },
        goto: "yuina_2"
      },
      {
        text: "「那我们，就从现在重新开始吧。」",
        effects: { affection: { yuina: 3 }, flag: { restart: true } },
        goto: "yuina_2"
      }
    ]
  };

  S.yuina_2 = routeLines('yuina', [
    line("yuina", "你这个人，还是一样不会说话呢。", "emotion", "teasing", "theme", "yuina"),
    line("yuina", "可是，我很高兴。真的。", "emotion", "shy"),
    line("", "浪声盖过了心跳。她的指尖，轻轻地勾住了我的小指。"),
    ["effect", "shake"],
    line("yuina", "这个夏天，可别再不见了哦。", "emotion", "love"),
    ["choice", "yuina_end"]
  ]);

  S.yuina_end = {
    type: "choice",
    prompt: "结衣的小指勾得很紧。",
    options: [
      {
        text: "「不会了。这个夏天，一直陪着你。」",
        effects: { affection: { yuina: 2 }, flag: { yuina_true: true } },
        goto: { end: "yuina_true" }
      },
      {
        text: "「……很多事，我还没想明白。」",
        effects: { affection: { yuina: 0 }, flag: { yuina_normal: true } },
        goto: { end: "yuina_normal" }
      },
      {
        text: "「三年前的夏天，你是不是说过什么？」",
        effects: { affection: { yuina: 5 }, flag: { yuina_true: true, secret: true } },
        goto: { end: "yuina_secret" }
      }
    ]
  };

  S.sion_1 = routeLines('sion', [
    ["bg", "stairs"],
    ["effect", "fade"],
    line("", "通往灯塔的石阶很长。半路，一本书从上面滚了下来。"),
    line("me", "……《夏日观测手记》？"),
    ["bg", "lighthouse"],
    line("sion", "啊，谢谢。那是很重要的书。", "emotion", "smile", "theme", "sion"),
    line("me", "上面的字迹……我好像见过。"),
    line("sion", "是吗。", "emotion", "teasing"),
    line("sion", "我叫栞音。写这本手记的人，也是我。", "emotion", "normal"),
    line("", "灯塔顶端，风很大。她靠在栏杆上，长发被吹得凌乱。"),
    line("sion", "我在记每年夏天的星星。三年了，有一年，缺了一页。", "emotion", "sad"),
    line("me", "缺的那一年……是我离开的那年？"),
    line("sion", "你猜谜倒是很快。", "emotion", "teasing"),
    line("sion", "那一页我想补上，可我不知道该写什么。", "emotion", "shy"),
    line("", "她转过身，衣领的扣子被风松开了一颗，露出被月光照亮的锁骨。"),
    line("sion", "要一起，把那页补起来吗。", "emotion", "love"),
    ["choice", "sion_c"]
  ]);

  S.sion_c = {
    type: "choice",
    prompt: "栞音把钢笔递到我手里。",
    options: [
      {
        text: "写下：『这一年，我也在仰望同一片星空。』",
        effects: { affection: { sion: 4 }, flag: { sion_page: true } },
        goto: "sion_2"
      },
      {
        text: "先替她拉好衣领，再接过笔",
        effects: { affection: { sion: 3 }, flag: { sion_tender: true } },
        goto: "sion_2"
      },
      {
        text: "「那页文字，其实应该在今晚写。」",
        effects: { affection: { sion: 3 }, flag: { sion_tonight: true } },
        goto: "sion_2"
      }
    ]
  };

  S.sion_2 = routeLines('sion', [
    ["bg", "sky"],
    line("sion", "…写得很好。是那种会让人想读第二遍的字。", "emotion", "smile", "theme", "sion"),
    line("sion", "谢谢你回来。真的。", "emotion", "shy"),
    line("", "灯塔的光扫过夜空，把她的侧脸照得像一幅画。"),
    ["choice", "sion_end"]
  ]);

  S.sion_end = {
    type: "choice",
    prompt: "夏夜的风把最后一页翻开了。",
    options: [
      {
        text: "「那本手记，我想一直和你一起写下去。」",
        effects: { affection: { sion: 2 }, flag: { sion_true: true } },
        goto: { end: "sion_true" }
      },
      {
        text: "「……这个问题，我想慢慢再答。」",
        effects: { affection: { sion: 0 }, flag: { sion_normal: true } },
        goto: { end: "sion_normal" }
      },
      {
        text: "「缺的那一页，正面写星星，背面写你。」",
        effects: { affection: { sion: 5 }, flag: { sion_true: true, secret: true } },
        goto: { end: "sion_secret" }
      }
    ]
  };

  const ENDINGS = {
    kasumi_true: {
      title: "霞光下的誓言", type: "true",
      text: "那个夏天之后，我们再没有错过任何一年的星。天文社的窗户，重新亮起了灯。",
      theme: "kasumi", emotion: "love"
    },
    kasumi_normal: {
      title: "留在原地的问号", type: "normal",
      text: "我终究没能给出答案。她只是笑着说「没关系」，可我看见她转过身时，肩膀在发颤。",
      theme: "kasumi", emotion: "sad"
    },
    kasumi_secret: {
      title: "被星星记住的人", type: "secret",
      text: "原来三年前那句「等我」，不止是说给我一个人听。那晚我们数到很晚，直到天空发白。",
      theme: "kasumi", emotion: "love"
    },
    yuina_true: {
      title: "浪花里的约定", type: "true",
      text: "便利店门口的铃声变成了我们的暗号。她的笑，比海面上的光还要亮。",
      theme: "yuina", emotion: "love"
    },
    yuina_normal: {
      title: "未寄出的信", type: "normal",
      text: "那封一直没寄出的信，最终留在了抽屉里。未说的话，也许真的需要一个夏天才能说完。",
      theme: "yuina", emotion: "sad"
    },
    yuina_secret: {
      title: "三年后的第一句话", type: "secret",
      text: "她终于说出了那时没说出口的话。而我也，终于把那句迟到了三年的话，还给了她。",
      theme: "yuina", emotion: "love"
    },
    sion_true: {
      title: "手记的最后一页", type: "true",
      text: "那本手记的最后一页，写满了我们共同看过的星星。往后的每一年，都不会再空着。",
      theme: "sion", emotion: "love"
    },
    sion_normal: {
      title: "空白的一页", type: "normal",
      text: "缺的那页最终补上了，可只有星星，没有名字。她把书合上，说「明年再来吧」。",
      theme: "sion", emotion: "sad"
    },
    sion_secret: {
      title: "背面的名字", type: "secret",
      text: "她多年后翻开那页，才发现背面写着自己的名字，和一行小字：『一直都在』。",
      theme: "sion", emotion: "love"
    }
  };

  window.Story = {
    CHARS: CHARS,
    BG: BG,
    S: S,
    ENDINGS: ENDINGS,
    getNode: function (id) {
      if (S[id]) return S[id];
      return null;
    }
  };
})();