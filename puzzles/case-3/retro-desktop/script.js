(function(){
  function initPDARetroDesktop(){
    const root = document.getElementById('pda-retro-desktop-1');
    if (!root || root.dataset.ready === '1') return;
    root.dataset.ready = '1';

  // Puzzle 1 stars website, opened in the "Star Archive" browser window. Change these to the real addresses.
  const STAR_SITE = {
    en: 'https://pdacases.com/star-archive/',
    ar: 'https://pdacases.com/ar/star-archive/'
  };
  // Mouse and keyboard sounds, modelled on a real mouse switch and keyboard key: a tiny noise "strike" rings
  // through the plastic's resonances. Rendered once, then replayed with slight pitch changes so no two clicks match.
  const clickSounds = (() => {
    const SR = 44100, bufs = {};
    let ctx = null;
    function strike(c, at, modes, hp, burst, body = 1){
      const len = Math.ceil(SR * burst), buf = c.createBuffer(1, len, SR), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
      const src = c.createBufferSource(); src.buffer = buf;
      const high = c.createBiquadFilter(); high.type = 'highpass'; high.frequency.value = hp;
      src.connect(high);
      const tick = c.createGain(); tick.gain.value = 0.4; high.connect(tick).connect(c.destination);
      modes.forEach(([f, g, ring]) => {
        const q = Math.PI * f * ring;
        const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q;
        const amp = c.createGain(); amp.gain.value = g * Math.sqrt(q) * body;
        high.connect(bp).connect(amp).connect(c.destination);
      });
      src.start(at);
    }
    const recipes = {
      down: [0.06, c => strike(c, 0, [[3100, 1, 0.012], [5300, 0.55, 0.008], [1700, 0.35, 0.01]], 1500, 0.0012)],
      up:   [0.05, c => strike(c, 0, [[3600, 1, 0.008], [6100, 0.4, 0.006]], 2200, 0.001, 0.6)],
      key:  [0.09, c => { strike(c, 0, [[1900, 1, 0.018], [3400, 0.5, 0.01]], 900, 0.002); strike(c, 0.012, [[320, 1, 0.03], [750, 0.5, 0.02]], 120, 0.003, 0.7); }]
    };
    const levels = { down: 0.22, up: 0.13, key: 0.2 };
    Object.entries(recipes).forEach(([key, [dur, build]]) => {
      const c = new OfflineAudioContext(1, Math.ceil(SR * dur), SR);
      build(c);
      c.startRendering().then(buf => {
        const d = buf.getChannelData(0); let peak = 0;
        for (let i = 0; i < d.length; i++) peak = Math.max(peak, Math.abs(d[i]));
        if (peak) for (let i = 0; i < d.length; i++) d[i] /= peak;
        bufs[key] = buf;
      }).catch(() => {});
    });
    return key => {
      if (!bufs[key]) return;
      ctx = ctx || new AudioContext();
      if (ctx.state === 'suspended') ctx.resume();
      const src = ctx.createBufferSource(), gain = ctx.createGain();
      src.buffer = bufs[key]; src.playbackRate.value = 0.95 + Math.random() * 0.1;
      gain.gain.value = levels[key];
      src.connect(gain).connect(ctx.destination); src.start();
    };
  })();
  root.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && e.button === 0) clickSounds('down'); }, true);
  root.addEventListener('pointerup', e => { if (e.pointerType === 'mouse' && e.button === 0) clickSounds('up'); }, true);
  root.addEventListener('keydown', e => { if (!e.repeat && (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter')) clickSounds('key'); }, true);

  // Start in Arabic when the page address is /ar/… (or ends in /ar, or has ?lang=ar)
  const startLang = (/^\/ar(\/|$)|\/ar\/?$/.test(location.pathname) || new URLSearchParams(location.search).get('lang') === 'ar') ? 'ar' : 'en';

  const i18n = {
    en: {
      myComputer: "My Computer",
      caseFiles: "Case Files",
      notepad: "Notepad",
      calculator: "Calculator",
      mail: "Mail",
      recycleBin: "Recycle Bin",
      starArchive: "Star Archive",
      browserBack: "Back", browserReload: "Reload", address: "Address",
      starOffline: "The Star Archive could not be reached. Try Reload.",
      start: "Start",
      pdaDesk: "PDA DESK",
      aboutComp: "About this computer",
      shutDown: "Shut Down...",
      refresh: "Refresh",
      newFolder: "New Folder",
      properties: "Properties",
      file: "File", edit: "Edit", view: "View", search: "Search", mailbox: "Mailbox", help: "Help",
      save: "Save", clear: "Clear",
      notepadStatus: "Text editor • local simulated file",
      savedDisk: "Saved to simulated disk.",
      defaultNote: `PDA FIELD NOTES\n\nThis is a simulated 1990s workstation.\n\nLook through the Case Files folder.\nSome files contain information that may\nbe useful later.\n`,
      calcClear: "Clear",
      back: "↩ Back",
      compStatus: "4 objects • Local simulated drive",
      searchFiles: "Search files...",
      caseStatus: (n) => `${n} file${n === 1 ? '' : 's'} • Double-click a file to open it`,
      createdFolder: (name) => `Created ${name} (simulated).`,
      inbox: "📥 INBOX",
      mailRefresh: "Refresh",
      markAllRead: "Mark All Read",
      selectMsg: "Select a message to read it.",
      mailStatus: (total, unread, reading) => `${total} messages • ${unread} unread${reading ? ' • Reading: ' + reading : ''}`,
      inboxRefreshed: "Inbox refreshed",
      allRead: "All messages marked read",
      from: "From:", date: "Date:",
      restrictedArch: "Restricted Archive",
      authOnly: "Authorized personnel only.",
      passcode: "Passcode", unlock: "Unlock",
      hint: "Hint: Read the other case records.",
      archLocked: "Archive locked.",
      accessGranted: `<span class="warning">ACCESS GRANTED</span><br><br>ARCHIVE NOTE\n\nThe museum file is connected to the year 1990.\nNubara research notes contain an older reference: 1960.\n\nEnd of record.`,
      accessDenied: "ACCESS DENIED.",
      binEmpty: "The Recycle Bin is empty.",
      close: "Close",
      aboutTitle: "About PDA Desktop",
      aboutDesc: "A fictional retro workstation for an interactive mystery experience.",
      aboutSys: "System: PDA-DOS<br>CPU: 486 DX2<br>Memory: 16 MB<br>Display: VGA<br>Status: READY",
      shutDownTitle: "Shut Down Windows",
      shutDownMsg: "It is now safe to close this browser tab.",
      cancel: "Cancel",
      noFiles: "No files.",
      langBtn: "عربي"
    },
    ar: {
      myComputer: "جهاز الكمبيوتر",
      caseFiles: "ملفات القضايا",
      notepad: "المفكرة",
      calculator: "الآلة الحاسبة",
      mail: "البريد",
      recycleBin: "سلة المهملات",
      starArchive: "أرشيف النجوم",
      browserBack: "رجوع", browserReload: "تحديث", address: "العنوان",
      starOffline: "تعذّر الوصول إلى أرشيف النجوم. اضغط تحديث.",
      start: "ابدأ",
      pdaDesk: "مكتب PDA",
      aboutComp: "حول هذا الكمبيوتر",
      shutDown: "إيقاف التشغيل...",
      refresh: "تحديث",
      newFolder: "مجلد جديد",
      properties: "الخصائص",
      file: "ملف", edit: "تعديل", view: "عرض", search: "بحث", mailbox: "صندوق البريد", help: "تعليمات",
      save: "حفظ", clear: "مسح",
      notepadStatus: "محرر النصوص • ملف محاكى محلياً",
      savedDisk: "تم الحفظ في القرص المحاكى.",
      defaultNote: `ملاحظات ميدانية - PDA\n\nهذه محاكاة لمحطة عمل من التسعينات.\n\nتصفح مجلد ملفات القضايا.\nتحتوي بعض الملفات على معلومات قد\nتكون مفيدة لاحقاً.\n`,
      calcClear: "مسح",
      back: "↩ رجوع",
      compStatus: "4 عناصر • محرك أقراص محاكى محلياً",
      searchFiles: "بحث في الملفات...",
      caseStatus: (n) => `${n} ملفات • انقر مرتين على الملف لفتحه`,
      createdFolder: (name) => `تم إنشاء ${name} (محاكاة).`,
      inbox: "📥 الوارد",
      mailRefresh: "تحديث",
      markAllRead: "تحديد الكل كأقراء",
      selectMsg: "اختر رسالة لقراءتها.",
      mailStatus: (total, unread, reading) => `${total} رسائل • ${unread} غير مقروءة${reading ? ' • قراءة: ' + reading : ''}`,
      inboxRefreshed: "تم تحديث صندوق البريد",
      allRead: "تم تحديد جميع الرسائل كأقراء",
      from: "من:", date: "التاريخ:",
      restrictedArch: "أرشيف محظور",
      authOnly: "للموظفين المصرح لهم فقط.",
      passcode: "رمز المرور", unlock: "فتح",
      hint: "تلميح: اقرأ سجلات القضايا الأخرى.",
      archLocked: "الأرشيف مغلق.",
      accessGranted: `<span class="warning">تم منح الوصول</span><br><br>ملاحظة الأرشيف\n\nملف المتحف مرتبط بعام 1990.\nتحتوي ملاحظات بحث نوبارة على مرجع أقدم: 1960.\n\nنهاية السجل.`,
      accessDenied: "تم رفض الوصول.",
      binEmpty: "سلة المهملات فارغة.",
      close: "إغلاق",
      aboutTitle: "حول مكتب PDA",
      aboutDesc: "محطة عمل قديمة خيالية لتجربة تفاعلية غامضة.",
      aboutSys: "النظام: PDA-DOS<br>المعالج: 486 DX2<br>الذاكرة: 16 ميجابايت<br>الشاشة: VGA<br>الحالة: جاهز",
      shutDownTitle: "إيقاف تشغيل ويندوز",
      shutDownMsg: "يمكنك الآن إغلاق تبويب المتصفح بأمان.",
      cancel: "إلغاء",
      noFiles: "لا توجد ملفات.",
      langBtn: "English"
    }
  };

  const filesData = [
    {
      id: 'FIELD_LOG',
      name: { en: 'FIELD_LOG.TXT', ar: 'سجل_الميدان.TXT' },
      icon: '📄',
      text: {
        en: 'FIELD LOG\n\nDate: 18 MAR 1990\nLocation: Gardner Museum\n\nThe case archive contains notes, names and timestamps.\nSome records are incomplete.',
        ar: 'سجل الميدان\n\nالتاريخ: 18 مارس 1990\nالموقع: متحف غاردنر\n\nيحتوي أرشيف القضية على ملاحظات وأسماء وأختام زمنية.\nبعض السجلات غير مكتملة.'
      }
    },
    {
      id: 'SUSPECTS',
      name: { en: 'SUSPECTS.TXT', ar: 'المشتبه_بهم.TXT' },
      icon: '📄',
      text: {
        en: 'SUSPECT LIST\n\nWILLIAM ANDERSON\nEVAN ANDERSON\nLARRY LAWRENCE\nJULIAN ROBERT\n\nStatus: Restricted',
        ar: 'قائمة المشتبه بهم\n\nويليام أندرسون\nإيفان أندرسون\nلاري لورانس\nجوليان روبرت\n\nالحالة: محظور'
      }
    },
    {
      id: 'PHOTO_01',
      name: { en: 'PHOTO_01.BMP', ar: 'صورة_01.BMP' },
      icon: '🖼️',
      text: {
        en: 'IMAGE VIEWER\n\n[SIMULATED BLACK & WHITE PHOTOGRAPH]\n\nEvidence image unavailable in this prototype.',
        ar: 'عارض الصور\n\n[صورة محاكاة بالأبيض والأسود]\n\nصورة الدليل غير متاحة في هذا النموذج الأولي.'
      }
    },
    {
      id: 'MESSAGE',
      name: { en: 'MESSAGE.MSG', ar: 'رسالة.MSG' },
      icon: '✉️',
      text: {
        en: 'INCOMING MESSAGE\n\nCheck the old hotel record.\nThe time matters more than the name.\n\n— A.',
        ar: 'رسالة واردة\n\nتحقق من سجل الفندق القديم.\nالوقت أهم من الاسم.\n\n— أ.'
      }
    },
    {
      id: 'ARCHIVE',
      name: { en: 'ARCHIVE.DAT', ar: 'الأرشيف.DAT' },
      icon: '💾',
      text: {
        en: 'ARCHIVE DATA\n\nA hidden record may be unlocked by entering the correct passcode.\n\nPASSCODE: 1960',
        ar: 'بيانات الأرشيف\n\nيمكن فتح سجل مخفي بإدخال رمز المرور الصحيح.\n\nرمز المرور: 1960'
      }
    }
  ];

  const emailsData = [
    {
      id: 1, unread: true,
      sender: { en: 'Arthur Cole', ar: 'آرثر كول' },
      address: 'arthur.cole@pda.local',
      subject: { en: 'The hotel room', ar: 'غرفة الفندق' },
      date: '19 Sep 1992 01:14',
      body: {
        en: `I checked the record again.\n\nThe room number is correct, but the entry time is not.\nSomeone wanted the log to look ordinary.\n\nDo not trust the first timestamp.`,
        ar: `تحققت من السجل مرة أخرى.\n\nرقم الغرفة صحيح، لكن وقت الدخول ليس كذلك.\nأراد شخص ما أن يبدو السجل عاديًا.\n\nلا تثق بالختم الزمني الأول.`
      }
    },
    {
      id: 2, unread: true,
      sender: { en: 'Helen Moore', ar: 'هيلين مور' },
      address: 'helen.moore@pda.local',
      subject: { en: 'Missing envelope', ar: 'الظرف المفقود' },
      date: '19 Sep 1992 02:03',
      body: {
        en: `The envelope from the archive is gone.\n\nIt was in the blue cabinet yesterday.\nThere is no sign of forced entry.\n\nWhoever took it already knew where to look.`,
        ar: `الظرف المأخوذ من الأرشيف قد اختفى.\n\nكان في الخزانة الزرقاء بالأمس.\nلا توجد أي علامات على الاقتحام بالقوة.\n\nمن أخذه كان يعلم بالفعل أين يبحث.`
      }
    },
    {
      id: 3, unread: true,
      sender: { en: 'Unknown Sender', ar: 'مرسل مجهول' },
      address: 'unknown@private.local',
      subject: { en: 'STOP LOOKING', ar: 'توقف عن البحث' },
      date: '19 Sep 1992 07:42',
      body: {
        en: `You are following the wrong file.\n\nLeave the hotel records alone.\n\nThis is your only warning.`,
        ar: `أنت تتبع الملف الخاطئ.\n\nاترك سجلات الفندق وشأنها.\n\nهذا هو تحذيرك الوحيد.`
      }
    },
    {
      id: 4, unread: false,
      sender: { en: 'Richard Adler', ar: 'ريتشارد أدلر' },
      address: 'r.adler@pda.local',
      subject: { en: 'Archive reference', ar: 'مرجع الأرشيف' },
      date: '19 Sep 1992 08:16',
      body: {
        en: `Found a reference to an older case.\n\nThe number 1960 appears repeatedly beside the museum notes.\nIt may be an archive key rather than a date.\n\nKeep this between us.`,
        ar: `عثرت على مرجع لقضية أقدم.\n\nيظهر الرقم 1960 بشكل مكرر بجانب ملاحظات المتحف.\nقد يكون مفتاح أرشيف بدلاً من تاريخ.\n\nأبقِ هذا بيننا.`
      }
    },
    {
      id: 5, unread: true,
      sender: { en: 'M. Cooper', ar: 'م. كوبر' },
      address: 'm.cooper@pda.local',
      subject: { en: 'Do not call the office', ar: 'لا تتصل بالمكتب' },
      date: '19 Sep 1992 10:05',
      body: {
        en: `Use this mailbox only.\n\nThe office line is not secure tonight.\nI will send another message when I know who is watching the desk.`,
        ar: `استخدم صندوق البريد هذا فقط.\n\nخط المكتب غير آمن الليلة.\nسأرسل رسالة أخرى عندما أكتشف من يراقب المكتب.`
      }
    },
    {
      id: 6, unread: false,
      sender: { en: 'Loreen Taylor', ar: 'لورين تايلور' },
      address: 'l.taylor@pda.local',
      subject: { en: 'The photograph', ar: 'الصورة الفوتوغرافية' },
      date: '19 Sep 1992 13:27',
      body: {
        en: `The photograph has been enlarged.\n\nThere is a second figure reflected in the glass.\nI cannot identify the person yet.\n\nCheck the left side of the frame.`,
        ar: `تم تكبير الصورة الفوتوغرافية.\n\nهناك شخصية ثانية منعكسة في الزجاج.\nلا يمكنني تحديد هوية الشخص بعد.\n\nتحقق من الجانب الأيسر من الإطار.`
      }
    },
    {
      id: 7, unread: true,
      sender: { en: 'William Anderson', ar: 'ويليام أندرسون' },
      address: 'w.anderson@pda.local',
      subject: { en: 'Field note', ar: 'ملاحظة ميدانية' },
      date: '19 Sep 1992 20:11',
      body: {
        en: `I am recording this privately.\n\nThe hallway was empty when I arrived, but the elevator log says otherwise.\nSomeone entered the floor at 8:07 PM.\n\nNo name was attached to the entry.`,
        ar: `أسجل هذا بشكل خاص.\n\nكان الممر فارغًا عندما وصلت، لكن سجل المصعد يقول غير ذلك.\nدخل شخص ما الطابق في الساعة 8:07 مساءً.\n\nلم يتم إرفاق أي اسم مع الدخول.`
      }
    },
    {
      id: 8, unread: false,
      sender: { en: 'System Administrator', ar: 'مسؤول النظام' },
      address: 'admin@pda.local',
      subject: { en: 'Mailbox maintenance', ar: 'صيانة صندوق البريد' },
      date: '20 Sep 1992 00:02',
      body: {
        en: `Routine maintenance completed.\n\nNo user files were deleted.\nTen messages are currently stored in the sample mailbox.\n\n— PDA Systems`,
        ar: `اكتملت الصيانة الروتينية.\n\nلم يتم حذف أي ملفات للمستخدم.\nتوجد عشر رسائل مخزنة حاليًا في صندوق البريد النموذجي.\n\n— أنظمة PDA`
      }
    },
    {
      id: 9, unread: true,
      sender: { en: 'A. Mercer', ar: 'أ. ميرسر' },
      address: 'a.mercer@pda.local',
      subject: { en: 'Look behind the frame', ar: 'انظر خلف الإطار' },
      date: '20 Sep 1992 06:31',
      body: {
        en: `There is something behind the old frame in the library.\n\nDo not remove it until you photograph the back first.\nThe handwriting on the paper may be important.`,
        ar: `هناك شيء خلف الإطار القديم في المكتبة.\n\nلا تقم بإزالته حتى تلتقط صورة للظهر أولاً.\nقد يكون الخط اليدوي على الورقة مهمًا.`
      }
    },
    {
      id: 10, unread: false,
      sender: { en: 'Unknown Sender', ar: 'مرسل مجهول' },
      address: 'noreply@private.local',
      subject: { en: 'End of the line', ar: 'نهاية المطاف' },
      date: '20 Sep 1992 07:00',
      body: {
        en: `You have enough pieces now.\n\nThe rest is in the case file.\n\nDo what the evidence tells you.`,
        ar: `لديك ما يكفي من القطع الآن.\n\nالباقي موجود في ملف القضية.\n\nافعل ما تخبرك به الأدلة.`
      }
    }
  ];

  const readmeText = {
    en: `PDA DESKTOP README\n\nWelcome.\n\nThis computer is entirely simulated in your browser.\nNothing is written to the visitor's real computer.\n\nSuggested route:\n1. Open Case Files.\n2. Read FIELD_LOG.TXT.\n3. Read SUSPECTS.TXT.\n4. Open MESSAGE.MSG.\n5. Inspect ARCHIVE.DAT.\n\nThe prototype is designed to be adapted into a full\ndetective puzzle interface with custom clues, audio,\nimages, login systems and evidence screens.\n\nTranslation:\nUse the "عربي" button in any window title bar or the taskbar to switch between Arabic and English.`,
    ar: `ملف التعليمات - مكتب PDA\n\nأهلاً بك.\n\nهذا الكمبيوتر محاكى بالكامل داخل متصفحك.\nلا يتم كتابة أي شيء على جهاز الزائر الحقيقي.\n\nالمسار المقترح:\n1. افتح ملفات القضايا.\n2. اقرأ سجل_الميدان.TXT.\n3. اقرأ المشتبه_بهم.TXT.\n4. افتح رسالة.MSG.\n5. افحص الأرشيف.DAT.\n\nتم تصميم هذا النموذج ليتكيف مع واجهة لغز تحقيقي كاملة\nمع أدلة مخصصة وأصوات وصور وأنظمة تسجيل دخول وشاشات أدلة.\n\nالترجمة:\nاستخدم زر "English" أو "عربي" في شريط عنوان أي نافذة أو شريط المهام للتبديل بين العربية والإنجليزية.`
  };

  const state = {
    lang: 'en',
    nextWindowId: 1,
    z: 20,
    windows: new Map(),
    folders: ['CASE FILES', 'PERSONAL', 'SYSTEM'],
    note: {
      en: i18n.en.defaultNote,
      ar: i18n.ar.defaultNote
    },
    calculator: '0'
  };

  const desktop = root.querySelector('#desktop-area');
  const startBtn = root.querySelector('#start-btn');
  const startMenu = root.querySelector('#start-menu');
  const contextMenu = root.querySelector('#context-menu');
  const taskButtons = root.querySelector('#task-buttons');
  const taskLangBtn = root.querySelector('#task-lang-btn');
  const clock = root.querySelector('#clock');

  function esc(s){
    return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  function focusWindow(w){
    state.z++;
    w.style.zIndex = state.z;
    state.windows.forEach(v => v.el.classList.remove('active'));
    w.classList.add('active');
  }

  function setLanguage(newLang){
    state.lang = newLang;
    const isAr = state.lang === 'ar';
    root.classList.toggle('rtl', isAr);

    // Desktop icons
    root.querySelectorAll('.desktop-icon').forEach(btn => {
      const key = btn.dataset.open;
      const span = btn.querySelector('span:not(.icon-img)');
      if(span){
        if(key==='computer') span.textContent = i18n[state.lang].myComputer;
        else if(key==='cases') span.textContent = i18n[state.lang].caseFiles;
        else if(key==='notepad') span.textContent = i18n[state.lang].notepad;
        else if(key==='calculator') span.textContent = i18n[state.lang].calculator;
        else if(key==='mail') span.textContent = i18n[state.lang].mail;
        else if(key==='recycle') span.textContent = i18n[state.lang].recycleBin;
        else if(key==='stars') span.textContent = i18n[state.lang].starArchive;
      }
    });

    // Start Menu
    const startHead = root.querySelector('.start-head');
    if(startHead) startHead.textContent = i18n[state.lang].pdaDesk;
    
    startBtn.innerHTML = `<span class="start-logo">▣</span> ${i18n[state.lang].start}`;

    startMenu.querySelectorAll('.start-link').forEach(btn => {
      const key = btn.dataset.open || btn.id;
      const icon = btn.querySelector('span')?.outerHTML || '';
      if(key==='computer') btn.innerHTML = icon + i18n[state.lang].myComputer;
      else if(key==='cases') btn.innerHTML = icon + i18n[state.lang].caseFiles;
      else if(key==='notepad') btn.innerHTML = icon + i18n[state.lang].notepad;
      else if(key==='calculator') btn.innerHTML = icon + i18n[state.lang].calculator;
      else if(key==='mail') btn.innerHTML = icon + i18n[state.lang].mail;
      else if(key==='stars') btn.innerHTML = icon + i18n[state.lang].starArchive;
      else if(key==='about-btn') btn.innerHTML = icon + i18n[state.lang].aboutComp;
      else if(key==='shutdown-btn') btn.innerHTML = icon + i18n[state.lang].shutDown;
    });

    // Context Menu
    const ctxRefresh = root.querySelector('#ctx-refresh');
    const ctxNew = root.querySelector('#ctx-new');
    const ctxAbout = root.querySelector('#ctx-about');
    if(ctxRefresh) ctxRefresh.textContent = i18n[state.lang].refresh;
    if(ctxNew) ctxNew.textContent = i18n[state.lang].newFolder;
    if(ctxAbout) ctxAbout.textContent = i18n[state.lang].properties;

    // Taskbar Lang Button
    if(taskLangBtn) taskLangBtn.textContent = state.lang === 'en' ? 'عربي' : 'English';

    // Refresh Windows
    state.windows.forEach(rec => refreshWindow(rec));
  }

  function refreshWindow(rec){
    if(!rec) return;
    const type = rec.type;
    const w = rec.el;
    const isAr = state.lang === 'ar';

    const translateBtn = w.querySelector('.translate-btn');
    if(translateBtn){
      translateBtn.textContent = isAr ? 'English' : 'عربي';
      translateBtn.title = isAr ? 'Switch to English' : 'Translate to Arabic';
    }

    if(type === 'notepad'){
      const fileData = rec.fileData;
      let title = i18n[state.lang].notepad;
      if(fileData) title = fileData.name[state.lang];
      w.querySelector('.title').textContent = title;
      rec.title = title;
      if(rec.task) rec.task.textContent = title;

      const menuBar = w.querySelector('.menu-bar');
      if(menuBar){
        menuBar.children[0].textContent = i18n[state.lang].file;
        menuBar.children[1].textContent = i18n[state.lang].edit;
        menuBar.children[2].textContent = i18n[state.lang].search;
      }

      const ta = w.querySelector('textarea');
      if(ta && !rec.userEdited){
        if(fileData) ta.value = fileData.text[state.lang];
        else ta.value = state.note[state.lang];
      }

      const saveBtn = w.querySelector('.save-note');
      const clearBtn = w.querySelector('.clear-note');
      if(saveBtn) saveBtn.textContent = i18n[state.lang].save;
      if(clearBtn) clearBtn.textContent = i18n[state.lang].clear;

      const status = w.querySelector('.status');
      if(status) status.textContent = i18n[state.lang].notepadStatus;
    }else if(type === 'computer'){
      w.querySelector('.title').textContent = i18n[state.lang].myComputer;
      rec.title = i18n[state.lang].myComputer;
      if(rec.task) rec.task.textContent = rec.title;

      const menuBar = w.querySelector('.menu-bar');
      if(menuBar){
        menuBar.children[0].textContent = i18n[state.lang].file;
        menuBar.children[1].textContent = i18n[state.lang].edit;
        menuBar.children[2].textContent = i18n[state.lang].view;
        menuBar.children[3].textContent = i18n[state.lang].help;
      }

      const navBtn = w.querySelector('[data-nav="cdrive"]');
      if(navBtn) navBtn.textContent = i18n[state.lang].back;

      const fileList = w.querySelector('.file-list');
      if(fileList){
        fileList.innerHTML = `
          <div class="file" data-open="cases"><span class="ficon">📁</span><span>${i18n[state.lang].caseFiles}</span></div>
          <div class="file" data-open="personal"><span class="ficon">📁</span><span>${isAr ? 'شخصي' : 'PERSONAL'}</span></div>
          <div class="file" data-open="system"><span class="ficon">📁</span><span>${isAr ? 'النظام' : 'SYSTEM'}</span></div>
          <div class="file" data-open="readme"><span class="ficon">📄</span><span>README.TXT</span></div>
        `;
        bindComputer(w);
      }

      const status = w.querySelector('.status');
      if(status) status.textContent = i18n[state.lang].compStatus;
    }else if(type === 'cases'){
      w.querySelector('.title').textContent = i18n[state.lang].caseFiles;
      rec.title = i18n[state.lang].caseFiles;
      if(rec.task) rec.task.textContent = rec.title;

      const menuBar = w.querySelector('.menu-bar');
      if(menuBar){
        menuBar.children[0].textContent = i18n[state.lang].file;
        menuBar.children[1].textContent = i18n[state.lang].view;
        menuBar.children[2].textContent = i18n[state.lang].help;
      }

      const searchInput = w.querySelector('#file-search');
      if(searchInput) searchInput.placeholder = i18n[state.lang].searchFiles;

      const newFolderBtn = w.querySelector('#new-folder');
      if(newFolderBtn) newFolderBtn.textContent = i18n[state.lang].newFolder;

      bindCases(w);
    }else if(type === 'mail'){
      const titleStr = i18n[state.lang].mail + ' — ' + (isAr ? 'الوارد' : 'Inbox');
      w.querySelector('.title').textContent = titleStr;
      rec.title = titleStr;
      if(rec.task) rec.task.textContent = titleStr;

      const menuBar = w.querySelector('.menu-bar');
      if(menuBar){
        menuBar.children[0].textContent = i18n[state.lang].file;
        menuBar.children[1].textContent = i18n[state.lang].mailbox;
        menuBar.children[2].textContent = i18n[state.lang].view;
        menuBar.children[3].textContent = i18n[state.lang].help;
      }

      const folderEl = w.querySelector('.mail-folder');
      if(folderEl) folderEl.textContent = i18n[state.lang].inbox;

      const refreshBtn = w.querySelector('#mail-refresh');
      if(refreshBtn) refreshBtn.textContent = i18n[state.lang].mailRefresh;

      const markAllBtn = w.querySelector('#mail-mark-all');
      if(markAllBtn) markAllBtn.textContent = i18n[state.lang].markAllRead;

      bindMail(w);
    }else if(type === 'calculator'){
      w.querySelector('.title').textContent = i18n[state.lang].calculator;
      rec.title = i18n[state.lang].calculator;
      if(rec.task) rec.task.textContent = rec.title;

      const clearBtn = w.querySelector('[data-key="C"]');
      if(clearBtn) clearBtn.textContent = i18n[state.lang].calcClear;
    }else if(type === 'archive'){
      const titleStr = filesData.find(f => f.id === 'ARCHIVE').name[state.lang] + ' — ' + (isAr ? 'محظور' : 'Restricted');
      w.querySelector('.title').textContent = titleStr;
      rec.title = titleStr;
      if(rec.task) rec.task.textContent = titleStr;

      const h3 = w.querySelector('h3');
      if(h3) h3.textContent = i18n[state.lang].restrictedArch;

      const authDiv = w.querySelector('.login-auth');
      if(authDiv) authDiv.textContent = i18n[state.lang].authOnly;

      const passcodeInp = w.querySelector('#passcode');
      if(passcodeInp) passcodeInp.placeholder = i18n[state.lang].passcode;

      const unlockBtn = w.querySelector('#unlock');
      if(unlockBtn) unlockBtn.textContent = i18n[state.lang].unlock;

      const hintDiv = w.querySelector('.hint');
      if(hintDiv) hintDiv.textContent = i18n[state.lang].hint;

      const msgDiv = w.querySelector('#login-msg');
      if(msgDiv && !msgDiv.classList.contains('unlocked')){
        msgDiv.textContent = i18n[state.lang].archLocked;
      }else if(msgDiv && msgDiv.classList.contains('unlocked')){
        msgDiv.innerHTML = i18n[state.lang].accessGranted;
      }
    }else if(type === 'recycle'){
      w.querySelector('.title').textContent = i18n[state.lang].recycleBin;
      rec.title = i18n[state.lang].recycleBin;
      if(rec.task) rec.task.textContent = rec.title;

      const p = w.querySelector('p');
      if(p) p.textContent = i18n[state.lang].binEmpty;

      const closeBtn = w.querySelector('#restore-bin');
      if(closeBtn) closeBtn.textContent = i18n[state.lang].close;
    }else if(type === 'about'){
      w.querySelector('.title').textContent = i18n[state.lang].aboutTitle;
      rec.title = i18n[state.lang].aboutTitle;
      if(rec.task) rec.task.textContent = rec.title;

      const bevel = w.querySelector('.bevel');
      if(bevel){
        bevel.innerHTML = `
          <h3 style="margin:0 0 8px">PDA Desktop 1.0</h3>
          <div>${i18n[state.lang].aboutDesc}</div>
          <hr>
          <div class="mono">${i18n[state.lang].aboutSys}</div>
        `;
      }
    }else if(type === 'stars'){
      w.querySelector('.title').textContent = i18n[state.lang].starArchive;
      rec.title = i18n[state.lang].starArchive;
      if(rec.task) rec.task.textContent = rec.title;
      w.querySelector('[data-browser="back"]').textContent = '◀ ' + i18n[state.lang].browserBack;
      w.querySelector('[data-browser="reload"]').textContent = '↻ ' + i18n[state.lang].browserReload;
      w.querySelector('.browser-label').textContent = i18n[state.lang].address;
      const frame = w.querySelector('iframe');
      if(frame.dataset.lang !== state.lang){
        frame.dataset.lang = state.lang;
        loadStarSite(frame, state.lang);
        w.querySelector('.browser-address').value = STAR_SITE[state.lang];
      }
    }else if(type === 'shutdown'){
      w.querySelector('.title').textContent = i18n[state.lang].shutDownTitle;
      rec.title = i18n[state.lang].shutDownTitle;
      if(rec.task) rec.task.textContent = rec.title;

      const p = w.querySelector('p');
      if(p) p.textContent = i18n[state.lang].shutDownMsg;

      const cancelBtn = w.querySelector('#cancel-shutdown');
      if(cancelBtn) cancelBtn.textContent = i18n[state.lang].cancel;
    }
  }

  function makeWindow(title, content, opts={}){
    const id = 'win-' + state.nextWindowId++;
    const w = document.createElement('section');
    w.className = 'window';
    w.dataset.id = id;
    w.style.left = (opts.left ?? 190) + 'px';
    w.style.top = (opts.top ?? 70) + 'px';
    w.style.width = (opts.width ?? 470) + 'px';
    if (opts.height) w.style.height = opts.height + 'px';
    
    const langBtnLabel = state.lang === 'en' ? 'عربي' : 'English';
    const langBtnTitle = state.lang === 'en' ? 'Translate to Arabic' : 'Switch to English';

    w.innerHTML = `
      <div class="titlebar">
        <div class="title">${esc(title)}</div>
        <div class="win-btns">
          <button class="win-btn" type="button" data-action="min" title="Minimize">_</button>
          <button class="win-btn" type="button" data-action="max" title="Maximize">□</button>
          <button class="win-btn" type="button" data-action="close" title="Close">×</button>
        </div>
      </div>
      <div class="window-body">${content}</div>
    `;
    desktop.appendChild(w);
    const rec = {id, title, el:w, type: opts.type, fileData: opts.fileData, userEdited: false, minimized:false, maximized:false};
    state.windows.set(id, rec);
    addTaskButton(rec);
    focusWindow(w);

    w.addEventListener('mousedown', () => focusWindow(w));

    const titlebar = w.querySelector('.titlebar');

    titlebar.addEventListener('pointerdown', e => {
      if(e.target.closest('button')) e.stopPropagation();
    });

    titlebar.addEventListener('click', e => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;

      e.preventDefault();
      e.stopPropagation();

      const action = btn.dataset.action;
      if (action === 'close') closeWindow(id);
      else if (action === 'min') minimizeWindow(id);
      else if (action === 'max') toggleMax(id);
      else if (action === 'translate') setLanguage(state.lang === 'en' ? 'ar' : 'en');
    });

    makeDraggable(w, w.querySelector('.titlebar'));
    if (opts.afterOpen) opts.afterOpen(w, rec);
    return rec;
  }

  function addTaskButton(rec){
    const b = document.createElement('button');
    b.className = 'retro-btn task-btn';
    b.type = 'button';
    b.textContent = rec.title;
    b.addEventListener('click', () => {
      if (rec.minimized) {
        rec.el.style.display = '';
        rec.minimized = false;
        focusWindow(rec.el);
      } else {
        focusWindow(rec.el);
      }
    });
    rec.task = b;
    taskButtons.appendChild(b);
  }

  function closeWindow(id){
    const rec = state.windows.get(id);
    if (!rec) return;
    rec.el.remove();
    rec.task?.remove();
    state.windows.delete(id);
  }

  function minimizeWindow(id){
    const rec = state.windows.get(id);
    if (!rec) return;
    rec.minimized = true;
    rec.el.style.display = 'none';
  }

  function toggleMax(id){
    const rec = state.windows.get(id);
    if (!rec) return;
    rec.maximized = !rec.maximized;
    rec.el.classList.toggle('maximized', rec.maximized);
    if (!rec.maximized){
      rec.el.style.left = rec.restore?.left || '190px';
      rec.el.style.top = rec.restore?.top || '70px';
      rec.el.style.width = rec.restore?.width || '470px';
      if (rec.restore?.height) rec.el.style.height = rec.restore.height;
    } else {
      rec.restore = {
        left: rec.el.style.left, top: rec.el.style.top, width: rec.el.style.width,
        height: rec.el.style.height
      };
    }
  }

  function makeDraggable(w, handle){
    let dragging = false, sx=0, sy=0, ox=0, oy=0;
    handle.addEventListener('pointerdown', e => {
      if (e.target.closest('.win-btns')) return;
      if (w.classList.contains('maximized')) return;
      dragging = true;
      handle.setPointerCapture?.(e.pointerId);
      sx = e.clientX; sy = e.clientY;
      ox = parseInt(w.style.left,10) || 0;
      oy = parseInt(w.style.top,10) || 0;
      focusWindow(w);
      e.preventDefault();
    });
    handle.addEventListener('pointermove', e => {
      if (!dragging) return;
      let nx = ox + e.clientX - sx;
      let ny = oy + e.clientY - sy;
      const wr = w.getBoundingClientRect();
      nx = Math.max(4, Math.min(nx, root.clientWidth - wr.width - 6));
      ny = Math.max(4, Math.min(ny, root.clientHeight - 39));
      w.style.left = nx + 'px';
      w.style.top = ny + 'px';
    });
    handle.addEventListener('pointerup', () => dragging = false);
    handle.addEventListener('pointercancel', () => dragging = false);
  }

  function openNotepad(initialText=null, title=null, fileData=null){
    const activeText = initialText || state.note[state.lang];
    const activeTitle = title || i18n[state.lang].notepad;

    return makeWindow(activeTitle, `
      <div class="menu-bar">
        <div class="menu-item">${i18n[state.lang].file}</div>
        <div class="menu-item">${i18n[state.lang].edit}</div>
        <div class="menu-item">${i18n[state.lang].search}</div>
      </div>
      <textarea aria-label="Notepad text">${esc(activeText)}</textarea>
      <div class="toolbar">
        <button class="retro-btn save-note" type="button">${i18n[state.lang].save}</button>
        <button class="retro-btn clear-note" type="button">${i18n[state.lang].clear}</button>
      </div>
      <div class="status">${i18n[state.lang].notepadStatus}</div>
    `, {
      type: 'notepad',
      fileData: fileData,
      width: 500,
      height: 410,
      afterOpen:(w, rec)=>{
        const ta = w.querySelector('textarea');
        ta.addEventListener('input', () => rec.userEdited = true);
        w.querySelector('.save-note').addEventListener('click', ()=>{
          state.note[state.lang] = ta.value;
          w.querySelector('.status').textContent = i18n[state.lang].savedDisk;
        });
        w.querySelector('.clear-note').addEventListener('click', ()=>{
          ta.value = '';
          rec.userEdited = true;
          ta.focus();
        });
      }
    });
  }

  function openCalculator(){
    let expr = '';
    const rec = makeWindow(i18n[state.lang].calculator, `
      <div class="calc">
        <div class="calc-display" id="calc-display">0</div>
        <div class="calc-grid">
          <button class="retro-btn" data-key="7" type="button">7</button><button class="retro-btn" data-key="8" type="button">8</button><button class="retro-btn" data-key="9" type="button">9</button><button class="retro-btn" data-key="/" type="button">÷</button>
          <button class="retro-btn" data-key="4" type="button">4</button><button class="retro-btn" data-key="5" type="button">5</button><button class="retro-btn" data-key="6" type="button">6</button><button class="retro-btn" data-key="*" type="button">×</button>
          <button class="retro-btn" data-key="1" type="button">1</button><button class="retro-btn" data-key="2" type="button">2</button><button class="retro-btn" data-key="3" type="button">3</button><button class="retro-btn" data-key="-" type="button">−</button>
          <button class="retro-btn" data-key="0" type="button">0</button><button class="retro-btn" data-key="." type="button">.</button><button class="retro-btn" data-key="=" type="button">=</button><button class="retro-btn" data-key="+" type="button">+</button>
          <button class="retro-btn" data-key="C" type="button" style="grid-column:1 / -1">${i18n[state.lang].calcClear}</button>
        </div>
      </div>
    `,{type: 'calculator', width:275,height:315});
    const display = rec.el.querySelector('#calc-display');
    function render(){ display.textContent = expr || '0'; }
    rec.el.querySelectorAll('[data-key]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const k=btn.dataset.key;
        if(k==='C'){expr='';render();return}
        if(k==='='){
          try{
            if(!/^[0-9+*/. ()-]+$/.test(expr)) throw new Error();
            const value = Function('"use strict";return ('+expr+')')();
            expr = Number.isFinite(value) ? String(value) : '';
          }catch{expr='Error'}
          render(); return;
        }
        if(expr==='Error') expr='';
        expr += k;
        if(expr.length>22) expr=expr.slice(0,22);
        render();
      });
    });
    return rec;
  }

  function openComputer(){
    const isAr = state.lang === 'ar';
    return makeWindow(i18n[state.lang].myComputer, `
      <div class="menu-bar">
        <div class="menu-item">${i18n[state.lang].file}</div>
        <div class="menu-item">${i18n[state.lang].edit}</div>
        <div class="menu-item">${i18n[state.lang].view}</div>
        <div class="menu-item">${i18n[state.lang].help}</div>
      </div>
      <div class="toolbar"><button class="retro-btn" data-nav="cdrive" type="button">${i18n[state.lang].back}</button><span class="mono">C:\\</span></div>
      <div class="bevel file-list">
        <div class="file" data-open="cases"><span class="ficon">📁</span><span>${i18n[state.lang].caseFiles}</span></div>
        <div class="file" data-open="personal"><span class="ficon">📁</span><span>${isAr ? 'شخصي' : 'PERSONAL'}</span></div>
        <div class="file" data-open="system"><span class="ficon">📁</span><span>${isAr ? 'النظام' : 'SYSTEM'}</span></div>
        <div class="file" data-open="readme"><span class="ficon">📄</span><span>README.TXT</span></div>
      </div>
      <div class="status">${i18n[state.lang].compStatus}</div>
    `,{type: 'computer', width:510,height:370,afterOpen:bindComputer});
  }

  function bindComputer(w){
    w.querySelectorAll('.file').forEach(f=>{
      f.addEventListener('dblclick',()=>openTarget(f.dataset.open));
      f.addEventListener('click',()=>focusWindow(w));
    });
  }

  function openCases(){
    return makeWindow(i18n[state.lang].caseFiles, `
      <div class="menu-bar">
        <div class="menu-item">${i18n[state.lang].file}</div>
        <div class="menu-item">${i18n[state.lang].view}</div>
        <div class="menu-item">${i18n[state.lang].help}</div>
      </div>
      <div class="toolbar">
        <input id="file-search" type="text" placeholder="${i18n[state.lang].searchFiles}" aria-label="Search files">
        <button class="retro-btn" id="new-folder" type="button">${i18n[state.lang].newFolder}</button>
      </div>
      <div class="bevel file-list" id="case-file-list"></div>
      <div class="status" id="case-status"></div>
    `,{type: 'cases', width:600,height:420,afterOpen:bindCases});
  }

  function bindCases(w){
    const list=w.querySelector('#case-file-list'), search=w.querySelector('#file-search'), status=w.querySelector('#case-status');
    function draw(q=''){
      list.innerHTML='';
      filesData.filter(f=>f.name[state.lang].toLowerCase().includes(q.toLowerCase())).forEach(f=>{
        const el=document.createElement('div');el.className='file';el.dataset.file=f.id;
        el.innerHTML=`<span class="ficon">${f.icon}</span><span>${esc(f.name[state.lang])}</span>`;
        el.addEventListener('dblclick',()=>openFile(f));
        list.appendChild(el);
      });
      status.textContent=i18n[state.lang].caseStatus(list.children.length);
    }
    search.addEventListener('input',()=>draw(search.value));
    w.querySelector('#new-folder').onclick = ()=>{
      const name = (state.lang === 'ar' ? 'مجلد جديد ' : 'NEW FOLDER ') + (state.folders.length+1);
      state.folders.push(name);
      status.textContent = i18n[state.lang].createdFolder(name);
    };
    draw();
  }

  function openFile(fileData){
    if(fileData.id==='ARCHIVE') return openArchive();
    return openNotepad(fileData.text[state.lang], fileData.name[state.lang], fileData);
  }

  function openMail(){
    const isAr = state.lang === 'ar';
    return makeWindow(i18n[state.lang].mail + ' — ' + (isAr ? 'الوارد' : 'Inbox'), `
      <div class="menu-bar">
        <div class="menu-item">${i18n[state.lang].file}</div>
        <div class="menu-item">${i18n[state.lang].mailbox}</div>
        <div class="menu-item">${i18n[state.lang].view}</div>
        <div class="menu-item">${i18n[state.lang].help}</div>
      </div>
      <div class="mail-toolbar">
        <div class="mail-folder">${i18n[state.lang].inbox}</div>
        <button class="retro-btn" id="mail-refresh" type="button">${i18n[state.lang].mailRefresh}</button>
        <button class="retro-btn" id="mail-mark-all" type="button">${i18n[state.lang].markAllRead}</button>
      </div>
      <div class="mail-layout">
        <div class="mail-list" id="mail-list"></div>
        <div class="mail-reader bevel" id="mail-reader">
          <div class="centered" style="padding:55px 10px">
            <div style="font-size:34px">✉️</div>
            <p>${i18n[state.lang].selectMsg}</p>
          </div>
        </div>
      </div>
      <div class="status" id="mail-status"></div>
    `,{type: 'mail', width:790,height:520,afterOpen:bindMail});
  }

  function bindMail(w){
    const list = w.querySelector('#mail-list');
    const reader = w.querySelector('#mail-reader');
    const status = w.querySelector('#mail-status');

    function renderList(){
      list.innerHTML='';
      emailsData.forEach(mail=>{
        const item=document.createElement('button');
        item.type='button';
        item.className='mail-item' + (mail.unread ? ' unread' : '');
        item.dataset.id=mail.id;
        item.innerHTML=`
          <div class="mail-row-top">
            <span class="mail-sender">${esc(mail.sender[state.lang])}</span>
            <span class="mail-date">${esc(mail.date)}</span>
          </div>
          <div class="mail-subject">${mail.unread ? '● ' : ''}${esc(mail.subject[state.lang])}</div>
          <div class="mail-preview">${esc(mail.body[state.lang].split('\n').find(Boolean) || '')}</div>
        `;
        item.addEventListener('click',()=>openMailMessage(mail));
        list.appendChild(item);
      });
      const unread = emailsData.filter(m=>m.unread).length;
      status.textContent = i18n[state.lang].mailStatus(emailsData.length, unread);
    }

    function openMailMessage(mail){
      emailsData.forEach(m=>m.selected=false);
      mail.selected=true;
      mail.unread=false;

      list.querySelectorAll('.mail-item').forEach(item=>{
        item.classList.toggle('selected', Number(item.dataset.id)===mail.id);
        item.classList.toggle('unread', emailsData.find(m=>m.id===Number(item.dataset.id))?.unread);
        const m=emailsData.find(x=>x.id===Number(item.dataset.id));
        const subject=item.querySelector('.mail-subject');
        if(subject) subject.innerHTML = `${m.unread ? '● ' : ''}${esc(m.subject[state.lang])}`;
      });

      reader.innerHTML=`
        <div class="mail-reader-head">
          <div class="mail-reader-subject">${esc(mail.subject[state.lang])}</div>
          <div class="mail-reader-meta">
            <b>${i18n[state.lang].from}</b> ${esc(mail.sender[state.lang])} &lt;${esc(mail.address)}&gt;<br>
            <b>${i18n[state.lang].date}</b> ${esc(mail.date)}
          </div>
        </div>
        <div class="mail-reader-body">${esc(mail.body[state.lang])}</div>
      `;

      const unread = emailsData.filter(m=>m.unread).length;
      status.textContent = i18n[state.lang].mailStatus(emailsData.length, unread, mail.subject[state.lang]);
    }

    w.querySelector('#mail-refresh').onclick = ()=>{
      renderList();
      status.textContent = i18n[state.lang].inboxRefreshed;
    };

    w.querySelector('#mail-mark-all').onclick = ()=>{
      emailsData.forEach(m=>m.unread=false);
      renderList();
      status.textContent = i18n[state.lang].allRead;
    };

    renderList();
    openMailMessage(emailsData[0]);
  }

  function openArchive(){
    const archiveFile = filesData.find(f => f.id === 'ARCHIVE');
    const isAr = state.lang === 'ar';
    return makeWindow(archiveFile.name[state.lang] + ' — ' + (isAr ? 'محظور' : 'Restricted'), `
      <div class="login">
        <h3>${i18n[state.lang].restrictedArch}</h3>
        <div class="bevel">
          <div class="login-auth">${i18n[state.lang].authOnly}</div>
          <div class="login-row">
            <input id="passcode" type="password" inputmode="numeric" placeholder="${i18n[state.lang].passcode}" aria-label="Archive passcode">
            <button class="retro-btn" id="unlock" type="button">${i18n[state.lang].unlock}</button>
          </div>
          <div class="hint">${i18n[state.lang].hint}</div>
          <div id="login-msg" class="status">${i18n[state.lang].archLocked}</div>
        </div>
      </div>
    `,{type: 'archive', width:420,height:270,afterOpen:w=>{
      const input=w.querySelector('#passcode'), btn=w.querySelector('#unlock'), msg=w.querySelector('#login-msg');
      function unlock(){
        if(input.value.trim()==='1960'){
          msg.innerHTML = i18n[state.lang].accessGranted;
          msg.classList.add('bevel', 'unlocked');
        }else{
          msg.textContent = i18n[state.lang].accessDenied;
          msg.classList.remove('unlocked');
        }
      }
      btn.addEventListener('click',unlock);
      input.addEventListener('keydown',e=>{if(e.key==='Enter') unlock()});
      input.focus();
    }});
  }

  function openRecycle(){
    return makeWindow(i18n[state.lang].recycleBin, `
      <div class="centered" style="padding:28px 8px">
        <div style="font-size:44px">🗑️</div>
        <p>${i18n[state.lang].binEmpty}</p>
        <button class="retro-btn" id="restore-bin" type="button">${i18n[state.lang].close}</button>
      </div>
    `,{type: 'recycle', width:320,height:220,afterOpen:w=>w.querySelector('#restore-bin').addEventListener('click',()=>{
      closeWindow(w.closest('.window').dataset.id);
    })});
  }

  function openAbout(){
    return makeWindow(i18n[state.lang].aboutTitle, `
      <div class="bevel">
        <h3 style="margin:0 0 8px">PDA Desktop 1.0</h3>
        <div>${i18n[state.lang].aboutDesc}</div>
        <hr>
        <div class="mono">${i18n[state.lang].aboutSys}</div>
      </div>
    `,{type: 'about', width:360,height:260});
  }

  // pdacases.com forbids showing its pages inside a frame (frame-ancestors 'none'), so the window
  // fetches the stars page and shows its content directly (srcdoc) instead of pointing the frame at it.
  async function loadStarSite(frame, lang){
    const url = STAR_SITE[lang];
    frame.dataset.lang = lang;
    try {
      const res = await fetch(url, { credentials: 'same-origin' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      let html = await res.text();
      html = html.replace(/<script id="pda-puzzle-extras">[\s\S]*?<\/script>/i, ''); // the site's floating EN/عربي switch belongs to the desktop page, not this window
      const head = '<base href="' + esc(url) + '">' +
        (lang === 'ar' ? '<script>document.documentElement.lang="ar";document.documentElement.dir="rtl"<\/script>' : '');
      frame.srcdoc = html.replace(/<head[^>]*>/i, m => m + head);
    } catch (err) {
      console.warn('Star Archive could not be loaded from ' + url, err);
      frame.srcdoc = '<body style="margin:0;padding:24px;font:14px Tahoma,Arial,sans-serif;background:#d4d0c8;color:#111"' +
        (lang === 'ar' ? ' dir="rtl"' : '') + '>' + esc(i18n[lang].starOffline) + '</body>';
    }
  }

  // A small retro web browser showing the stars website
  function openStars(){
    const url = STAR_SITE[state.lang];
    return makeWindow(i18n[state.lang].starArchive, `
      <div class="browser">
        <div class="browser-bar">
          <button class="retro-btn" data-browser="back" type="button">◀ ${i18n[state.lang].browserBack}</button>
          <button class="retro-btn" data-browser="reload" type="button">↻ ${i18n[state.lang].browserReload}</button>
          <span class="browser-label">${i18n[state.lang].address}</span>
          <input class="browser-address" type="text" readonly value="${esc(url)}" aria-label="${i18n[state.lang].address}">
        </div>
        <iframe class="browser-frame" title="${esc(i18n[state.lang].starArchive)}"></iframe>
      </div>
    `,{type: 'stars', width:780, height:540, left:120, top:40, afterOpen:w=>{
      const frame = w.querySelector('iframe');
      loadStarSite(frame, state.lang);
      w.querySelector('[data-browser="reload"]').addEventListener('click',()=>{ loadStarSite(frame, state.lang); });
      w.querySelector('[data-browser="back"]').addEventListener('click',()=>{ loadStarSite(frame, state.lang); });
    }});
  }

  function openReadme(){
    return openNotepad(readmeText[state.lang], 'README.TXT');
  }

  function openTarget(target){
    startMenu.classList.remove('open');
    contextMenu.classList.remove('open');
    if(target==='computer') return openComputer();
    if(target==='cases') return openCases();
    if(target==='notepad') return openNotepad();
    if(target==='calculator') return openCalculator();
    if(target==='mail') return openMail();
    if(target==='recycle') return openRecycle();
    if(target==='stars') return openStars();
    if(target==='readme') return openReadme();
    if(target==='personal') return makeWindow(state.lang === 'ar' ? 'شخصي' : 'PERSONAL', `<div class="bevel">${i18n[state.lang].noFiles}</div>`,{width:340,height:210});
    if(target==='system') return makeWindow(state.lang === 'ar' ? 'النظام' : 'SYSTEM', '<div class="bevel mono">PDA-DOS SYSTEM DIRECTORY<br><br>BOOT.COM<br>COMMAND.COM<br>MOUSE.DRV<br>VGA.DRV<br>README.TXT</div>',{width:390,height:260});
  }

  root.querySelectorAll('[data-open]').forEach(btn=>{
    btn.addEventListener('click', e=>{
      e.preventDefault();
      e.stopPropagation();
      openTarget(btn.dataset.open);
    });
  });

  // Go to the other language's address, the same way the site's EN / عربي switch does:
  // previews use ?lang=ar, the live site uses /ar/… in front of the address
  taskLangBtn.addEventListener('click', () => {
    const url = new URL(location.href);
    if (state.lang === 'en') {
      if (url.pathname.startsWith('/puzzle-preview/')) url.searchParams.set('lang', 'ar');
      else url.pathname = '/ar' + url.pathname;
    } else {
      url.searchParams.delete('lang');
      url.pathname = url.pathname.replace(/^\/ar(?=\/|$)/, '') || '/';
    }
    location.assign(url.href);
  });

  startBtn.addEventListener('click',e=>{
    e.stopPropagation();
    startMenu.classList.toggle('open');
    contextMenu.classList.remove('open');
  });

  root.querySelector('#about-btn').addEventListener('click',()=>{startMenu.classList.remove('open');openAbout()});
  root.querySelector('#shutdown-btn').addEventListener('click',()=>{
    startMenu.classList.remove('open');
    makeWindow(i18n[state.lang].shutDownTitle, `
      <div class="centered" style="padding:18px">
        <div style="font-size:40px">⏻</div>
        <p>${i18n[state.lang].shutDownMsg}</p>
        <button class="retro-btn" id="cancel-shutdown" type="button">${i18n[state.lang].cancel}</button>
      </div>
    `,{type: 'shutdown', width:330,height:235,afterOpen:w=>{
      w.querySelector('#cancel-shutdown').addEventListener('click',()=>{
        closeWindow(w.dataset.id);
      });
    }});
  });

  root.addEventListener('contextmenu',e=>{
    if(!e.target.closest('.desktop-area')) return;
    e.preventDefault();
    const r=root.getBoundingClientRect();
    const isAr = state.lang === 'ar';
    if(isAr){
      contextMenu.style.right=Math.max(4, r.right - e.clientX)+'px';
      contextMenu.style.left='auto';
    }else{
      contextMenu.style.left=Math.max(4, e.clientX-r.left)+'px';
      contextMenu.style.right='auto';
    }
    contextMenu.style.top=Math.max(4, e.clientY-r.top)+'px';
    contextMenu.classList.add('open');
    startMenu.classList.remove('open');
  });

  root.addEventListener('click',e=>{
    if(!e.target.closest('#context-menu') && !e.target.closest('#start-menu') && e.target!==startBtn){
      contextMenu.classList.remove('open');
    }
  });

  root.querySelector('#ctx-refresh').addEventListener('click',()=>{
    contextMenu.classList.remove('open');
  });
  root.querySelector('#ctx-new').addEventListener('click',()=>{
    const name = (state.lang === 'ar' ? 'مجلد جديد ' : 'NEW FOLDER ') + (state.folders.length+1);
    state.folders.push(name);
    contextMenu.classList.remove('open');
    openTarget('cases');
  });
  root.querySelector('#ctx-about').addEventListener('click',()=>{
    contextMenu.classList.remove('open');
    openAbout();
  });

  function updateClock(){
    const now=new Date();
    clock.textContent=now.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
  }
  updateClock();
  const clockTimer=setInterval(updateClock,1000);
  window.addEventListener('pagehide',()=>clearInterval(clockTimer),{once:true});

  setLanguage(startLang);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initPDARetroDesktop, {once:true});
  }else{
    initPDARetroDesktop();
  }
})();