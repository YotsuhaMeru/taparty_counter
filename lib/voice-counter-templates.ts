export interface VoiceCounterTemplate {
  id: string;
  name: string;
  buttons: {
    [key: string]: string; // key: "button1", value: "ボタン名"
  };
}

export const voiceCounterTemplates: VoiceCounterTemplate[] = [
  {
    id: "meguru",
    name: "めぐる",
    buttons: {
      button1: "うんうん",
      button2: "よしっ",
      button3: "らんらんらーん",
      button4: "がんばってこ～",
      button5: "なんかめっちゃドキドキしてきた",
      button6: "今日はずっと一緒にいようね",
    },
  },
  {
    id: "sumire",
    name: "すみれ",
    buttons: {
      button1: "何かしら",
      button2: "その調子よ",
      button3: "私についてこられるかしら",
      button4: "もふもふ、もふもふもふもふ～",
      button5: "ううっ、なんだかすごくドキドキする",
      button6: "今日はもちろんずっと一緒にいてくれるのよね",
    },
  },
  {
    id: "haruka",
    name: "遥",
    buttons: {
      button1: "うんうん",
      button2: "やっほ～",
      button3: "がんばろうね",
      button4: "もしかして",
      button5: "しましまには拘りがあります",
      button6: "今日はずっと一緒にいてほしいな",
    },
  },
  {
    id: "aoi",
    name: "葵",
    buttons: {
      button1: "ごきげんよう",
      button2: "いかがですか",
      button3: "そうですね",
      button4: "怪しいですね",
      button5: "夢みたいです",
      button6: "今日はずっとお傍にいさせてくださいますか",
    },
  },
  {
    id: "kurumi",
    name: "クルミ",
    buttons: {
      button1: "ふんっ",
      button2: "何見てるの",
      button3: "ふーんなるほどね",
      button4: "チャハッチャハハッ",
      button5: "うぅ、ドキドキするおさまんないよ、もう",
      button6: "今日は絶対、あなたのこと帰さないんだから",
    },
  },
  {
    id: "tesla",
    name: "テスラ",
    buttons: {
      button1: "はいは～い",
      button2: "どうも～",
      button3: "あ、そういう感じですか",
      button4: "色々教えてあげますそう、色々とね",
      button5: "好きになっちゃったんだからしょうがないじゃないですか",
      button6: "今日はずっと一緒にいましょうね\nそう、ずっとですよ",
    },
  },
  {
    id: "nine",
    name: "ナイン",
    buttons: {
      button1: "異常なし",
      button2: "任務、継続",
      button3: "調査、開始",
      button4: "興味深い銘柄",
      button5: "あなたのこともっと知りたい",
      button6: "今日は、ずっと一緒にお願い",
    },
  },
  {
    id: "ririka",
    name: "リリカ",
    buttons: {
      button1: "あれぇ",
      button2: "にこっ",
      button3: "ふ～んふ～んふ～ん",
      button4: "ズンチャズンチャズンチャズンチャズンチャズンチャ",
      button5: "リリカのおやつあげるねずっとも、ってやつなのです",
      button6: "リリカ今日ぜーーったい帰んないもんねピッピロピ～～",
    },
  },
  {
    id: "eris",
    name: "エリス",
    buttons: {
      button1: "どうも～",
      button2: "苦しゅうない",
      button3: "ちょっと、気になるかも",
      button4: "わらわが面倒を見てやるわ",
      button5: "今日はい～っぱい楽しみましょ……ね",
      button6: "お主の椅子に接着剤を塗っておいた\nこれでもう…ふはは",
    },
  },
  {
    id: "salome",
    name: "サロメ",
    buttons: {
      button1: "ふーん",
      button2: "良きに計らえっしょ",
      button3: "キメるっしょ",
      button4: "なかなか楽しめそうっしょ",
      button5: "スタミナラーメンニンニクチャーシューましましで～",
      button6: "今日はずーっと私の下僕でいさせてやるっしょ～",
    },
  },
  {
    id: "veil",
    name: "ヴェイル",
    buttons: {
      button1: "どうもネ",
      button2: "えへへ…",
      button3: "がんばるのこと",
      button4: "ワン･ツー ワン･ツー",
      button5: "あなたのために心を込めて歌うね",
      button6: "今日はずっと一緒にいてくれるか？私なんだかおかしいね…",
    },
  },
  {
    id: "koromi",
    name: "ころ美",
    buttons: {
      button1: "平和だぱ～",
      button2: "何か用だぱ？",
      button3: "今日も元気に転ぶだぱ～",
      button4: "転ばぬ先の杖、とか喧嘩売ってるだぱ？",
      button5: "人生、転んでからが本番なところあるだぱ～",
      button6: "そこから動いたら、許さんだぱ…",
    },
  },
  {
    id: "yasamu",
    name: "やよい＆さつき＆娘",
    buttons: {
      button1: "どうなんだろうな～",
      button2: "何か事件はないかしら～",
      button3: "すぐ転んじゃうんです",
      button4: "思いっきり泳ぐぞ～",
      button5: "ツインエンジェルの正体ってもしかして",
      button6: "ぴ……ぴぴぴ、ピータン",
    },
  },
  {
    id: "chiyuura",
    name: "千代理＆優希＆麗",
    buttons: {
      button1: "やっほー",
      button2: "もう、まったくぅ",
      button3: "今日の運勢は\nふむふむ",
      button4: "マイペースでいきましょ",
      button5: "ゆーきのヒミツ教えてア・ゲ・ル",
      button6: "神は言った 幸せは目の前にあると",
    },
  },
  {
    id: "nishimea",
    name: "西条&メアリ",
    buttons: {
      button1: "気を引き締めなさい",
      button2: "フンフンフフ～ン",
      button3: "結婚、か…",
      button4: "ステップバイステップよん",
      button5: "補習のフルコース これもまた…愛",
      button6: "ラブフォーエバー…愛こそ、すべて",
    },
  },
  {
    id: "yuno",
    name: "ユーノ",
    buttons: {
      button1: "るんたるんた～",
      button2: "私あなたのこともっと知りたい、です",
      button3: "羨ましい、な……",
      button4: "どうやら、最悪の事態だけは免れたようですね",
      button5: "あなたの行く道が、光に溢れたものでありますように",
      button6: "やっと会えた…ずっと探してた、あなたに…",
    },
  },
  {
    id: "dou",
    name: "動物たち",
    buttons: {
      button1: "わん",
      button2: "ワンワン",
      button3: "わん～～～？？",
      button4: "ワーワワーンワーン",
      button5: "わんわんわんわんわん\n５回ワンって言った",
      button6: "ここ掘れ！(わんわん！)お宝いっぱ～い♪",
    },
  }
];

