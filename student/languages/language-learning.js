(function(){
'use strict';
const root=document.querySelector('[data-language-course]');
if(!root)return;
const lang=root.dataset.languageCourse;
const data={
chinese:{
name:'Mandarin Chinese',native:'中文 · 普通话',locale:'zh-CN',scriptName:'Pinyin initials/finals + common Hanzi',
intro:'বাংলা ব্যাখ্যাসহ Mandarin Chinese: Pinyin-এর সব মূল initials/finals, সাধারণ character, tone, শব্দ, বাক্য, পড়া ও লেখা। Chinese character-এর সংখ্যা অনেক; এখানে পূর্ণ Pinyin inventory এবং beginner-এর প্রয়োজনীয় বহুল-ব্যবহৃত character দেওয়া হয়েছে।',
letters:[
['b','b','ব্','Pinyin initial'],['p','p','প্ (বাতাসসহ)','Pinyin initial'],['m','m','ম্','Pinyin initial'],['f','f','ফ্','Pinyin initial'],['d','d','দ্/ত্','Pinyin initial'],['t','t','থ্/ত্ (বাতাসসহ)','Pinyin initial'],['n','n','ন্','Pinyin initial'],['l','l','ল্','Pinyin initial'],['g','g','গ্','Pinyin initial'],['k','k','খ্/ক্ (বাতাসসহ)','Pinyin initial'],['h','h','হ্/খ্','Pinyin initial'],['j','j','জি-র কাছাকাছি','Pinyin initial'],['q','q','ছি-র কাছাকাছি','Pinyin initial'],['x','x','শি-র কাছাকাছি','Pinyin initial'],['zh','zh','জ/ঝ-র মাঝামাঝি','Pinyin initial'],['ch','ch','ছ্ (জিহ্বা পেছনে)','Pinyin initial'],['sh','sh','শ্ (জিহ্বা পেছনে)','Pinyin initial'],['r','r','র/ঝ-র মাঝামাঝি','Pinyin initial'],['z','z','ৎস্','Pinyin initial'],['c','c','ছ্/ৎস্ (বাতাসসহ)','Pinyin initial'],['s','s','স্','Pinyin initial'],['y','y','ই/ইয়্','Pinyin spelling'],['w','w','উ/ওয়্','Pinyin spelling'],
['a','a','আ','Final'],['o','o','ও','Final'],['e','e','অ/এ-র মাঝামাঝি','Final'],['i','i','ই','Final'],['u','u','উ','Final'],['ü','ü','ঠোঁট গোল করে ই','Final'],['ai','ai','আই','Final'],['ei','ei','এই','Final'],['ao','ao','আও','Final'],['ou','ou','ওউ','Final'],['an','an','আন','Final'],['en','en','অ্‌ন','Final'],['ang','ang','আং','Final'],['eng','eng','অং','Final'],['ong','ong','ওং','Final'],['ia','ia','ইয়া','Final'],['ie','ie','ইয়ে','Final'],['iao','iao','ইয়াও','Final'],['iu','iu','ইয়ৌ','Final'],['ian','ian','ইয়েন','Final'],['in','in','ইন','Final'],['iang','iang','ইয়াং','Final'],['ing','ing','ইং','Final'],['iong','iong','ইয়োং','Final'],['ua','ua','উয়া','Final'],['uo','uo','ও/উও','Final'],['uai','uai','উআই','Final'],['ui','ui','উই','Final'],['uan','uan','উয়ান','Final'],['un','un','উন','Final'],['uang','uang','উয়াং','Final'],['üe','üe','ইউয়ে','Final'],['üan','üan','ইউয়েন','Final'],['ün','ün','ইউন','Final'],
['人','rén','রেন','মানুষ','Hanzi'],['口','kǒu','খৌ','মুখ','Hanzi'],['山','shān','শান','পাহাড়','Hanzi'],['日','rì','রি (retroflex)','সূর্য/দিন','Hanzi'],['月','yuè','ইউয়ে','চাঁদ/মাস','Hanzi'],['水','shuǐ','শুয়েই','পানি','Hanzi'],['火','huǒ','হুও','আগুন','Hanzi'],['木','mù','মু','গাছ/কাঠ','Hanzi'],['大','dà','তা','বড়','Hanzi'],['小','xiǎo','শিয়াও','ছোট','Hanzi'],['中','zhōng','ঝোং','মাঝে/চীন (প্রসঙ্গভেদে)','Hanzi'],['国','guó','গুও','দেশ','Hanzi'],['我','wǒ','ও','আমি','Hanzi'],['你','nǐ','নি','তুমি/আপনি','Hanzi'],['好','hǎo','হাও','ভালো','Hanzi'],['学','xué','শুয়ে','শেখা/পড়া','Hanzi'],['生','shēng','শেং','জন্ম/শিক্ষার্থী-শব্দাংশ','Hanzi'],['爱','ài','আই','ভালোবাসা','Hanzi'],['家','jiā','জিয়া','বাড়ি/পরিবার','Hanzi'],['书','shū','শু','বই','Hanzi']
],
vocab:[
['你好','nǐ hǎo','নি হাও','হ্যালো / নমস্কার'],['谢谢','xièxie','শিয়ে-শিয়ে','ধন্যবাদ'],['再见','zàijiàn','জাই-জিয়েন','বিদায়'],['请','qǐng','ছিং','অনুগ্রহ করে'],['对不起','duìbuqǐ','দুই-বু-ছি','দুঃখিত'],['没关系','méi guānxi','মেই গুয়ান-শি','কোনো সমস্যা নেই'],['是','shì','শি','হওয়া / হ্যাঁ (প্রসঙ্গভেদে)'],['不是','bú shì','বু শি','নয়'],['我','wǒ','ও','আমি'],['你','nǐ','নি','তুমি / আপনি'],['我们','wǒmen','ও-মেন','আমরা'],['他们','tāmen','থা-মেন','তারা'],['名字','míngzi','মিং-দ্‌জ্‌','নাম'],['我叫…','wǒ jiào…','ও জিয়াও','আমার নাম…'],['朋友','péngyou','পং-ইয়ৌ','বন্ধু'],['老师','lǎoshī','লাও-শি','শিক্ষক'],['学生','xuésheng','শুয়ে-শেং','শিক্ষার্থী'],['学校','xuéxiào','শুয়ে-শিয়াও','বিদ্যালয়'],['中国','Zhōngguó','ঝোং-গুও','চীন'],['孟加拉国','Mèngjiālāguó','মং-জিয়া-লা-গুও','বাংলাদেশ'],['水','shuǐ','শুয়েই','পানি'],['茶','chá','ছা','চা'],['饭','fàn','ফান','ভাত / খাবার'],['咖啡','kāfēi','কা-ফেই','কফি'],['书','shū','শু','বই'],['家','jiā','জিয়া','বাড়ি'],['今天','jīntiān','জিন-থিয়েন','আজ'],['明天','míngtiān','মিং-থিয়েন','আগামীকাল'],['现在','xiànzài','শিয়েন-জাই','এখন'],['时间','shíjiān','শি-জিয়েন','সময়'],['多少钱？','duōshao qián?','দুও-শাও ছিয়েন','কত দাম?'],['厕所在哪里？','cèsuǒ zài nǎlǐ?','ৎসে-সুও জাই না-লি','টয়লেট কোথায়?'],['我不懂。','wǒ bù dǒng','ও বু দোং','আমি বুঝি না।'],['请再说一次。','qǐng zài shuō yí cì','ছিং জাই শুও ই ছি','দয়া করে আরেকবার বলুন।'],['慢一点。','màn yìdiǎn','মান ই-দিয়েন','একটু ধীরে।'],['你好吗？','nǐ hǎo ma?','নি হাও মা','আপনি কেমন আছেন?'],['我很好。','wǒ hěn hǎo','ও হেন হাও','আমি ভালো আছি।'],['你叫什么名字？','nǐ jiào shénme míngzi?','নি জিয়াও শেন-মা মিং-দ্‌জ্‌','আপনার নাম কী?'],['我是学生。','wǒ shì xuésheng','ও শি শুয়ে-শেং','আমি শিক্ষার্থী।'],['我来自孟加拉国。','wǒ láizì Mèngjiālāguó','ও লাই-দ্‌জ্‌ মং-জিয়া-লা-গুও','আমি বাংলাদেশ থেকে এসেছি।'],['我想喝水。','wǒ xiǎng hē shuǐ','ও শিয়াং হ্য শুয়েই','আমি পানি পান করতে চাই।'],['我喜欢中文。','wǒ xǐhuan Zhōngwén','ও শি-হুয়ান ঝোং-ওয়েন','আমি চীনা ভাষা পছন্দ করি।'],['请问','qǐngwèn','ছিং-ওয়েন','একটু জানতে চাই / মাফ করবেন'],['哪里','nǎlǐ','না-লি','কোথায়'],['什么','shénme','শেন-মা','কী'],['为什么','wèishénme','ওয়েই-শেন-মা','কেন'],['多少','duōshao','দুও-শাও','কত'],['可以','kěyǐ','খা-ই','পারেন / সম্ভব'],['帮助','bāngzhù','বাং-ঝু','সাহায্য'],['医院','yīyuàn','ই-ইউয়েন','হাসপাতাল']
],
qas:null
},
korean:{
name:'Korean',native:'한국어',locale:'ko-KR',scriptName:'Hangul consonants and vowels',
intro:'বাংলা ব্যাখ্যাসহ Korean: Hangul-এর মূল ব্যঞ্জনবর্ণ, স্বরবর্ণ, যৌগিক স্বর, syllable block, batchim, শব্দ, বাক্য এবং লেখার অনুশীলন। বাংলা উচ্চারণ কেবল আনুমানিক সহায়তা।',
letters:[
['ㄱ','g/k','গ/ক','ব্যঞ্জন'],['ㄲ','kk','ক্ক (টানযুক্ত)','দ্বিত্ব ব্যঞ্জন'],['ㄴ','n','ন','ব্যঞ্জন'],['ㄷ','d/t','দ/ত','ব্যঞ্জন'],['ㄸ','tt','ত্ত (টানযুক্ত)','দ্বিত্ব ব্যঞ্জন'],['ㄹ','r/l','র/ল','ব্যঞ্জন'],['ㅁ','m','ম','ব্যঞ্জন'],['ㅂ','b/p','ব/প','ব্যঞ্জন'],['ㅃ','pp','প্প (টানযুক্ত)','দ্বিত্ব ব্যঞ্জন'],['ㅅ','s','স','ব্যঞ্জন'],['ㅆ','ss','স্‌স (টানযুক্ত)','দ্বিত্ব ব্যঞ্জন'],['ㅇ','ng/ silent','শুরুতে নীরব; শেষে ং','ব্যঞ্জন'],['ㅈ','j','জ','ব্যঞ্জন'],['ㅉ','jj','জ্জ (টানযুক্ত)','দ্বিত্ব ব্যঞ্জন'],['ㅊ','ch','ছ/চ (বাতাসসহ)','ব্যঞ্জন'],['ㅋ','k','খ/ক (বাতাসসহ)','ব্যঞ্জন'],['ㅌ','t','থ/ত (বাতাসসহ)','ব্যঞ্জন'],['ㅍ','p','ফ/প (বাতাসসহ)','ব্যঞ্জন'],['ㅎ','h','হ','ব্যঞ্জন'],
['ㅏ','a','আ','স্বর'],['ㅐ','ae','এ','স্বর'],['ㅑ','ya','ইয়া','স্বর'],['ㅒ','yae','ইয়ে','স্বর'],['ㅓ','eo','অ/ও-র মাঝামাঝি','স্বর'],['ㅔ','e','এ','স্বর'],['ㅕ','yeo','ইয়অ','স্বর'],['ㅖ','ye','ইয়ে','স্বর'],['ㅗ','o','ও','স্বর'],['ㅘ','wa','ওয়া','যৌগিক স্বর'],['ㅙ','wae','ওয়ে','যৌগিক স্বর'],['ㅚ','oe','ওয়ে/ঐ-র কাছাকাছি','যৌগিক স্বর'],['ㅛ','yo','ইয়ো','স্বর'],['ㅜ','u','উ','স্বর'],['ㅝ','wo','ওঅ','যৌগিক স্বর'],['ㅞ','we','ওয়ে','যৌগিক স্বর'],['ㅟ','wi','উই','যৌগিক স্বর'],['ㅠ','yu','ইউ','স্বর'],['ㅡ','eu','উ-ই মাঝামাঝি, ঠোঁট না গোল করে','স্বর'],['ㅢ','ui','উই/ঈ-র কাছাকাছি','যৌগিক স্বর'],['ㅣ','i','ই','স্বর'],
['가','ga/ka','গা/কা','Syllable block'],['나','na','না','Syllable block'],['다','da/ta','দা/তা','Syllable block'],['라','ra/la','রা/লা','Syllable block'],['마','ma','মা','Syllable block'],['바','ba/pa','বা/পা','Syllable block'],['사','sa','সা','Syllable block'],['아','a','আ','Syllable block'],['자','ja','জা','Syllable block'],['한','han','হান','Syllable block']
],
vocab:[
['안녕하세요','annyeonghaseyo','আন-নিয়ং-হা-সে-য়ো','হ্যালো / নমস্কার'],['감사합니다','gamsahamnida','কাম-সা-হাম-নি-দা','ধন্যবাদ'],['고맙습니다','gomapseumnida','কো-মাপ-সুম-নি-দা','ধন্যবাদ'],['안녕히 가세요','annyeonghi gaseyo','আন-নিয়ং-হি গা-সে-য়ো','বিদায় (যিনি যাচ্ছেন)'],['안녕히 계세요','annyeonghi gyeseyo','আন-নিয়ং-হি গে-সে-য়ো','বিদায় (যিনি থাকছেন)'],['죄송합니다','joesonghamnida','চোয়ে-সোং-হাম-নি-দা','দুঃখিত'],['괜찮아요','gwaenchanayo','কোয়েন-চা-না-য়ো','ঠিক আছে'],['네','ne','নে','হ্যাঁ'],['아니요','aniyo','আ-নি-য়ো','না'],['저','jeo','চঅ','আমি (ভদ্র)'],['나','na','না','আমি (অনানুষ্ঠানিক)'],['우리','uri','উ-রি','আমরা / আমাদের'],['이름','ireum','ই-রুম','নাম'],['제 이름은…','je ireumeun…','চে ই-রু-মুন','আমার নাম…'],['친구','chingu','ছিন-গু','বন্ধু'],['선생님','seonsaengnim','সন-সেং-নিম','শিক্ষক'],['학생','haksaeng','হাক-সেং','শিক্ষার্থী'],['학교','hakgyo','হাক-ক্যো','বিদ্যালয়'],['한국','Hanguk','হান-গুক','কোরিয়া'],['방글라데시','Banggeulladesi','বাং-গুল-লা-দে-শি','বাংলাদেশ'],['물','mul','মুল','পানি'],['차','cha','ছা/চা','চা / গাড়ি (প্রসঙ্গভেদে)'],['밥','bap','বাপ','ভাত / খাবার'],['커피','keopi','খঅ-পি','কফি'],['책','chaek','ছেক','বই'],['집','jip','জিপ','বাড়ি'],['오늘','oneul','ও-নুল','আজ'],['내일','naeil','নে-ইল','আগামীকাল'],['지금','jigeum','জি-গুম','এখন'],['시간','sigan','শি-গান','সময়'],['얼마예요?','eolmayeyo?','অল-মা-য়ে-য়ো','কত দাম?'],['화장실이 어디예요?','hwajangsiri eodiyeyo?','হোয়া-জাং-শি-রি অ-দি-য়ে-য়ো','টয়লেট কোথায়?'],['잘 모르겠어요.','jal moreugesseoyo','চাল মো-রু-গে-স-সঅ-য়ো','আমি ঠিক বুঝতে পারছি না।'],['다시 말해 주세요.','dasi malhae juseyo','তা-শি মাল-হে জু-সে-য়ো','আবার বলুন, দয়া করে।'],['천천히 말해 주세요.','cheoncheonhi malhae juseyo','ছন-ছন-হি মাল-হে জু-সে-য়ো','ধীরে বলুন, দয়া করে।'],['잘 지내세요?','jal jinaeseyo?','চাল জি-নে-সে-য়ো','আপনি ভালো আছেন?'],['잘 지내요.','jal jinaeyo','চাল জি-নে-য়ো','আমি ভালো আছি।'],['성함이 어떻게 되세요?','seonghami eotteoke doeseyo?','সঅং-হা-মি অ-ত্তঅ-খে তোয়ে-সে-য়ো','আপনার নাম কী? (ভদ্র)'],['저는 학생이에요.','jeoneun haksaeng-ieyo','চঅ-নুন হাক-সেং-ই-য়ে-য়ো','আমি শিক্ষার্থী।'],['방글라데시에서 왔어요.','Banggeulladesieseo wasseoyo','বাং-গুল-লা-দে-শি-এ-সঅ ওয়া-স-সঅ-য়ো','আমি বাংলাদেশ থেকে এসেছি।'],['물을 마시고 싶어요.','mureul masigo sipeoyo','মু-রুল মা-শি-গো শি-পঅ-য়ো','আমি পানি পান করতে চাই।'],['한국어를 좋아해요.','hangugeoreul joahaeyo','হান-গু-গঅ-রুল চো-আ-হে-য়ো','আমি কোরীয় ভাষা পছন্দ করি।'],['실례합니다','sillyehamnida','শিল-লে-হাম-নি-দা','মাফ করবেন / excuse me'],['어디','eodi','অ-দি','কোথায়'],['무엇','mueot','মু-অত','কী'],['왜','wae','ওয়ে','কেন'],['얼마','eolma','অল-মা','কত'],['가능해요','ganeunghaeyo','কা-নুং-হে-য়ো','সম্ভব / করা যায়'],['도와주세요','dowajuseyo','তো-ওয়া-জু-সে-য়ো','সাহায্য করুন'],['병원','byeongwon','ব্যং-ওন','হাসপাতাল'],['맛있어요','masisseoyo','মা-শি-স-সঅ-য়ো','সুস্বাদু']
],
qas:null
},
japanese:{
name:'Japanese',native:'日本語',locale:'ja-JP',scriptName:'Hiragana and Katakana',
intro:'বাংলা ব্যাখ্যাসহ Japanese: ৪৬টি মৌলিক Hiragana ও ৪৬টি Katakana, প্রচলিত romanisation, বাংলা উচ্চারণের আনুমানিক সহায়তা, শব্দ, বাক্য ও লেখার অনুশীলন। Kanji-এর সংখ্যা অনেক; এখানে beginner-এর সাধারণ kanji-ও দেওয়া হয়েছে।',
letters:[],
vocab:[
['こんにちは','konnichiwa','কোন্নিচিওয়া','হ্যালো / শুভদিন'],['おはようございます','ohayou gozaimasu','ওহায়ো গোযাইমাস','সুপ্রভাত (ভদ্র)'],['こんばんは','konbanwa','কোংবানওয়া','শুভ সন্ধ্যা'],['ありがとう','arigatou','আরিগাতো','ধন্যবাদ'],['ありがとうございます','arigatou gozaimasu','আরিগাতো গোযাইমাস','অনেক ধন্যবাদ (ভদ্র)'],['さようなら','sayounara','সায়োনারা','বিদায়'],['すみません','sumimasen','সুমিমাসেন','মাফ করবেন / দুঃখিত'],['ごめんなさい','gomennasai','গোমেননাসাই','দুঃখিত'],['はい','hai','হাই','হ্যাঁ'],['いいえ','iie','ইইয়ে','না'],['わたし','watashi','ওয়াতাশি','আমি'],['あなた','anata','আনাতা','আপনি / তুমি'],['わたしたち','watashitachi','ওয়াতাশিতাচি','আমরা'],['なまえ','namae','নামায়ে','নাম'],['わたしのなまえは…','watashi no namae wa…','ওয়াতাশি নো নামায়ে ওয়া','আমার নাম…'],['ともだち','tomodachi','তোমোদাচি','বন্ধু'],['せんせい','sensei','সেনসেই','শিক্ষক'],['がくせい','gakusei','গাকুসেই','শিক্ষার্থী'],['がっこう','gakkou','গাক্কো','বিদ্যালয়'],['にほん','nihon','নিহোন','জাপান'],['バングラデシュ','Banguradeshu','বাংগুরাদেশু','বাংলাদেশ'],['みず','mizu','মিজু','পানি'],['おちゃ','ocha','ওচা','চা'],['ごはん','gohan','গোহান','ভাত / খাবার'],['コーヒー','koohii','কোহি','কফি'],['ほん','hon','হোন','বই'],['いえ','ie','ইয়ে','বাড়ি'],['きょう','kyou','কিয়ো','আজ'],['あした','ashita','আশিতা','আগামীকাল'],['いま','ima','ইমা','এখন'],['じかん','jikan','জিকান','সময়'],['いくらですか？','ikura desu ka?','ইকুরা দেশু কা','কত দাম?'],['トイレはどこですか？','toire wa doko desu ka?','তোইরে ওয়া দোকো দেশু কা','টয়লেট কোথায়?'],['わかりません。','wakarimasen','ওয়াকারিমাসেন','আমি বুঝতে পারছি না।'],['もういちどおねがいします。','mou ichido onegaishimasu','মো ইচিদো ওনেগাইশিমাস','আরেকবার বলুন, দয়া করে।'],['ゆっくりはなしてください。','yukkuri hanashite kudasai','ইয়ুক্কুরি হানাশিতে কুদাসাই','ধীরে কথা বলুন।'],['おげんきですか？','ogenki desu ka?','ওগেনকি দেশু কা','আপনি কেমন আছেন?'],['げんきです。','genki desu','গেনকি দেশু','আমি ভালো আছি।'],['おなまえはなんですか？','onamae wa nan desu ka?','ওনামায়ে ওয়া নান দেশু কা','আপনার নাম কী?'],['わたしはがくせいです。','watashi wa gakusei desu','ওয়াতাশি ওয়া গাকুসেই দেশু','আমি শিক্ষার্থী।'],['バングラデシュからきました。','Banguradeshu kara kimashita','বাংগুরাদেশু কারা কিমাশিতা','আমি বাংলাদেশ থেকে এসেছি।'],['みずをのみたいです。','mizu o nomitai desu','মিজু ও নোমিতাই দেশু','আমি পানি পান করতে চাই।'],['にほんごがすきです。','nihongo ga suki desu','নিহোঙ্গো গা সুকি দেশু','আমি জাপানি ভাষা পছন্দ করি।'],['ちょっとすみません','chotto sumimasen','ছোত্তো সুমিমাসেন','একটু মাফ করবেন / excuse me'],['どこ','doko','দোকো','কোথায়'],['なに','nani','নানি','কী'],['どうして','doushite','দোশিতে','কেন'],['いくら','ikura','ইকুরা','কত'],['できます','dekimasu','দেকিমাস','পারি / সম্ভব'],['たすけてください','tasukete kudasai','তাসুকেতে কুদাসাই','দয়া করে সাহায্য করুন'],['びょういん','byouin','বিয়োইন','হাসপাতাল']
],
qas:null
}
};
const hira='あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん';
const kata='アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
const kanaRom=['a','i','u','e','o','ka','ki','ku','ke','ko','sa','shi','su','se','so','ta','chi','tsu','te','to','na','ni','nu','ne','no','ha','hi','fu','he','ho','ma','mi','mu','me','mo','ya','yu','yo','ra','ri','ru','re','ro','wa','wo','n'];
const kanaBn=['আ','ই','উ','এ','ও','কা','কি','কু','কে','কো','সা','শি','সু','সে','সো','তা','চি','ৎসু','তে','তো','না','নি','নু','নে','নো','হা','হি','ফু','হে','হো','মা','মি','মু','মে','মো','ইয়া','ইউ','ইয়ো','রা','রি','রু','রে','রো','ওয়া','ও','ন্'];
data.japanese.letters=hira.split('').map((c,i)=>[c,kanaRom[i],kanaBn[i],'Hiragana']).concat(kata.split('').map((c,i)=>[c,kanaRom[i],kanaBn[i],'Katakana']),[['が','ga','গা','Voiced kana'],['ぎ','gi','গি','Voiced kana'],['ぐ','gu','গু','Voiced kana'],['げ','ge','গে','Voiced kana'],['ご','go','গো','Voiced kana'],['ざ','za','জা','Voiced kana'],['じ','ji','জি','Voiced kana'],['ず','zu','জু','Voiced kana'],['ぜ','ze','জে','Voiced kana'],['ぞ','zo','জো','Voiced kana'],['だ','da','দা','Voiced kana'],['ぢ','ji','জি (কম ব্যবহৃত)','Voiced kana'],['づ','zu','জু (কম ব্যবহৃত)','Voiced kana'],['で','de','দে','Voiced kana'],['ど','do','দো','Voiced kana'],['ば','ba','বা','Voiced kana'],['び','bi','বি','Voiced kana'],['ぶ','bu','বু','Voiced kana'],['べ','be','বে','Voiced kana'],['ぼ','bo','বো','Voiced kana'],['ぱ','pa','পা','Voiced kana'],['ぴ','pi','পি','Voiced kana'],['ぷ','pu','পু','Voiced kana'],['ぺ','pe','পে','Voiced kana'],['ぽ','po','পো','Voiced kana'],['きゃ','kya','ক্যা','Contracted sound'],['きゅ','kyu','ক্যু','Contracted sound'],['きょ','kyo','ক্যো','Contracted sound'],['しゃ','sha','শা','Contracted sound'],['しゅ','shu','শু','Contracted sound'],['しょ','sho','শো','Contracted sound'],['ちゃ','cha','চা','Contracted sound'],['ちゅ','chu','চু','Contracted sound'],['ちょ','cho','চো','Contracted sound'],['っ','small tsu','পরের ব্যঞ্জন দ্বিত্ব হয়','Small kana'],['ー','long vowel mark','স্বর দীর্ঘ করে (বিশেষত Katakana)','Long-vowel mark'],['日','にち / hi','নিচি / হি','Kanji; reading depends on word'],['人','ひと / じん','হিতো / জিন','Kanji; reading depends on word'],['山','やま / さん','ইয়ামা / সান','Kanji; reading depends on word'],['水','みず / すい','মিজু / সুই','Kanji; reading depends on word'],['本','ほん','হোন','Kanji; book/origin depending on compound']]);
const makeQA=(vocab)=>{const out=[];vocab.forEach(v=>{out.push({q:'“'+v[0]+'” শব্দ/বাক্যটির বাংলা অর্থ কী?',a:v[3],direction:'target-to-bengali'});out.push({q:'বাংলা “'+v[3]+'” বলতে কী বলবেন?',a:v[0]+' ('+v[1]+')',direction:'bengali-to-target'});});return out;};
Object.keys(data).forEach(k=>data[k].qas=makeQA(data[k].vocab));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=id=>document.getElementById(id);
const letterBody=$('letterRows');
const vocabBody=$('vocabRows');
const listen=$('listenWord');
const qaRoot=$('qaList');
const filter=$('scriptFilter');
const search=$('vocabSearch');
const writer=$('writingPanel');
const selectedInfo=$('selectedInfo');
function renderLetters(){
 const term=(filter.value||'').trim().toLowerCase();
 const rows=data[lang].letters.filter(x=>!term||x.join(' ').toLowerCase().includes(term));
 letterBody.innerHTML=rows.map((x,i)=>'<tr><td><button type="button" class="glyph-button" data-glyph="'+esc(x[0])+'" data-roman="'+esc(x[1])+'" data-bn="'+esc(x[2])+'" data-kind="'+esc(x[3])+'">'+esc(x[0])+'</button></td><td>'+esc(x[1])+'</td><td>'+esc(x[2])+'</td><td>'+esc(x[3])+'</td></tr>').join('');
 letterBody.querySelectorAll('[data-glyph]').forEach(b=>b.addEventListener('click',()=>showWriting(b.dataset.glyph,b.dataset.roman,b.dataset.bn,b.dataset.kind)));
 $('scriptCount').textContent=rows.length+' item(s) shown of '+data[lang].letters.length+'. Tap any character to open its writing guide.';
}
function renderVocab(){
 const term=(search.value||'').trim().toLowerCase();
 const rows=data[lang].vocab.filter(x=>!term||x.join(' ').toLowerCase().includes(term));
 vocabBody.innerHTML=rows.map(x=>'<tr><td><button type="button" class="glyph-button word-button" data-glyph="'+esc(x[0])+'" data-roman="'+esc(x[1])+'" data-bn="'+esc(x[2])+'" data-kind="Vocabulary">'+esc(x[0])+'</button></td><td>'+esc(x[1])+'</td><td>'+esc(x[2])+'</td><td>'+esc(x[3])+'</td><td><button type="button" class="listen-one" data-say="'+esc(x[0])+'">▶</button></td></tr>').join('');
 vocabBody.querySelectorAll('[data-glyph]').forEach(b=>b.addEventListener('click',()=>showWriting(b.dataset.glyph,b.dataset.roman,b.dataset.bn,b.dataset.kind)));
 vocabBody.querySelectorAll('[data-say]').forEach(b=>b.addEventListener('click',()=>speak(b.dataset.say)));
 listen.innerHTML=data[lang].vocab.map((x,i)=>'<option value="'+i+'">'+esc(x[0]+' — '+x[3])+'</option>').join('');
 $('vocabCount').textContent=data[lang].vocab.length+' words and phrases. All listed items are available in the Listen dropdown.';
}
function renderQAs(){
 qaRoot.innerHTML=data[lang].qas.map((x,i)=>'<details class="qa-item"><summary><strong>Q'+(i+1)+'.</strong> '+esc(x.q)+'</summary><div class="answer"><strong>Answer:</strong> '+esc(x.a)+'<p class="muted">Direction: '+(x.direction==='target-to-bengali'?'Target language → বাংলা':'বাংলা → target language')+'</p></div></details>').join('');
 $('qaCount').textContent=data[lang].qas.length+' question-and-answer items available ('+data[lang].vocab.length+' in each translation direction).';
}
function showWriting(glyph,roman,bn,kind){
 selectedInfo.innerHTML='<strong>Selected:</strong> '+esc(glyph)+' <span class="muted">· '+esc(kind)+'</span><br><strong>Romanisation:</strong> '+esc(roman)+'<br><strong>বাংলা উচ্চারণ (আনুমানিক):</strong> '+esc(bn);
 writer.hidden=false;
 $('traceGlyph').textContent=glyph;
 $('traceGlyph').setAttribute('aria-label','Trace '+glyph);
 $('writingTitle').textContent='Writing guide: '+glyph;
 $('writingNotes').textContent=lang==='chinese'?'Trace the character carefully from its light guide. General principles: top before bottom, left before right, horizontal before vertical in common patterns, and outside before inside. Exact stroke order varies by character.':lang==='korean'?'Trace the jamo or syllable block. Hangul blocks are arranged by vowel shape; write each jamo in its conventional stroke order and keep the block balanced.': 'Trace the kana or kanji in the guide. Kana usually follows established stroke order; kanji readings and stroke order depend on the character. This trace board supports practice but is not a substitute for a verified per-stroke reference.';
 clearPad();
 writer.scrollIntoView({behavior:'smooth',block:'nearest'});
}
function speak(text){
 const status=$('listenStatus');
 if(!('speechSynthesis'in window)||!('SpeechSynthesisUtterance'in window)){status.textContent='Speech playback is not supported in this browser. Use a device/browser with a compatible '+data[lang].locale+' voice.';return;}
 window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=data[lang].locale;u.rate=.82;
 u.onstart=()=>status.textContent='Playing '+data[lang].locale+' pronunciation…';
 u.onend=()=>status.textContent='Playback finished. Repeat the item and compare it with the written form.';
 u.onerror=()=>status.textContent='Playback failed or no compatible voice is installed. Try another browser/device with a '+data[lang].locale+' voice.';
 window.speechSynthesis.speak(u);
}
$('listenButton').addEventListener('click',()=>{const v=data[lang].vocab[Number(listen.value)];if(v)speak(v[0]);});
$('listenReverseButton').addEventListener('click',()=>{const v=data[lang].vocab[Number(listen.value)];if(v){$('listenStatus').textContent='বাংলা অর্থ: '+v[3]+' · '+v[2];}});
filter.addEventListener('input',renderLetters);search.addEventListener('input',renderVocab);
$('revealAll').addEventListener('click',()=>qaRoot.querySelectorAll('details').forEach(d=>d.open=true));
$('hideAll').addEventListener('click',()=>qaRoot.querySelectorAll('details').forEach(d=>d.open=false));
$('qaSearch').addEventListener('input',function(){const t=this.value.trim().toLowerCase();qaRoot.querySelectorAll('.qa-item').forEach(d=>d.hidden=!d.textContent.toLowerCase().includes(t));});
const canvas=$('traceCanvas'),ctx=canvas.getContext('2d');let drawing=false,last=null;
function fitCanvas(){const ratio=window.devicePixelRatio||1;const w=canvas.clientWidth||600;const h=canvas.clientHeight||260;canvas.width=w*ratio;canvas.height=h*ratio;ctx.setTransform(ratio,0,0,ratio,0,0);ctx.lineWidth=4;ctx.lineCap='round';ctx.lineJoin='round';drawGrid();}
function drawGrid(){const w=canvas.clientWidth,h=canvas.clientHeight;ctx.clearRect(0,0,w,h);ctx.strokeStyle='#d9e4ef';ctx.lineWidth=1;ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(w/2,0);ctx.lineTo(w/2,h);ctx.moveTo(0,h/2);ctx.lineTo(w,h/2);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#e1e8ef';ctx.font='170px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText($('traceGlyph').textContent,w/2,h/2+6);}
function point(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
canvas.addEventListener('pointerdown',e=>{drawing=true;last=point(e);canvas.setPointerCapture(e.pointerId);ctx.strokeStyle='#0956a8';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(last.x,last.y);});
canvas.addEventListener('pointermove',e=>{if(!drawing)return;const p=point(e);ctx.lineTo(p.x,p.y);ctx.stroke();last=p;});
['pointerup','pointercancel','lostpointercapture'].forEach(n=>canvas.addEventListener(n,()=>{drawing=false;last=null;}));
function clearPad(){drawGrid();}
$('clearTrace').addEventListener('click',clearPad);
window.addEventListener('resize',fitCanvas);
renderLetters();renderVocab();renderQAs();fitCanvas();
})();