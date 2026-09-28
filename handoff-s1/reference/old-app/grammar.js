// t: mc = 選擇題, fill = 打字填充, tiles = 砌句子
const GRAMMAR = [
{ id: 1, emoji: "⏰", title: "一般現在式 vs 現在進行式", en: "Present Simple vs Present Continuous",
  intro: [
    { h: "一般現在式 Present Simple", p: "講<b>習慣、事實、時間表</b>。I / you / we / they + 動詞原形；<b>he / she / it + 動詞加 -s / -es</b>。常見字眼：every day, usually, always, often, never。",
      ex: [["I drink coffee every morning.", "我每朝都飲咖啡。"], ["She works in Central.", "佢喺中環返工。"]] },
    { h: "現在進行式 Present Continuous", p: "講<b>而家／呢排進行緊</b>嘅事。<b>am / is / are + 動詞-ing</b>。常見字眼：now, right now, at the moment, Look!, Listen!",
      ex: [["I am drinking coffee now.", "我而家飲緊咖啡。"], ["They are having a meeting at the moment.", "佢哋而家開緊會。"]] },
    { h: "⚠️ 小心", p: "like, know, want, need 呢類「狀態動詞」通常<b>唔用進行式</b>。<br>✅ I want tea.　❌ I am wanting tea.", ex: [] }
  ],
  ex: [
    { t: "mc", q: "My dad ___ to work by MTR every day.", zh: "我爸爸每日搭港鐵返工。", o: ["go", "goes", "is going", "going"], a: 1, why: "every day = 習慣，用一般現在式；my dad 係第三人稱單數，所以 go 要加 -es。" },
    { t: "mc", q: "Look! The bus ___.", zh: "睇下！架巴士嚟緊。", o: ["comes", "come", "is coming", "are coming"], a: 2, why: "Look! 表示而家發生緊，用現在進行式；the bus 係單數，用 is。" },
    { t: "fill", q: "Please be quiet. The baby ___ (sleep).", zh: "請靜啲，BB 瞓緊覺。", a: ["is sleeping"], why: "BB 而家瞓緊 → is + sleeping。" },
    { t: "mc", q: "I ___ what you mean.", zh: "我明你意思。", o: ["know", "am knowing", "knows", "knowing"], a: 0, why: "know 係狀態動詞，唔用進行式；主語 I 用原形。" },
    { t: "tiles", zh: "佢哋而家開緊會。", a: "They are having a meeting now", extra: ["have", "is"], why: "而家進行緊：They are + having。" },
    { t: "fill", q: "She usually ___ (have) lunch at one.", zh: "佢通常一點食晏。", a: ["has"], why: "usually = 習慣；have 嘅第三人稱單數係 has。" },
    { t: "mc", q: "What ___ you doing now?", zh: "你而家做緊咩？", o: ["do", "are", "is", "does"], a: 1, why: "now + doing → 現在進行式；主語 you 用 are。" }
  ] },
{ id: 2, emoji: "📜", title: "過去式：規則同不規則動詞", en: "Past Simple",
  intro: [
    { h: "幾時用？", p: "講<b>過去已經完成</b>嘅事。常見字眼：yesterday, last week, two days ago, in 2020。", ex: [["I watched a movie yesterday.", "我琴日睇咗套戲。"]] },
    { h: "規則動詞：加 -ed", p: "work → worked；以 e 結尾只加 -d：live → lived；輔音 + y → 改做 -ied：study → studied；短元音 + 單輔音 → 雙寫：stop → stopped。", ex: [["She studied English last night.", "佢琴晚溫咗英文。"]] },
    { h: "不規則動詞：要背", p: "go → <b>went</b>　eat → <b>ate</b>　buy → <b>bought</b>　see → <b>saw</b>　have → <b>had</b>　take → <b>took</b>　make → <b>made</b>　get → <b>got</b>", ex: [["We went to Japan last year.", "我哋舊年去咗日本。"]] },
    { h: "否定同問句：did + 原形", p: "✅ I didn't go.　❌ I didn't went.<br>✅ Did you eat?　❌ Did you ate?", ex: [["Did you see my email?", "你有冇睇到我封電郵？"]] }
  ],
  ex: [
    { t: "mc", q: "I ___ to Japan last year.", zh: "我舊年去咗日本。", o: ["go", "went", "goed", "gone"], a: 1, why: "last year = 過去；go 嘅過去式係不規則嘅 went。" },
    { t: "fill", q: "We ___ (watch) a movie yesterday.", zh: "我哋琴日睇咗套戲。", a: ["watched"], why: "規則動詞：watch + ed = watched。" },
    { t: "mc", q: "She didn't ___ breakfast this morning.", zh: "佢今朝冇食早餐。", o: ["ate", "eat", "eats", "eaten"], a: 1, why: "didn't 後面用動詞原形 eat。" },
    { t: "fill", q: "He ___ (study) English last night.", zh: "佢琴晚溫咗英文。", a: ["studied"], why: "輔音 + y 結尾：study → studied。" },
    { t: "mc", q: "___ you see the email yesterday?", zh: "你琴日有冇睇到封電郵？", o: ["Do", "Did", "Does", "Were"], a: 1, why: "yesterday = 過去，問句用 Did + 原形 see。" },
    { t: "tiles", zh: "我琴日買咗一部新手機。", a: "I bought a new phone yesterday", extra: ["buy", "buyed"], why: "buy 嘅過去式係不規則嘅 bought。" },
    { t: "fill", q: "The train ___ (stop) suddenly.", zh: "架火車突然停咗。", a: ["stopped"], why: "短元音 + 單輔音：stop → stopped（雙寫 p）。" }
  ] },
{ id: 3, emoji: "🍎", title: "可數／不可數名詞 + a / an / some / any", en: "Countable & Uncountable Nouns",
  intro: [
    { h: "可數 vs 不可數", p: "<b>可數名詞</b>可以數：an apple, two apples。<br><b>不可數名詞</b>唔可以直接數、冇複數：water, money, information, advice, luggage, furniture。", ex: [["I need some advice.", "我想要啲意見。"]] },
    { h: "a 定 an？睇「讀音」", p: "<b>a</b> 用喺輔音「音」前面：a book, a university（讀 /juː/）。<br><b>an</b> 用喺元音「音」前面：an egg, an hour（h 唔發音）。", ex: [["She is an honest person.", "佢係一個誠實嘅人。"]] },
    { h: "some 同 any", p: "<b>some</b> 用喺肯定句；<b>any</b> 用喺否定句同問句。<br>請人食嘢、提出要求嘅問句都用 some：Would you like some tea?", ex: [["I don't have any money.", "我一啲錢都冇。"], ["Do you have any questions?", "你有冇問題？"]] }
  ],
  ex: [
    { t: "mc", q: "I need ___ umbrella.", zh: "我需要一把遮。", o: ["a", "an", "some", "any"], a: 1, why: "umbrella 以元音音 /ʌ/ 開頭，用 an。" },
    { t: "mc", q: "Can you give me some ___?", zh: "你可唔可以畀啲意見我？", o: ["advice", "advices", "an advice", "a advice"], a: 0, why: "advice 係不可數名詞，冇 -s、唔用 a / an。" },
    { t: "mc", q: "We don't have ___ milk left.", zh: "我哋冇晒牛奶喇。", o: ["some", "any", "a", "an"], a: 1, why: "否定句用 any；milk 不可數，唔用 a / an。" },
    { t: "fill", q: "She is ___ honest person. (a / an)", zh: "佢係一個誠實嘅人。", a: ["an"], why: "honest 嘅 h 唔發音，以元音音開頭，用 an。" },
    { t: "mc", q: "Would you like ___ coffee?", zh: "你想唔想飲啲咖啡？", o: ["any", "some", "many", "a few"], a: 1, why: "請人食嘢／飲嘢嘅問句用 some。" },
    { t: "tiles", zh: "你有冇問題想問？", a: "Do you have any questions", extra: ["much", "is"], why: "一般問句用 any；questions 可數，用複數。" },
    { t: "mc", q: "There ___ a lot of information on this website.", zh: "呢個網站有好多資料。", o: ["is", "are", "have", "has"], a: 0, why: "information 不可數，當單數，用 is。" }
  ] },
{ id: 4, emoji: "📏", title: "比較級同最高級", en: "Comparatives & Superlatives",
  intro: [
    { h: "短形容詞：-er / -est", p: "cheap → cheaper → the cheapest<br>big → bigger → the biggest（雙寫）<br>happy → happier → the happiest（y 變 i）", ex: [["Tea is cheaper than coffee.", "茶平過咖啡。"]] },
    { h: "長形容詞：more / the most", p: "expensive → more expensive → the most expensive<br>comfortable → more comfortable → the most comfortable", ex: [["This is the most expensive restaurant here.", "呢間係呢度最貴嘅餐廳。"]] },
    { h: "不規則 + 句式", p: "good → <b>better</b> → <b>the best</b>；bad → <b>worse</b> → <b>the worst</b><br>比較兩樣嘢用 <b>than</b>；最高級前面通常加 <b>the</b>。", ex: [["My English is better than before.", "我嘅英文好過以前。"]] }
  ],
  ex: [
    { t: "mc", q: "This bag is ___ than that one.", zh: "呢個袋平過嗰個。", o: ["cheap", "cheaper", "cheapest", "more cheap"], a: 1, why: "有 than → 比較級；cheap 係短形容詞，加 -er。" },
    { t: "mc", q: "Hong Kong is one of ___ cities in the world.", zh: "香港係世界上最繁忙嘅城市之一。", o: ["busy", "busier", "the busiest", "the most busy"], a: 2, why: "one of the + 最高級；busy → the busiest（y 變 i）。" },
    { t: "fill", q: "My phone is ___ (expensive) than yours.", zh: "我部手機貴過你部。", a: ["more expensive"], why: "expensive 係長形容詞，比較級用 more expensive。" },
    { t: "mc", q: "Today I feel ___ than yesterday. I need a doctor.", zh: "我今日仲差過琴日，要睇醫生。", o: ["bad", "badder", "worse", "worst"], a: 2, why: "bad 嘅比較級係不規則嘅 worse。" },
    { t: "fill", q: "She is the ___ (good) student in the class.", zh: "佢係班上最好嘅學生。", a: ["best"], why: "good → better → the best。" },
    { t: "tiles", zh: "搭港鐵快過搭巴士。", a: "The MTR is faster than the bus", extra: ["fast", "more"], why: "fast 係短形容詞：faster than。" },
    { t: "mc", q: "Which is ___ comfortable, the sofa or the chair?", zh: "梳化同凳，邊樣舒服啲？", o: ["more", "most", "the most", "much"], a: 0, why: "比較兩樣嘢用比較級；comfortable 係長形容詞，用 more。" }
  ] },
{ id: 5, emoji: "🔮", title: "將來式：will 定 be going to", en: "Future: will vs going to",
  intro: [
    { h: "will + 原形", p: "<b>臨時決定、預測、承諾、主動幫手</b>。否定：won't = will not。", ex: [["I'm thirsty. I'll get some water.", "我口渴，我去攞啲水。"], ["I will call you tonight.", "我今晚會打畀你。"]] },
    { h: "be going to + 原形", p: "<b>之前已經計劃好</b>，或者<b>有證據</b>就快發生。", ex: [["I'm going to visit my grandma this Sunday.", "我今個星期日會去探嫲嫲。"], ["Look at the clouds! It's going to rain.", "睇下啲雲！就快落雨喇。"]] }
  ],
  ex: [
    { t: "mc", q: "The phone is ringing. I ___ answer it.", zh: "電話響緊，我去聽。", o: ["will", "am going to", "going to", "answers"], a: 0, why: "聽到電話響先決定 → 臨時決定，用 will。" },
    { t: "mc", q: "We ___ move to Tai Po next month. We bought a flat already.", zh: "我哋下個月搬去大埔，已經買咗層樓。", o: ["will", "are going to", "go to", "going"], a: 1, why: "早已計劃好（已經買咗樓）→ be going to。" },
    { t: "mc", q: "Look at those dark clouds! It ___ rain.", zh: "睇下啲烏雲！就快落雨喇。", o: ["'s going to", "will to", "going", "rains"], a: 0, why: "有證據（烏雲）→ be going to。" },
    { t: "fill", q: "Don't worry. I ___ tell anyone. (will 嘅否定)", zh: "放心，我唔會話畀人知。", a: ["won't", "will not", "wont"], why: "承諾用 will；否定係 won't / will not。" },
    { t: "tiles", zh: "我聽日會打電話畀你。", a: "I will call you tomorrow", extra: ["calling", "am"], why: "承諾：will + 原形 call。" },
    { t: "fill", q: "She ___ going to start a new job. (is / are)", zh: "佢就快開始一份新工。", a: ["is"], why: "主語 she 用 is going to。" },
    { t: "mc", q: "A: I don't have a pen. B: No problem. I ___ lend you one.", zh: "甲：我冇筆。乙：冇問題，我借支畀你。", o: ["will", "am going", "going to", "lend"], a: 0, why: "主動幫手、臨時決定 → will。" }
  ] },
{ id: 6, emoji: "✅", title: "現在完成式入門", en: "Present Perfect Basics",
  intro: [
    { h: "結構", p: "<b>have / has + 過去分詞（p.p.）</b><br>go → gone / been　eat → eaten　see → seen　do → done　write → written　finish → finished", ex: [] },
    { h: "三個常見用法", p: "① 人生經驗：<b>ever / never</b><br>② 啱啱／已經／未：<b>just / already / yet</b><br>③ 由過去一直到而家：<b>for / since</b>",
      ex: [["Have you ever been to Japan?", "你有冇去過日本？"], ["I have just finished my report.", "我啱啱寫完份報告。"], ["I have worked here for five years.", "我喺度做咗五年。"]] },
    { h: "⚠️ 小心", p: "有<b>具體過去時間</b>（yesterday, last year, ago）就要用<b>過去式</b>。<br>✅ I saw him yesterday.　❌ I have seen him yesterday.", ex: [] }
  ],
  ex: [
    { t: "mc", q: "Have you ever ___ sushi?", zh: "你有冇食過壽司？", o: ["eat", "ate", "eaten", "eating"], a: 2, why: "have + 過去分詞：eat → eaten。" },
    { t: "mc", q: "She ___ worked here since 2019.", zh: "佢由 2019 年開始喺度做。", o: ["have", "has", "is", "did"], a: 1, why: "主語 she 用 has + 過去分詞。" },
    { t: "fill", q: "I have already ___ (finish) my homework.", zh: "我已經做完功課喇。", a: ["finished"], why: "have + 過去分詞 finished。" },
    { t: "mc", q: "I have lived in Hong Kong ___ ten years.", zh: "我喺香港住咗十年。", o: ["since", "for", "ago", "from"], a: 1, why: "for + 一段時間（ten years）；since + 時間起點（since 2015）。" },
    { t: "mc", q: "I ___ him yesterday.", zh: "我琴日見到佢。", o: ["have seen", "saw", "have saw", "seen"], a: 1, why: "yesterday 係具體過去時間，用過去式 saw。" },
    { t: "tiles", zh: "我從來冇去過英國。", a: "I have never been to the UK", extra: ["went", "ever"], why: "人生經驗：have never been to。" },
    { t: "fill", q: "Have you finished the report ___? (yet / already)", zh: "你寫完份報告未呀？", a: ["yet"], why: "問句同否定句用 yet（未／已經）。" }
  ] },
{ id: 7, emoji: "📅", title: "時間介詞 in / on / at", en: "Prepositions of Time",
  intro: [
    { h: "at：準確時間", p: "at 7 o'clock, at noon, at night, at the weekend（英式）, at Christmas", ex: [["The meeting starts at 9:30.", "個會九點半開始。"]] },
    { h: "on：日子、日期", p: "on Monday, on 1st July, on my birthday, on Christmas Day", ex: [["I don't work on Sundays.", "我星期日唔使返工。"]] },
    { h: "in：月、年、季節、時段", p: "in May, in 2025, in summer, in the morning, in the evening<br>口訣：<b>at（鐘數）→ on（日子）→ in（月、年）</b>，越嚟越大。", ex: [["My birthday is in March.", "我生日喺三月。"]] },
    { h: "⚠️ 唔使介詞", p: "this / next / last / every 前面<b>唔使</b>介詞。<br>✅ See you next Monday.　❌ See you on next Monday.", ex: [] }
  ],
  ex: [
    { t: "mc", q: "The meeting starts ___ 9:30.", zh: "個會九點半開始。", o: ["in", "on", "at", "by"], a: 2, why: "準確鐘數用 at。" },
    { t: "mc", q: "My birthday is ___ March.", zh: "我生日喺三月。", o: ["in", "on", "at", "to"], a: 0, why: "月份用 in。" },
    { t: "fill", q: "We don't work ___ Sundays.", zh: "我哋星期日唔使返工。", a: ["on"], why: "星期幾用 on。" },
    { t: "mc", q: "I usually read ___ the evening.", zh: "我通常夜晚睇書。", o: ["at", "on", "in", "by"], a: 2, why: "in the morning / afternoon / evening（但係 at night）。" },
    { t: "mc", q: "I'll call you ___.", zh: "我下個星期一打畀你。", o: ["next Monday", "on next Monday", "at next Monday", "in next Monday"], a: 0, why: "next 前面唔使介詞。" },
    { t: "fill", q: "He was born ___ 1995.", zh: "佢喺 1995 年出世。", a: ["in"], why: "年份用 in。" },
    { t: "tiles", zh: "我哋星期五七點見啦。", a: "Let's meet at seven on Friday", extra: ["in", "night"], why: "鐘數用 at，星期幾用 on。" }
  ] },
{ id: 8, emoji: "💪", title: "情態動詞 can / should / must", en: "Modal Verbs",
  intro: [
    { h: "黃金規則", p: "情態動詞後面一定跟<b>動詞原形</b>，唔加 -s、唔加 to。<br>✅ She can swim.　❌ She cans swim.　❌ She can to swim.", ex: [] },
    { h: "can：能力／許可", p: "我識、我可以；否定 can't。", ex: [["I can speak English.", "我識講英文。"], ["Can I sit here?", "我可唔可以坐呢度？"]] },
    { h: "should：建議", p: "應該；否定 shouldn't（唔應該）。", ex: [["You should see a doctor.", "你應該去睇醫生。"]] },
    { h: "must：必須", p: "好強嘅規定；<b>mustn't = 唔准</b>。<br>⚠️ <b>don't have to = 唔使</b>（唔係唔准）。", ex: [["You must wear a seatbelt.", "你一定要綁安全帶。"], ["You don't have to come.", "你唔使嚟。"]] }
  ],
  ex: [
    { t: "mc", q: "You look tired. You ___ go to bed early.", zh: "你睇落好攰，你應該早啲瞓。", o: ["should", "mustn't", "can't", "shouldn't"], a: 0, why: "畀建議用 should。" },
    { t: "mc", q: "She can ___ three languages.", zh: "佢識講三種語言。", o: ["speaks", "speak", "to speak", "speaking"], a: 1, why: "can 後面跟動詞原形。" },
    { t: "mc", q: "You ___ eat or drink on the MTR. It's against the rules.", zh: "你唔准喺港鐵飲嘢食嘢，係違反規定。", o: ["mustn't", "don't have to", "should", "can"], a: 0, why: "禁止、唔准 → mustn't。" },
    { t: "fill", q: "___ I use your phone, please? (Can / Must)", zh: "我可唔可以用下你部電話？", a: ["can"], why: "請求許可用 Can I...?" },
    { t: "mc", q: "It's Sunday. You ___ go to work.", zh: "今日星期日，你唔使返工。", o: ["mustn't", "don't have to", "can't to", "should"], a: 1, why: "唔使 = don't have to；mustn't 係「唔准」。" },
    { t: "tiles", zh: "你應該飲多啲水。", a: "You should drink more water", extra: ["drinks", "to"], why: "should + 原形 drink。" },
    { t: "fill", q: "Students ___ wear uniform at school. (必須)", zh: "學生喺學校一定要著校服。", a: ["must", "have to"], why: "必須、規定 → must（或 have to）。" }
  ] }
];
