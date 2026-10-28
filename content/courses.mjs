// Language-neutral course catalogue for the Learn-AI handbook.
// bili[]: Bilibili reposts, best first — each one opened in a browser on UPDATED (check-bili.mjs).
// yt / ytAlt: official YouTube playlists, read from YouTube's own playlist pages on UPDATED.
// Every card also gets a Bilibili / YouTube search fallback.
export const UPDATED = "2026-10-29";

export const STATIONS = [
  { id: "s0", n: "0", optional: true, courses: [["py", "opt"], ["missing", "opt"], ["3b1b-la", "opt"], ["mit1806", "opt"], ["cs109", "opt"]] },
  { id: "s1", n: "1", courses: [["cs229", "core"], ["mls", "alt"]] },
  { id: "s2", n: "2", courses: [["cs231n", "core"], ["3b1b-nn", "opt"], ["cs230", "opt"], ["eecs498", "alt"]] },
  { id: "s3", n: "3", courses: [["zth", "core"], ["cs336", "core"], ["cs224n", "opt"], ["cs25", "opt"]] },
  { id: "s4", n: "4", courses: [["llmagents", "core"], ["cs329z", "core"], ["readings", "core"], ["cs329a", "opt"]] },
  { id: "electives", n: "+", elective: true, courses: [["brunton", "opt"], ["cs234", "opt"], ["cs224w", "opt"], ["cs236", "opt"], ["cs330", "opt"], ["cs221", "opt"], ["ee364a", "opt"]] },
];

const YT = (list) => `https://www.youtube.com/playlist?list=${list}`;
const BV = (id) => `https://www.bilibili.com/video/${id}`;

export const COURSES = {
  py: {
    code: "CS50P", name: "CS50's Introduction to Programming with Python", org: "Harvard", by: "David J. Malan", term: "2022", hours: 15,
    bili: [
      { url: BV("BV1NK411x7x1"), title: "哈佛大学《CS50P 2022:Python编程入门|CS50's Introduction to Programming with Python》中英", up: "GPT中英字幕课程资源", parts: 11, subs: "mt" },
    ],
    biliSearch: "CS50P 中英", ytSearch: "CS50P 2022 CS50's Introduction to Programming with Python",
    site: "https://cs50.harvard.edu/python/",
    materials: [{ k: "tutorial", url: "https://cs231n.github.io/python-numpy-tutorial/" }],
  },
  missing: {
    code: "MIT", name: "The Missing Semester of Your CS Education", org: "MIT", by: "Anish Athalye, Jon Gjengset, Jose Javier Gonzalez Ortiz", term: "IAP 2020 · 2026", hours: 11,
    bili: [
      { url: BV("BV1uc411N7eK"), title: "[自制双语字幕] 计算机教育缺失的一课(2020)", up: "刘黑黑a", parts: 11, subs: "bi" },
      { url: BV("BV1x7411H7wa"), title: "[MIT]计算机科学课堂中学不到的知识 The Missing Semester of Your CS Education(2020)", up: "papersnake", parts: 11, subs: "mt" },
    ],
    biliSearch: "计算机教育中缺失的一课 双语",
    yt: { url: YT("PLyzOVJj3bHQuloKGG59rS43e29ro7I57J"), title: "Missing Semester IAP 2020", channel: "Missing Semester", n: 11 },
    ytAlt: { url: YT("PLyzOVJj3bHQunmnnTXrNbZnBaCA-ieK4L"), label: "IAP 2026" },
    site: "https://missing.csail.mit.edu/",
    materials: [],
  },
  "3b1b-la": {
    code: "3B1B", name: "Essence of Linear Algebra", org: "3Blue1Brown", by: "Grant Sanderson", term: "", hours: 3,
    bili: [
      { url: BV("BV1ys411472E"), title: "【官方双语/合集】线性代数的本质 - 系列合集", up: "3Blue1Brown", parts: 16, subs: "bi" },
      { url: BV("BV1NJ411k7bi"), title: "【数学】线性代数的本质 中文语音 3Blue1Brown", up: "莉莉丝官方账号", parts: 16, subs: "dub" },
    ],
    biliSearch: "3Blue1Brown 线性代数的本质 官方双语",
    yt: { url: YT("PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab"), title: "Essence of linear algebra", channel: "3Blue1Brown", n: 16 },
    materials: [],
  },
  mit1806: {
    code: "18.06", name: "Linear Algebra", org: "MIT", by: "Gilbert Strang", term: "OCW", hours: 26,
    bili: [
      { url: BV("BV1zx411g7gq"), title: "麻省理工公开课 线性代数 MIT 18.06 Linear Algebra 中英双语字幕", up: "仲春Mon", parts: 35, subs: "bi" },
      { url: BV("BV1at411d79w"), title: "麻省理工 线性代数 (MIT 18.06, Linear Algebra, Gilbert Strang)【中英】", up: "微小的公开课", parts: 35, subs: "bi" },
    ],
    biliSearch: "MIT 18.06 线性代数 中英",
    yt: { url: YT("PLE7DDD91010BC51F8"), title: "MIT 18.06 Linear Algebra, Spring 2005", channel: "MIT OpenCourseWare", n: 36 },
    site: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/",
    materials: [],
  },
  cs109: {
    code: "CS109", name: "Probability for Computer Scientists", org: "Stanford", by: "Chris Piech", term: "Spring 2022", hours: 30,
    bili: [
      { url: BV("BV1hE421w7cR"), title: "斯坦福大学《计算机科学的概率论|CS109 Introduction to Probability for Computer Scientists 22》", up: "GPT中英字幕课程资源", parts: 29, subs: "mt" },
    ],
    biliSearch: "CS109 概率论 中英",
    yt: { url: YT("PLoROMvodv4rOpr_A7B9SriE_iZmkanvUg"), title: "Stanford CS109 Probability for Computer Scientists (2022)", channel: "Stanford Online", n: 29 },
    site: "https://web.stanford.edu/class/archive/cs/cs109/cs109.1226/",
    materials: [{ k: "notes", url: "https://chrispiech.github.io/probabilityForComputerScientists/en/" }],
  },
  cs229: {
    code: "CS229", name: "Machine Learning", org: "Stanford", by: "Andrew Ng", term: "Autumn 2018", hours: 26,
    bili: [
      { url: BV("BV1JE411w7Ub"), title: "【斯坦福大学】CS229 机器学习 · 2018年（完结·中英字幕·机翻）", up: "鬼谷良师", parts: 28, subs: "mt" },
      { url: BV("BV1TT4y127Nf"), title: "【双语字幕+资料下载】斯坦福CS229 | 机器学习-吴恩达主讲(2018·完整版)", up: "ShowMeAI", parts: 20, subs: "mt" },
    ],
    biliSearch: "CS229 2018 中英字幕",
    yt: { url: YT("PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU"), title: "Stanford CS229: Machine Learning led by Andrew Ng | Autumn 2018", channel: "Stanford Online", n: 21 },
    ytAlt: { url: YT("PLoROMvodv4rNyWOpJg_Yh4NSqI4Z4vOYy"), label: "Spring 2022" },
    site: "https://cs229.stanford.edu/syllabus-autumn2018.html",
    materials: [{ k: "notes", url: "https://cs229.stanford.edu/main_notes.pdf" }],
  },
  mls: {
    code: "MLS", name: "Machine Learning Specialization", org: "Stanford Online · DeepLearning.AI", by: "Andrew Ng", term: "2022", hours: 30,
    bili: [
      { url: BV("BV1Pa411X76s"), title: "(强推|双字)最新吴恩达机器学习Deeplearning.ai课程", up: "啥都会一点的研究生", parts: 151, subs: "bi" },
      { url: BV("BV19B4y1W76i"), title: "[中英字幕]吴恩达2022机器学习 machine learning specialization", up: "Ch0s1nz", parts: 142, subs: "bi" },
    ],
    biliSearch: "吴恩达 机器学习 2022 中英字幕",
    yt: { url: YT("PLkDaE6sCZn6FNC6YRfRQc_FbeQrF8BwGI"), title: "Machine Learning Specialization by Andrew Ng", channel: "DeepLearningAI", n: 41 },
    site: "https://www.coursera.org/specializations/machine-learning-introduction",
    materials: [],
  },
  cs231n: {
    code: "CS231n", name: "Deep Learning for Computer Vision", org: "Stanford", by: "Fei-Fei Li, Justin Johnson, Serena Yeung et al.", term: "Spring 2017 · 2025", hours: 20,
    bili: [
      { url: BV("BV1Dx411n7UE"), title: "【双语字幕】斯坦福CS231n《深度视觉识别》课程(2017) by Fei-Fei Li, Justin Johnson, Serena Yeung", up: "爱可可-爱生活", parts: 16, subs: "bi" },
      { url: BV("BV1FqazzVE6w"), title: "斯坦福大学《计算机视觉的深度学习|CS231n: Deep Learning for Computer Vision 2025》中英字幕", up: "GPT中英字幕课程资源", parts: 18, subs: "mt", label: "2025" },
    ],
    biliSearch: "CS231n 中英字幕",
    yt: { url: YT("PLoROMvodv4rOmsNzYBMe0gJY2XS8AQg16"), title: "Stanford CS231N Deep Learning for Computer Vision I 2025", channel: "Stanford Online", n: 18 },
    ytAlt: { url: YT("PL3FW7Lu3i5JvHM8ljYj-zLfQRF3EO8sYv"), label: "Spring 2017" },
    site: "https://cs231n.stanford.edu/2025/",
    materials: [{ k: "notes", url: "https://cs231n.github.io/" }, { k: "hw", url: "https://cs231n.github.io/assignments2025/assignment1/" }],
  },
  "3b1b-nn": {
    code: "3B1B", name: "Neural Networks", org: "3Blue1Brown", by: "Grant Sanderson", term: "", hours: 3,
    bili: [
      { url: BV("BV1bx411M7Zx"), title: "【官方双语】深度学习之神经网络的结构 Part 1 ver 2.0", up: "3Blue1Brown", parts: 1, subs: "bi" },
      { url: BV("BV1szpFedEV2"), title: "【中文配音】深度学习（3Blue1Brown）", up: "Fentwer", parts: 7, subs: "dub" },
    ],
    biliSearch: "3Blue1Brown 深度学习 官方双语",
    yt: { url: YT("PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi"), title: "Neural networks", channel: "3Blue1Brown", n: 10 },
    materials: [],
  },
  cs230: {
    code: "CS230", name: "Deep Learning", org: "Stanford", by: "Andrew Ng, Kian Katanforoosh", term: "Autumn 2018 · 2025", hours: 13,
    bili: [
      { url: BV("BV1Jm4y1S71u"), title: "【双语字幕+资料下载】斯坦福CS230 | 深度学习-吴恩达主讲(2018·完整版)", up: "ShowMeAI", parts: 10, subs: "mt" },
      { url: BV("BV19y421z7jz"), title: "吴恩达@斯坦福大学《深度学习|Stanford CS230: Deep Learning | Autumn 2018》中英字幕（豆包翻译）", up: "GPT中英字幕课程资源", parts: 10, subs: "mt" },
    ],
    biliSearch: "CS230 吴恩达 双语字幕",
    yt: { url: YT("PLoROMvodv4rOABXSygHTsbvUz4G_YQhOb"), title: "Stanford CS230: Deep Learning | Autumn 2018", channel: "Stanford Online", n: 10 },
    ytAlt: { url: YT("PLoROMvodv4rNRRGdS0rBbXOUGA0wjdh1X"), label: "Autumn 2025" },
    site: "https://cs230.stanford.edu/",
    materials: [],
  },
  eecs498: {
    code: "EECS 498", name: "Deep Learning for Computer Vision", org: "Michigan", by: "Justin Johnson", term: "Fall 2019", hours: 26,
    bili: [
      { url: BV("BV13P4y1t7gM"), title: "【双语字幕+资料下载】CS231n进阶课 | 深度学习与计算机视觉(2019·全22讲)", up: "ShowMeAI", parts: 22, subs: "bi" },
      { url: BV("BV1TQ4y1B7yx"), title: "【最新版+学习笔记】cs231n计算机视觉经典课程(中英字幕)", up: "想不出来昵称又想改", parts: 22, subs: "bi" },
    ],
    biliSearch: "EECS498 深度学习与计算机视觉 双语", ytSearch: "Justin Johnson EECS 498-007 598-005 Deep Learning for Computer Vision Fall 2019",
    materials: [],
  },
  zth: {
    code: "Zero to Hero", name: "Neural Networks: Zero to Hero", org: "Karpathy", by: "Andrej Karpathy", term: "2022–2024", hours: 18,
    bili: [
      { url: BV("BV11yHXeuE9d"), title: "【精译⚡从零开始构建 GPT 系列】Andrej Karpathy", up: "常青藤中英字幕课程", parts: 10, subs: "bi" },
      { url: BV("BV1c5411C7iP"), title: "Neural Networks: Zero to Hero 神经网络：从入门到精通", up: "守恒的角动量", parts: 10 },
    ],
    biliSearch: "Karpathy 从零开始构建GPT 精译",
    yt: { url: YT("PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ"), title: "Neural Networks: Zero to Hero", channel: "Andrej Karpathy", n: 10 },
    site: "https://karpathy.ai/zero-to-hero.html",
    materials: [{ k: "code", url: "https://github.com/karpathy/nn-zero-to-hero" }],
  },
  cs336: {
    code: "CS336", name: "Language Modeling from Scratch", org: "Stanford", by: "Percy Liang, Tatsunori Hashimoto", term: "Spring 2025", hours: 22,
    bili: [
      { url: BV("BV1zW5yz1Eom"), title: "斯坦福大学《从零开始的语言模型|CS336 Language Modeling from Scratch Spring 2025》中英字幕(ds-R1)", up: "GPT中英字幕课程资源", parts: 16, subs: "mt" },
      { url: BV("BV1ZNVAzXEtP"), title: "[自动字幕] 斯坦福 CS336：从零开始构建语言模型 | 2025 年春季", up: "AInsight", parts: 17, subs: "mt" },
    ],
    biliSearch: "CS336 中英字幕",
    yt: { url: YT("PLoROMvodv4rOY23Y0BoGoBGgQ1zmU_MT_"), title: "Stanford CS336 Language Modeling from Scratch I 2025", channel: "Stanford Online", n: 17 },
    ytAlt: { url: YT("PLoROMvodv4rMqXOcazWaTUHhq-yembLCV"), label: "Spring 2026" },
    site: "https://cs336.stanford.edu/spring2025/",
    materials: [{ k: "hw", url: "https://github.com/stanford-cs336/assignment1-basics" }],
  },
  cs224n: {
    code: "CS224n", name: "Natural Language Processing with Deep Learning", org: "Stanford", by: "Christopher Manning", term: "Winter 2021 · Spring 2024", hours: 26,
    bili: [
      { url: BV("BV18Y411p79k"), title: "【斯坦福CS224N】(2021|中英) 深度自然语言处理Natural Language Processing with Deep Learning", up: "偷得半日来学习", parts: 18, subs: "bi" },
      { url: BV("BV1U5RNYgEfp"), title: "斯坦福大学《深度学习自然语言处理|Stanford CS224N NLP with Deep Learning 2024》中英字幕", up: "GPT中英字幕课程资源", parts: 23, subs: "mt", label: "2024" },
    ],
    biliSearch: "CS224N 中英字幕",
    yt: { url: YT("PLoROMvodv4rOSH4v6133s9LFPRHjEmbmJ"), title: "Stanford CS224N: NLP with Deep Learning | Winter 2021", channel: "Stanford Online", n: 23 },
    ytAlt: { url: YT("PLoROMvodv4rOaMFbaqxPDoLWjDaRAdP9D"), label: "Spring 2024" },
    site: "https://web.stanford.edu/class/cs224n/",
    materials: [],
  },
  cs25: {
    code: "CS25", name: "Transformers United", org: "Stanford", by: "guest researchers", term: "V1–V6", hours: 55,
    bili: [
      { url: BV("BV1KV4y1j7NH"), title: "【中英字幕】2022最新 | 斯坦福CS25：Transformers United专题讲座", up: "矩池云", parts: 10, subs: "bi" },
      { url: BV("BV1do4meWE2R"), title: "斯坦福CS25 - Transformers United研讨会v1-v4", up: "听君一席课", parts: 33, label: "V1–V4" },
    ],
    biliSearch: "CS25 Transformers United 中英字幕",
    yt: { url: YT("PLoROMvodv4rNiJRchCzutFw5ItR_Z27CM"), title: "Stanford CS25 - Transformers United", channel: "Stanford Online", n: 50 },
    site: "https://web.stanford.edu/class/cs25/",
    materials: [],
  },
  llmagents: {
    code: "CS294/194-196", name: "Large Language Model Agents", org: "UC Berkeley", by: "Dawn Song, Xinyun Chen", term: "Fall 2024 · Spring 2025", hours: 20,
    bili: [], biliSearch: "CS 194 294-196 LLM Agents 中英字幕",
    yt: { url: YT("PLS01nW3RtgopsNLeM936V4TNSsvvVglLc"), title: "LLM Agents MOOC, Fall 2024", channel: "Berkeley RDI", n: 14 },
    ytAlt: { url: YT("PLS01nW3RtgorL3AW8REU9nGkzhvtn6Egn"), label: "Advanced · Spring 2025" },
    site: "https://llmagents-learning.org/f24",
    materials: [],
  },
  cs329z: {
    code: "CS329Z", name: "Engineering AI Agents", org: "Stanford", by: "Diyi Yang, Michael Ryan, John Yang", term: "Fall 2026", hours: 0,
    noVideo: true, // lecture recordings are on Canvas for enrolled students only
    primary: { k: "site", url: "https://cs329z.stanford.edu/" },
    materials: [
      { k: "slides", url: "https://cs329z.stanford.edu/index.html#schedule" },
      { k: "hw", url: "https://github.com/cs329z/assignment1-harness" },
      { k: "code", url: "https://github.com/cs329z/lecture5-frameworks" },
    ],
  },
  readings: {
    code: "READ", name: "Agent engineering reading list", org: "Anthropic · OpenAI · DeepSeek · MCP", by: "engineering docs", term: "", hours: 0,
    noVideo: true, kind: "reading",
    materials: [
      { label: "Building effective agents", url: "https://www.anthropic.com/engineering/building-effective-agents" },
      { label: "OpenAI function calling", url: "https://developers.openai.com/api/docs/guides/function-calling" },
      { label: "DeepSeek tool calls", url: "https://api-docs.deepseek.com/zh-cn/guides/tool_calls" },
      { label: "Model Context Protocol", url: "https://modelcontextprotocol.io/" },
    ],
  },
  cs329a: {
    code: "CS329A", name: "Self-Improving AI Agents", org: "Stanford", by: "Aakanksha Chowdhery, Azalia Mirhoseini", term: "Autumn 2025", hours: 0,
    bili: [], biliSearch: "CS329A Self-Improving AI Agents",
    yt: { url: YT("PLangBM27OtEA"), title: "CS329A Self-Improving AI Agents", channel: "Stanford Online", n: 9 },
    site: "https://cs329a.stanford.edu/",
    materials: [{ k: "companion", url: "/cs329a/" }],
  },
  brunton: {
    code: "PIML", name: "Physics-Informed Machine Learning", org: "University of Washington", by: "Steve Brunton", term: "", hours: 0,
    bili: [
      { url: BV("BV1wsqwBvEHc"), title: "【Steve Brunton】物理信息机器学习(PIML)全套教程：AI for Science 必修课 | 稀疏动力学/几何深度学习/神经微分方程", up: "赛博门外憨", parts: 24 },
    ],
    biliSearch: "Steve Brunton 物理信息机器学习",
    yt: { url: YT("PLMrJAkhIeNNQ0BaKuBKY43k4xMo6NSbBa"), title: "Physics Informed Machine Learning", channel: "Steve Brunton", n: 24 },
    materials: [],
  },
  cs234: {
    code: "CS234", name: "Reinforcement Learning", org: "Stanford", by: "Emma Brunskill", term: "Spring 2024", hours: 20,
    bili: [
      { url: BV("BV1dWB2Y4EcG"), title: "【强化学习 CS234 2024】斯坦福大学—中英字幕", up: "常青藤中英字幕课程", parts: 16, subs: "bi" },
      { url: BV("BV1U4421U7xr"), title: "斯坦福大学《强化学习|Stanford CS234 Reinforcement Learning Winter 2019》中英字幕（豆包翻译）", up: "GPT中英字幕课程资源", parts: 15, subs: "mt", label: "2019" },
    ],
    biliSearch: "CS234 强化学习 中英字幕",
    yt: { url: YT("PLoROMvodv4rN4wG6Nk6sNpTEbuOSosZdX"), title: "Stanford CS234: Reinforcement Learning | Spring 2024", channel: "Stanford Online", n: 16 },
    site: "https://web.stanford.edu/class/archive/cs/cs234/cs234.1246/",
    materials: [],
  },
  cs224w: {
    code: "CS224W", name: "Machine Learning with Graphs", org: "Stanford", by: "Jure Leskovec", term: "2021", hours: 20,
    bili: [
      { url: BV("BV1RZ4y1c7Co"), title: "【双语字幕】斯坦福CS224W《图机器学习》课程(2021) by Jure Leskovec", up: "爱可可-爱生活", parts: 60, subs: "bi" },
      { url: BV("BV1Cm4y197wx"), title: "【斯坦福 CS224W】图机器学习( 中英字幕 | 2021秋) Machine Learning with Graphs by Jure Leskovec", up: "偷得半日来学习", parts: 59, subs: "bi" },
    ],
    biliSearch: "CS224W 图机器学习 中英字幕",
    yt: { url: YT("PLoROMvodv4rPLKxIpqhjhPgdQy7imNkDn"), title: "Stanford CS224W: Machine Learning with Graphs", channel: "Stanford Online", n: 60 },
    site: "https://web.stanford.edu/class/cs224w/",
    materials: [],
  },
  cs236: {
    code: "CS236", name: "Deep Generative Models", org: "Stanford", by: "Stefano Ermon", term: "2023", hours: 23,
    bili: [
      { url: BV("BV1iS411w7rZ"), title: "[中英字幕] 斯坦福大学 CS236：深度生成模型 I 2023 I Stefano Ermon", up: "AInsight", parts: 18, subs: "bi" },
    ],
    biliSearch: "CS236 深度生成模型 中英",
    yt: { url: YT("PLoROMvodv4rPOWA-omMM6STXaWW4FvJT8"), title: "Stanford CS236: Deep Generative Models I 2023", channel: "Stanford Online", n: 18 },
    site: "https://deepgenerativemodels.github.io/",
    materials: [{ k: "notes", url: "https://deepgenerativemodels.github.io/notes/index.html" }],
  },
  cs330: {
    code: "CS330", name: "Deep Multi-Task and Meta Learning", org: "Stanford", by: "Chelsea Finn", term: "Autumn 2022", hours: 23,
    bili: [
      { url: BV("BV1dWpPepEsj"), title: "斯坦福大学《深度多任务与元学习|Stanford CS330 Deep Multi-Task and Meta Learning 2022》中英（豆包翻译）", up: "GPT中英字幕课程资源", parts: 17, subs: "mt" },
      { url: BV("BV15t4y127V1"), title: "斯坦福CS330：深度多任务和元学习中英文字幕", up: "大佬的迷弟的粉丝", parts: 12, subs: "bi", label: "2019" },
    ],
    biliSearch: "CS330 元学习 中英",
    yt: { url: YT("PLoROMvodv4rNjRoawgt72BBNwL2V7doGI"), title: "Stanford CS330: Deep Multi-Task and Meta Learning | Autumn 2022", channel: "Stanford Online", n: 17 },
    site: "https://cs330.stanford.edu/fall2022/",
    materials: [],
  },
  cs221: {
    code: "CS221", name: "Artificial Intelligence: Principles and Techniques", org: "Stanford", by: "Percy Liang et al.", term: "Autumn 2019 · 2025", hours: 25,
    bili: [
      { url: BV("BV16E411J7AQ"), title: "【斯坦福大学】CS221 人工智能原理与技术 · 2019秋（完结·中英字幕·人工校对中)", up: "鬼谷良师", parts: 19, subs: "mt" },
      { url: BV("BV1tmXXYKEse"), title: "【斯坦福大学 • 中英】人工智能：原理与技术 （CS221， 2021）", up: "Mindofuture", parts: 56, subs: "bi", label: "2021" },
    ],
    biliSearch: "CS221 人工智能 原理与技术 中英",
    yt: { url: YT("PLoROMvodv4rMeDqwS1yFl3j3sR_-MQNEN"), title: "Stanford CS221: Artificial Intelligence | Autumn 2025", channel: "Stanford Online", n: 20 },
    ytAlt: { url: YT("PLoROMvodv4rO1NB9TD4iUZ3qghGEGtqNX"), label: "Autumn 2019" },
    site: "https://stanford-cs221.github.io/autumn2025/",
    materials: [],
  },
  ee364a: {
    code: "EE364A", name: "Convex Optimization I", org: "Stanford", by: "Stephen Boyd", term: "2023", hours: 25,
    bili: [
      { url: BV("BV1aD4y1Q7aW"), title: "【斯坦福大学】EE364A 凸优化 · 2014年冬（完结·中英字幕·机翻）", up: "鬼谷良师", parts: 13, subs: "mt", label: "2014" },
      { url: BV("BV1Pg4y187Ed"), title: "[凸优化-中文字幕]Boyd斯坦福公开课", up: "瓜哥思密达0922", parts: 13, subs: "zh" },
    ],
    biliSearch: "凸优化 Boyd 中英字幕",
    yt: { url: YT("PLoROMvodv4rMJqxxviPa4AmDClvcbHi6h"), title: "Stanford EE364A Convex Optimization I Stephen Boyd I 2023", channel: "Stanford Online", n: 18 },
    site: "https://web.stanford.edu/class/ee364a/",
    materials: [{ k: "notes", url: "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf" }],
  },
};
