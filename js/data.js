/* ============================================================
   频道数据 · 内容占位
   后续替换为真实内容即可
   ============================================================ */

const CHANNELS = [
  {
    id: 0,
    freq: "88.1",
    name: "身份台",
    title: "身份台 · 我是谁",
    style: "Lounge Jazz",
    color: "#4ecdc4",
    colorDim: "rgba(78, 205, 196, 0.3)",
    music: "audio/ch1-identity.mp3",
    content: `
      <h3>一句话定位</h3>
      <p class="highlight">【护理学生 × 创作者商务 × 内容创作者，在杭州独居的 21 岁男生】</p>

      <h3>基本信息</h3>
      <ul>
        <li>姓名/昵称：【待填】</li>
        <li>年龄：21 岁</li>
        <li>坐标：杭州</li>
        <li>身份：护理学生 / GoSail Lab Partnerships Manager / 内容创作者</li>
        <li>MBTI：【待填】</li>
        <li>星座：【待填】</li>
      </ul>

      <h3>性格标签</h3>
      <p>
        <span class="tag">#编码极简主义者</span>
        <span class="tag">#一人食探索家</span>
        <span class="tag">#ICU 轮转生</span>
        <span class="tag">#待填标签</span>
      </p>

      <h3>我是谁</h3>
      <p>【这里是一段自我介绍，2-4 句。真诚地介绍自己，后续替换。】</p>

      <h3>核心特质转化</h3>
      <table>
        <tr><th>特质</th><th>过去</th><th>现在</th><th>转化为</th></tr>
        <tr><td>【敏感】</td><td>【我总是想太多】</td><td>【我能捕捉别人忽略的细节】</td><td>【创作能力】</td></tr>
        <tr><td>【待填】</td><td>【待填】</td><td>【待填】</td><td>【待填】</td></tr>
        <tr><td>【待填】</td><td>【待填】</td><td>【待填】</td><td>【待填】</td></tr>
      </table>
    `
  },
  {
    id: 1,
    freq: "92.5",
    name: "现在进行台",
    title: "现在进行台 · 我在做什么",
    style: "Bossa Nova",
    color: "#ffd93d",
    colorDim: "rgba(255, 217, 61, 0.3)",
    music: "audio/ch2-now.mp3",
    content: `
      <h3>当前运行的进程</h3>

      <div class="card">
        <div class="card-title">▶ 进程 1：护理学习</div>
        <p>【当前阶段：已完成 ICU 轮转，下一科室/学习重点待填】</p>
        <p>【最近在学：动脉采血、血气分析、管道护理等】</p>
      </div>

      <div class="card">
        <div class="card-title">▶ 进程 2：GoSail Lab</div>
        <p>【职位：Partnerships Manager】</p>
        <p>【近期 campaign、合作创作者数量、数据亮点待填】</p>
      </div>

      <div class="card">
        <div class="card-title">▶ 进程 3：内容创作</div>
        <p>【最近在写什么、平台、创作主题待填】</p>
      </div>

      <div class="card">
        <div class="card-title">▶ 进程 4：个人项目</div>
        <p>【最近在折腾：NAS、独立开发、阅读等】</p>
      </div>

      <h3>我擅长的事</h3>
      <ul>
        <li>【写作和表达——文案、内容初稿】</li>
        <li>【KOL 建联和商务谈判】</li>
        <li>【临床操作和护理观察】</li>
        <li>【待填】</li>
      </ul>

      <h3>容易让我卡住的事</h3>
      <ul>
        <li>【需求模糊、标准不清时会反复纠结】</li>
        <li>【临时大幅改动又不说明原因】</li>
        <li>【待填】</li>
      </ul>

      <h3>我的执行节奏</h3>
      <ul>
        <li>工作方式：【单线逐项 / 多线程并行】</li>
        <li>推进节奏：【前期收集 + 临近冲刺 / 匀速推进】</li>
        <li>想法处理：【新灵感先区分价值，契合主线就融入】</li>
      </ul>
    `
  },
  {
    id: 2,
    freq: "96.8",
    name: "未来台",
    title: "未来台 · 我想做什么",
    style: "Piano Solo",
    color: "#a78bfa",
    colorDim: "rgba(167, 139, 250, 0.3)",
    music: "audio/ch3-future.mp3",
    content: `
      <h3>短期目标（3-6 个月）</h3>
      <ol>
        <li>【待填】</li>
        <li>【待填】</li>
        <li>【待填】</li>
      </ol>

      <h3>中期方向（1-2 年）</h3>
      <ol>
        <li>【待填】</li>
        <li>【待填】</li>
      </ol>

      <h3>长期想成为什么样的人</h3>
      <p>【可以模糊，可以真诚。比如：我想成为一个能把护理、科技和创作连接起来的人。】</p>

      <h3>想继续提升的能力</h3>
      <ul>
        <li>【项目管理】</li>
        <li>【数据分析】</li>
        <li>【待填】</li>
      </ul>

      <h3>还在探索的事</h3>
      <p>【可以写"不确定"。比如：护理和 AI 的结合点到底在哪，还在试。】</p>
    `
  },
  {
    id: 3,
    freq: "101.3",
    name: "联络台",
    title: "联络台 · 怎么样和我链接",
    style: "Ukulele Pop",
    color: "#ff9f43",
    colorDim: "rgba(255, 159, 67, 0.3)",
    music: "audio/ch4-contact.mp3",
    content: `
      <h3>联系方式</h3>
      <ul>
        <li>邮箱（主）：【待填】</li>
        <li>X / Twitter：【@GoSailGlobal】</li>
        <li>小红书：【待填】</li>
        <li>公众号：【待填】</li>
      </ul>

      <h3>怎么找我最合适</h3>
      <ul>
        <li>商务合作：【走邮件，标题写清楚合作意向】</li>
        <li>内容交流：【小红书/公众号评论或私信】</li>
        <li>闲聊/交朋友：【待填】</li>
      </ul>

      <h3>欢迎来聊的话题</h3>
      <p>
        <span class="tag">#护理 + AI</span>
        <span class="tag">#KOL 运营</span>
        <span class="tag">#一人食</span>
        <span class="tag">#待填</span>
      </p>

      <h3>给我派活请说清</h3>
      <ul>
        <li>任务目标、截止时间、交付形式</li>
        <li>哪些能自由发挥，哪些不能偏离</li>
        <li>优先级</li>
      </ul>

      <h3>我不太适应的沟通方式</h3>
      <ul>
        <li>【只说"你自己看着办"，不给标准也不给参考】</li>
        <li>【反馈只说"不够好"，不说哪里不好】</li>
      </ul>

      <h3>反馈怎么给我最有效</h3>
      <ul>
        <li>夸我时：直接说哪里做得好，哪些能力可以放大</li>
        <li>指出问题时：说清"哪里不行、为什么、下一步怎么改"</li>
      </ul>

      <h3>压力大时我可能会</h3>
      <ul>
        <li>【反复修改、追求完美，迟迟不交初稿】</li>
        <li>【效率变低，明明在做却感觉没进展】</li>
        <li>这时候对我最有效：帮我把任务拆小，给参考样例</li>
      </ul>
    `
  },
  {
    id: 4,
    freq: "105.7",
    name: "成果台",
    title: "成果台 · 我的成果",
    style: "8-bit Electronic",
    color: "#ff6b6b",
    colorDim: "rgba(255, 107, 107, 0.3)",
    music: "audio/ch5-works.mp3",
    content: `
      <h3>专业成果（护理方向）</h3>
      <ol>
        <li>【ICU 轮转实习完成（2026.08）】</li>
        <li>【护理学习作品/笔记：标题 + 链接】</li>
        <li>【考核/证书：待填】</li>
      </ol>

      <h3>商务成果（GoSail，可脱敏）</h3>
      <ol>
        <li>【操盘 X 个 campaign，合作创作者 X 人】</li>
        <li>【数据亮点：单条 quote tweet 最高 X 浏览】</li>
        <li>【代表案例：脱敏描述】</li>
      </ol>

      <h3>内容成果</h3>
      <ol>
        <li>【代表文章/笔记标题 + 链接】</li>
        <li>【数据：阅读量/点赞/收藏】</li>
      </ol>

      <h3>个人项目/其他</h3>
      <ol>
        <li>【待填】</li>
      </ol>

      <h3>我能为团队/合作方提供</h3>
      <ul>
        <li>【内容策划与文案写作】</li>
        <li>【KOL 建联与 campaign 运营】</li>
        <li>【临床/护理领域的专业视角】</li>
      </ul>

      <h3>暂时别直接交给我</h3>
      <ul>
        <li>【需要较强数据分析建模的任务】</li>
        <li>【待填】</li>
      </ul>
    `
  }
];
