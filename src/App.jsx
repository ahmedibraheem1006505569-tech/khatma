import { useState, useEffect, useCallback } from "react";
import { db } from "./firebase.js";
import {
  ref,
  onValue,
  runTransaction,
  set,
  remove,
  get,
} from "firebase/database";

// ─────────────────────────────────────────
//  DATA
// ─────────────────────────────────────────
const COMPANIONS = [
  { id: 1,  name: "أبو بكر الصديق",       initials: "أب", color: ["#c8a84b","#f0c040"] },
  { id: 2,  name: "عمر بن الخطاب",         initials: "عم", color: ["#2e7d52","#4caf80"] },
  { id: 3,  name: "عثمان بن عفان",         initials: "عث", color: ["#1565c0","#42a5f5"] },
  { id: 4,  name: "علي بن أبي طالب",       initials: "عل", color: ["#6a1b9a","#ba68c8"] },
  { id: 5,  name: "طلحة بن عبيدالله",      initials: "طل", color: ["#b71c1c","#ef5350"] },
  { id: 6,  name: "الزبير بن العوام",      initials: "زب", color: ["#e65100","#ff7043"] },
  { id: 7,  name: "عبدالرحمن بن عوف",     initials: "عر", color: ["#004d40","#26a69a"] },
  { id: 8,  name: "سعد بن أبي وقاص",      initials: "سع", color: ["#37474f","#78909c"] },
  { id: 9,  name: "أبو عبيدة بن الجراح",  initials: "أع", color: ["#880e4f","#f48fb1"] },
  { id: 10, name: "بلال بن رباح",          initials: "بل", color: ["#1a237e","#7986cb"] },
  { id: 11, name: "سلمان الفارسي",         initials: "سل", color: ["#33691e","#9ccc65"] },
  { id: 12, name: "عمار بن ياسر",          initials: "عم", color: ["#f57f17","#ffca28"] },
  { id: 13, name: "مصعب بن عمير",          initials: "مص", color: ["#4a148c","#ce93d8"] },
  { id: 14, name: "خالد بن الوليد",        initials: "خل", color: ["#bf360c","#ff8a65"] },
  { id: 15, name: "عبدالله بن مسعود",      initials: "عم", color: ["#006064","#4dd0e1"] },
  { id: 16, name: "أبو هريرة",             initials: "أه", color: ["#3e2723","#a1887f"] },
  { id: 17, name: "أبو ذر الغفاري",        initials: "أذ", color: ["#0d47a1","#64b5f6"] },
  { id: 18, name: "معاذ بن جبل",           initials: "مع", color: ["#1b5e20","#66bb6a"] },
  { id: 19, name: "ابن عباس",              initials: "عب", color: ["#4e342e","#bcaaa4"] },
  { id: 20, name: "أنس بن مالك",           initials: "أن", color: ["#546e7a","#b0bec5"] },
];

const QURAN_PARTS = [
  { number:1,  arabicNumber:"١",  name:"الفاتحة",        startSurah:"الفاتحة"   },
  { number:2,  arabicNumber:"٢",  name:"سيقول",          startSurah:"البقرة"    },
  { number:3,  arabicNumber:"٣",  name:"تلك الرسل",      startSurah:"البقرة"    },
  { number:4,  arabicNumber:"٤",  name:"لن تنالوا",      startSurah:"آل عمران"  },
  { number:5,  arabicNumber:"٥",  name:"والمحصنات",      startSurah:"النساء"    },
  { number:6,  arabicNumber:"٦",  name:"لا يحب الله",    startSurah:"النساء"    },
  { number:7,  arabicNumber:"٧",  name:"وإذا سمعوا",     startSurah:"المائدة"   },
  { number:8,  arabicNumber:"٨",  name:"ولو أننا",       startSurah:"الأنعام"   },
  { number:9,  arabicNumber:"٩",  name:"قال الملأ",      startSurah:"الأعراف"   },
  { number:10, arabicNumber:"١٠", name:"واعلموا",         startSurah:"الأنفال"   },
  { number:11, arabicNumber:"١١", name:"يعتذرون",        startSurah:"التوبة"    },
  { number:12, arabicNumber:"١٢", name:"وما من دابة",    startSurah:"هود"       },
  { number:13, arabicNumber:"١٣", name:"وما أبرئ",       startSurah:"يوسف"      },
  { number:14, arabicNumber:"١٤", name:"ربما",           startSurah:"الحجر"     },
  { number:15, arabicNumber:"١٥", name:"سبحان الذي",     startSurah:"الإسراء"   },
  { number:16, arabicNumber:"١٦", name:"قال ألم",        startSurah:"الكهف"     },
  { number:17, arabicNumber:"١٧", name:"اقترب",          startSurah:"الأنبياء"  },
  { number:18, arabicNumber:"١٨", name:"قد أفلح",        startSurah:"المؤمنون"  },
  { number:19, arabicNumber:"١٩", name:"وقال الذين",     startSurah:"الفرقان"   },
  { number:20, arabicNumber:"٢٠", name:"أمن خلق",        startSurah:"النمل"     },
  { number:21, arabicNumber:"٢١", name:"اتل ما أوحي",    startSurah:"العنكبوت"  },
  { number:22, arabicNumber:"٢٢", name:"ومن يقنت",       startSurah:"الأحزاب"   },
  { number:23, arabicNumber:"٢٣", name:"وما لي",         startSurah:"يس"        },
  { number:24, arabicNumber:"٢٤", name:"فمن أظلم",       startSurah:"الزمر"     },
  { number:25, arabicNumber:"٢٥", name:"إليه يرد",       startSurah:"فصلت"      },
  { number:26, arabicNumber:"٢٦", name:"حم",             startSurah:"الأحقاف"   },
  { number:27, arabicNumber:"٢٧", name:"قال فما خطبكم",  startSurah:"الذاريات"  },
  { number:28, arabicNumber:"٢٨", name:"قد سمع الله",    startSurah:"المجادلة"  },
  { number:29, arabicNumber:"٢٩", name:"تبارك الذي",     startSurah:"الملك"     },
  { number:30, arabicNumber:"٣٠", name:"عم",             startSurah:"النبأ"     },
];

// ─────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Tajawal:wght@300;400;500;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --gold: #f0c040;
    --gold-light: #ffd700;
    --gold-dim: rgba(240,192,64,0.15);
    --bg-deep: #08060f;
    --bg-card: rgba(255,215,0,0.04);
    --border-gold: rgba(240,192,64,0.25);
    --border-gold-bright: rgba(240,192,64,0.7);
    --text-main: #f5e6c8;
    --text-dim: rgba(245,230,200,0.55);
  }

  body {
    background: var(--bg-deep);
    color: var(--text-main);
    font-family: 'Tajawal', sans-serif;
    direction: rtl;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .app-wrapper { min-height: 100vh; position: relative; overflow: hidden; }

  .stars-layer { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
  .star {
    position: absolute; background: #fff; border-radius: 50%;
    animation: twinkle var(--dur) ease-in-out infinite var(--delay); opacity: 0;
  }
  @keyframes twinkle {
    0%,100% { opacity:0; transform:scale(0.8); }
    50% { opacity:var(--max-opacity); transform:scale(1.2); }
  }

  .moon-deco {
    position: fixed; top:-30px; left:40px; font-size:120px; opacity:0.07;
    animation: moonFloat 6s ease-in-out infinite; pointer-events:none; z-index:0;
  }
  @keyframes moonFloat {
    0%,100% { transform:translateY(0) rotate(-10deg); }
    50% { transform:translateY(-15px) rotate(-5deg); }
  }

  .lantern-deco {
    position:fixed; top:20px; right:60px; font-size:80px; opacity:0.09;
    animation:lanternSwing 4s ease-in-out infinite; pointer-events:none; z-index:0;
    transform-origin:top center;
  }
  @keyframes lanternSwing {
    0%,100% { transform:rotate(-8deg); }
    50% { transform:rotate(8deg); }
  }

  .screen {
    position:relative; z-index:1; min-height:100vh;
    display:flex; flex-direction:column; align-items:center;
    padding:40px 20px; animation:fadeInUp 0.6s ease both;
  }
  @keyframes fadeInUp {
    from { opacity:0; transform:translateY(30px); }
    to   { opacity:1; transform:translateY(0); }
  }

  .ornament {
    font-family:'Amiri',serif; color:var(--gold); font-size:28px;
    letter-spacing:8px; opacity:0.7; margin-bottom:8px;
  }

  .main-title {
    font-family:'Amiri',serif; font-size:clamp(32px,6vw,56px); font-weight:700;
    text-align:center;
    background:linear-gradient(135deg,#f0c040,#ffd700,#c8963c,#f0c040);
    background-size:200% 200%; -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    background-clip:text; animation:goldShimmer 4s linear infinite; line-height:1.3; margin-bottom:6px;
  }
  @keyframes goldShimmer {
    0% { background-position:0% 50%; } 100% { background-position:200% 50%; }
  }

  .sub-title { color:var(--text-dim); font-size:16px; text-align:center; margin-bottom:40px; font-weight:300; }

  .gold-divider {
    width:200px; height:1px;
    background:linear-gradient(90deg,transparent,var(--gold),transparent);
    margin:20px auto;
  }

  .btn-primary {
    background:linear-gradient(135deg,#c8a020,#f0c040,#c8a020); background-size:200% 200%;
    color:#1a1000; border:none; padding:14px 40px; border-radius:50px;
    font-family:'Tajawal',sans-serif; font-size:18px; font-weight:700; cursor:pointer;
    transition:all 0.3s; box-shadow:0 4px 20px rgba(240,192,64,0.35);
    animation:goldShimmer 3s linear infinite; display:inline-flex; align-items:center; gap:8px;
  }
  .btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 30px rgba(240,192,64,0.55); }
  .btn-primary:disabled { opacity:0.35; cursor:not-allowed; transform:none; }

  .btn-secondary {
    background:transparent; color:var(--gold); border:1px solid var(--border-gold);
    padding:10px 28px; border-radius:50px; font-family:'Tajawal',sans-serif;
    font-size:16px; cursor:pointer; transition:all 0.3s;
  }
  .btn-secondary:hover { background:var(--gold-dim); border-color:var(--gold); }

  .gold-input {
    background:rgba(255,215,0,0.06); border:1px solid var(--border-gold); border-radius:12px;
    padding:14px 20px; font-family:'Tajawal',sans-serif; font-size:18px; color:var(--text-main);
    width:100%; max-width:400px; text-align:right; direction:rtl; transition:all 0.3s; outline:none;
  }
  .gold-input:focus { border-color:var(--gold); box-shadow:0 0 0 3px rgba(240,192,64,0.15); background:rgba(255,215,0,0.09); }
  .gold-input::placeholder { color:var(--text-dim); }

  .section-label {
    font-size:14px; color:var(--gold); letter-spacing:2px; margin-bottom:16px;
    text-align:right; width:100%; max-width:700px;
    display:flex; align-items:center; gap:10px;
  }
  .section-label::before { content:''; flex:1; height:1px; background:var(--border-gold); }

  .companions-grid {
    display:grid; grid-template-columns:repeat(auto-fill,minmax(130px,1fr));
    gap:12px; width:100%; max-width:700px; margin-bottom:32px;
  }

  .companion-card {
    background:var(--bg-card); border:1px solid var(--border-gold); border-radius:14px;
    padding:16px 10px; cursor:pointer; transition:all 0.3s;
    display:flex; flex-direction:column; align-items:center; gap:8px; text-align:center;
  }
  .companion-card:hover { background:rgba(255,215,0,0.08); border-color:var(--gold); transform:translateY(-3px); }
  .companion-card.selected { background:rgba(240,192,64,0.12); border-color:var(--gold-light); box-shadow:0 0 20px rgba(240,192,64,0.3); }

  .avatar-circle {
    width:52px; height:52px; border-radius:50%; display:flex; align-items:center;
    justify-content:center; font-family:'Amiri',serif; font-size:18px; font-weight:700;
    color:#fff; position:relative; flex-shrink:0;
  }
  .companion-card.selected .avatar-circle::after {
    content:'✓'; position:absolute; inset:0; background:rgba(0,0,0,0.55); border-radius:50%;
    display:flex; align-items:center; justify-content:center; font-size:20px; color:var(--gold-light);
  }

  .companion-name { font-size:11px; color:var(--text-dim); line-height:1.4; font-weight:500; }
  .companion-card.selected .companion-name { color:var(--gold); }

  .parts-grid {
    display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr));
    gap:12px; width:100%; max-width:900px; margin-bottom:32px;
  }

  .part-card {
    background:var(--bg-card); border:1px solid var(--border-gold); border-radius:14px;
    padding:18px 12px; cursor:pointer; transition:all 0.3s; text-align:center; position:relative; overflow:hidden;
  }
  .part-card::before {
    content:''; position:absolute; inset:0;
    background:linear-gradient(135deg,transparent 60%,rgba(240,192,64,0.05)); pointer-events:none;
  }
  .part-card:hover:not(.taken) { background:rgba(255,215,0,0.09); border-color:var(--gold); transform:translateY(-3px); box-shadow:0 8px 24px rgba(240,192,64,0.2); }
  .part-card.selected-part { background:rgba(240,192,64,0.14); border-color:var(--gold-light); box-shadow:0 0 25px rgba(240,192,64,0.35); }
  .part-card.taken { opacity:0.45; cursor:not-allowed; filter:grayscale(0.4); }

  .part-number { font-family:'Amiri',serif; font-size:28px; color:var(--gold); font-weight:700; line-height:1; margin-bottom:4px; }
  .part-juz { font-size:11px; color:var(--text-dim); margin-bottom:4px; }
  .part-surah { font-size:13px; color:var(--text-main); font-weight:500; }
  .part-taken-info { font-size:10px; color:var(--gold); margin-top:6px; }

  .modal-overlay {
    position:fixed; inset:0; background:rgba(8,6,15,0.88); backdrop-filter:blur(8px);
    z-index:100; display:flex; align-items:center; justify-content:center; padding:20px;
    animation:fadeIn 0.3s ease;
  }
  @keyframes fadeIn { from{opacity:0;} to{opacity:1;} }

  .modal-box {
    background:linear-gradient(145deg,#120d20,#1a1030); border:1px solid var(--border-gold-bright);
    border-radius:24px; padding:40px 32px; max-width:420px; width:100%; text-align:center;
    box-shadow:0 0 60px rgba(240,192,64,0.2); animation:scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes scaleIn { from{opacity:0;transform:scale(0.85);} to{opacity:1;transform:scale(1);} }
  .modal-icon { font-size:52px; margin-bottom:16px; }
  .modal-title { font-family:'Amiri',serif; font-size:24px; color:var(--gold); margin-bottom:12px; }
  .modal-text { color:var(--text-dim); font-size:15px; line-height:1.7; margin-bottom:28px; }
  .modal-highlight { color:var(--gold-light); font-weight:700; font-size:18px; }
  .modal-actions { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }

  .congrats-card {
    background:linear-gradient(135deg,rgba(240,192,64,0.1),rgba(240,192,64,0.05));
    border:1px solid var(--border-gold-bright); border-radius:20px;
    padding:28px; margin-bottom:28px; text-align:center;
  }
  .congrats-name { font-family:'Amiri',serif; font-size:22px; color:var(--gold-light); margin-bottom:8px; }
  .congrats-part { font-size:28px; font-weight:800; color:var(--text-main); }

  .progress-section { width:100%; max-width:900px; margin-bottom:28px; }
  .progress-label { display:flex; justify-content:space-between; margin-bottom:8px; font-size:14px; }
  .progress-bar-bg { background:rgba(255,215,0,0.1); border:1px solid var(--border-gold); border-radius:50px; height:12px; overflow:hidden; }
  .progress-bar-fill {
    height:100%; background:linear-gradient(90deg,#c8a020,#ffd700); border-radius:50px;
    transition:width 0.8s ease; position:relative;
  }
  .progress-bar-fill::after {
    content:''; position:absolute; inset:0;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent);
    animation:progressShine 2s linear infinite;
  }
  @keyframes progressShine { from{transform:translateX(-100%);} to{transform:translateX(100%);} }

  .participants-grid {
    display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr));
    gap:14px; width:100%; max-width:900px;
  }
  .participant-tile {
    background:var(--bg-card); border:1px solid var(--border-gold); border-radius:14px;
    padding:16px; display:flex; align-items:center; gap:12px; transition:all 0.3s;
  }
  .participant-tile.is-me { border-color:var(--gold-light); background:rgba(240,192,64,0.1); box-shadow:0 0 20px rgba(240,192,64,0.2); }
  .participant-tile:hover { transform:translateY(-2px); border-color:rgba(240,192,64,0.5); }
  .participant-info { flex:1; min-width:0; }
  .participant-name { font-size:14px; font-weight:600; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .participant-companion { font-size:11px; color:var(--text-dim); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .participant-part { font-family:'Amiri',serif; font-size:22px; color:var(--gold); font-weight:700; flex-shrink:0; }

  .verse-card {
    background:var(--bg-card); border-right:3px solid var(--gold); border-radius:0 14px 14px 0;
    padding:20px 24px; margin-bottom:28px; width:100%; max-width:900px;
  }
  .verse-text { font-family:'Amiri',serif; font-size:18px; color:var(--text-main); line-height:2; margin-bottom:8px; }
  .verse-source { font-size:13px; color:var(--gold); }

  .toast {
    position:fixed; bottom:30px; left:50%; transform:translateX(-50%);
    background:linear-gradient(135deg,#1a1030,#120d20); border:1px solid var(--gold);
    border-radius:50px; padding:12px 28px; font-size:15px; color:var(--gold); z-index:200;
    box-shadow:0 8px 32px rgba(0,0,0,0.5); animation:toastIn 0.4s ease, toastOut 0.4s ease 2.6s forwards;
    white-space:nowrap;
  }
  @keyframes toastIn  { from{opacity:0;transform:translateX(-50%) translateY(20px);} to{opacity:1;transform:translateX(-50%) translateY(0);} }
  @keyframes toastOut { from{opacity:1;} to{opacity:0;} }

  .loading-spinner {
    width:40px; height:40px; border:3px solid rgba(240,192,64,0.2); border-top-color:var(--gold);
    border-radius:50%; animation:spin 0.8s linear infinite; margin:40px auto;
  }
  @keyframes spin { to{transform:rotate(360deg);} }

  .firebase-error {
    background:rgba(183,28,28,0.15); border:1px solid rgba(244,67,54,0.4);
    border-radius:14px; padding:20px 24px; max-width:600px; margin:20px auto; text-align:center;
  }

  @media(max-width:600px) {
    .companions-grid { grid-template-columns:repeat(auto-fill,minmax(100px,1fr)); }
    .parts-grid { grid-template-columns:repeat(auto-fill,minmax(110px,1fr)); }
    .participants-grid { grid-template-columns:1fr 1fr; }
  }
`;

// ─────────────────────────────────────────
//  STARS
// ─────────────────────────────────────────
const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 0.5,
  dur: (Math.random() * 3 + 2).toFixed(1),
  delay: (Math.random() * 5).toFixed(1),
  opacity: (Math.random() * 0.6 + 0.2).toFixed(2),
}));

function Stars() {
  return (
    <div className="stars-layer">
      {STARS.map((s) => (
        <div key={s.id} className="star" style={{
          left:`${s.x}%`, top:`${s.y}%`, width:s.size, height:s.size,
          "--dur":`${s.dur}s`, "--delay":`-${s.delay}s`, "--max-opacity":s.opacity,
        }} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────
//  SCREENS
// ─────────────────────────────────────────
function WelcomeScreen({ onStart }) {
  return (
    <div className="screen" style={{ justifyContent:"center", gap:0 }}>
      <div className="moon-deco">🌙</div>
      <div className="lantern-deco">🏮</div>
      <div className="ornament">﷽</div>
      <div className="gold-divider" />
      <h1 className="main-title" style={{ marginTop:16 }}>ختمة رمضان الجماعية</h1>
      <p className="sub-title">نختم القرآن الكريم معاً في هذا الشهر المبارك 🌙</p>
      <div className="gold-divider" style={{ marginBottom:40 }} />
      <div style={{ display:"flex", gap:20, flexWrap:"wrap", justifyContent:"center", marginBottom:48 }}>
        {[
          { icon:"📖", text:"٣٠ جزءاً",   sub:"للختمة الكاملة" },
          { icon:"👥", text:"جماعي",       sub:"بدون تكرار"     },
          { icon:"✨", text:"رمضان كريم",  sub:"شهر البركة"     },
        ].map((item,i) => (
          <div key={i} style={{
            background:"rgba(255,215,0,0.05)", border:"1px solid rgba(240,192,64,0.2)",
            borderRadius:16, padding:"20px 28px", textAlign:"center", minWidth:120,
          }}>
            <div style={{ fontSize:32, marginBottom:8 }}>{item.icon}</div>
            <div style={{ color:"var(--gold)", fontWeight:700, fontSize:16 }}>{item.text}</div>
            <div style={{ color:"var(--text-dim)", fontSize:12, marginTop:4 }}>{item.sub}</div>
          </div>
        ))}
      </div>
      <button className="btn-primary" onClick={onStart}>🌙 ابدأ مشاركتك</button>
    </div>
  );
}

function IdentityScreen({ onNext }) {
  const [name, setName] = useState("");
  const [selectedCompanion, setSelectedCompanion] = useState(null);
  const canProceed = name.trim().length >= 2 && selectedCompanion !== null;

  return (
    <div className="screen" style={{ gap:0 }}>
      <div className="ornament">✦ هويتك ✦</div>
      <h2 className="main-title" style={{ fontSize:"clamp(24px,5vw,40px)", marginBottom:6 }}>اختر اسمك وأفاتارك</h2>
      <p className="sub-title">سيُعرض اسمك مع الجزء الذي ستتكفل بقراءته</p>
      <div className="gold-divider" style={{ marginBottom:32 }} />

      <div style={{ width:"100%", maxWidth:700, marginBottom:28 }}>
        <div className="section-label">اسمك</div>
        <input className="gold-input" placeholder="أدخل اسمك..." value={name}
          onChange={(e) => setName(e.target.value)} maxLength={30} />
      </div>

      <div className="section-label" style={{ width:"100%", maxWidth:700 }}>اختر صحابياً يُمثّلك</div>
      <div className="companions-grid">
        {COMPANIONS.map((c) => (
          <div key={c.id}
            className={`companion-card ${selectedCompanion?.id === c.id ? "selected" : ""}`}
            onClick={() => setSelectedCompanion(c)}>
            <div className="avatar-circle"
              style={{ background:`linear-gradient(135deg,${c.color[0]},${c.color[1]})` }}>
              {c.initials}
            </div>
            <span className="companion-name">{c.name}</span>
          </div>
        ))}
      </div>

      <button className="btn-primary"
        onClick={() => onNext({ name:name.trim(), companion:selectedCompanion })}
        disabled={!canProceed}>
        التالي ←
      </button>
    </div>
  );
}

function PartSelectionScreen({ user, participants, onSelect, loading }) {
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const takenMap = {};
  participants.forEach((p) => { if (p.partNumber) takenMap[p.partNumber] = p; });

  return (
    <div className="screen" style={{ gap:0 }}>
      <div className="ornament">✦ اختر جزءك ✦</div>
      <h2 className="main-title" style={{ fontSize:"clamp(22px,4vw,36px)", marginBottom:6 }}>
        أيّ جزء ستتكفّل بقراءته؟
      </h2>
      <p className="sub-title">
        مرحباً <span style={{ color:"var(--gold-light)", fontWeight:700 }}>{user.name}</span> — اختر جزءاً واحداً لم يُحجز بعد
      </p>
      <div className="gold-divider" style={{ marginBottom:32 }} />

      <div style={{ width:"100%", maxWidth:900, marginBottom:16 }}>
        <div style={{
          background:"rgba(255,215,0,0.06)", border:"1px solid var(--border-gold)",
          borderRadius:12, padding:"12px 20px", display:"flex", gap:24,
          justifyContent:"center", flexWrap:"wrap", fontSize:14,
        }}>
          <span>🟩 <span style={{ color:"var(--text-dim)" }}>متاح</span></span>
          <span>🔒 <span style={{ color:"var(--text-dim)" }}>محجوز</span></span>
          <span style={{ color:"var(--gold)" }}>{Object.keys(takenMap).length} / 30 تم الحجز</span>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign:"center" }}>
          <div className="loading-spinner" />
          <p style={{ color:"var(--gold)" }}>جارٍ حجز جزءك...</p>
        </div>
      ) : (
        <div className="parts-grid">
          {QURAN_PARTS.map((part) => {
            const taker = takenMap[part.number];
            return (
              <div key={part.number}
                className={`part-card ${taker ? "taken" : ""} ${selected?.number === part.number ? "selected-part" : ""}`}
                onClick={() => { if (!taker) { setSelected(part); setShowModal(true); } }}>
                <div className="part-number">{part.arabicNumber}</div>
                <div className="part-juz">جزء {part.number}</div>
                <div className="part-surah">{part.name}</div>
                {taker
                  ? <div className="part-taken-info">🔒 {taker.name}</div>
                  : <div style={{ fontSize:10, color:"rgba(240,192,64,0.4)", marginTop:6 }}>{part.startSurah}</div>
                }
              </div>
            );
          })}
        </div>
      )}

      {showModal && selected && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">📖</div>
            <div className="modal-title">تأكيد الحجز</div>
            <div className="modal-text">
              هل تتكفّل بقراءة<br />
              <span className="modal-highlight">الجزء {selected.arabicNumber} — {selected.name}</span><br />
              <span style={{ fontSize:13, marginTop:8, display:"block" }}>يبدأ من سورة {selected.startSurah}</span>
            </div>
            <div className="modal-actions">
              <button className="btn-primary" onClick={() => { setShowModal(false); onSelect(selected); }}>
                نعم، أتكفّل به ✓
              </button>
              <button className="btn-secondary" onClick={() => setShowModal(false)}>تراجع</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardScreen({ user, participants }) {
  const [copied, setCopied] = useState(false);
  const myPart = QURAN_PARTS.find((p) => p.number === user.partNumber);
  const takenCount = participants.filter((p) => p.partNumber).length;
  const progress = Math.round((takenCount / 30) * 100);

  const handleShare = () => {
    const msg = `🌙 ختمة رمضان الجماعية\n\nالمشاركون: ${participants.length}\nتم حجز ${takenCount} من 30 جزءاً\n\nانضم إلينا وتكفّل بجزء! 📖\n${window.location.href}`;
    navigator.clipboard?.writeText(msg).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <div className="screen" style={{ gap:0, alignItems:"center" }}>
      <div className="ornament">✦ ختمة رمضان ✦</div>
      <h2 className="main-title" style={{ fontSize:"clamp(22px,4vw,38px)", marginBottom:24 }}>لوحة المشاركين</h2>

      {myPart && (
        <div className="congrats-card" style={{ width:"100%", maxWidth:900 }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🎉</div>
          <div className="congrats-name">جزاك الله خيراً يا {user.name}</div>
          <div className="congrats-part">تكفّلت بالجزء {myPart.arabicNumber} — {myPart.name}</div>
          <div style={{ color:"var(--text-dim)", fontSize:14, marginTop:8 }}>يبدأ من سورة {myPart.startSurah}</div>
        </div>
      )}

      <div className="verse-card">
        <div className="verse-text">❝ إِنَّ الَّذِينَ يَتْلُونَ كِتَابَ اللَّهِ وَأَقَامُوا الصَّلَاةَ وَأَنفَقُوا مِمَّا رَزَقْنَاهُمْ سِرًّا وَعَلَانِيَةً يَرْجُونَ تِجَارَةً لَّن تَبُورَ ❞</div>
        <div className="verse-source">— سورة فاطر: ٢٩</div>
      </div>

      <div className="progress-section">
        <div className="progress-label">
          <span style={{ color:"var(--gold)" }}>تقدّم الختمة</span>
          <span style={{ color:"var(--text-dim)" }}>{takenCount} / 30 جزءاً • {progress}%</span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width:`${progress}%` }} />
        </div>
        {takenCount === 30 && (
          <div style={{ textAlign:"center", color:"var(--gold)", fontWeight:700, fontSize:18, marginTop:12 }}>
            🎊 اكتملت الختمة! بارك الله في الجميع 🎊
          </div>
        )}
      </div>

      <div className="section-label" style={{ width:"100%", maxWidth:900 }}>المشاركون ({participants.length})</div>
      <div className="participants-grid">
        {participants.map((p, i) => {
          const part = QURAN_PARTS.find((q) => q.number === p.partNumber);
          const companion = COMPANIONS.find((c) => c.id === p.companionId);
          const isMe = p.userId === user.userId;
          return (
            <div key={i} className={`participant-tile ${isMe ? "is-me" : ""}`}>
              <div className="avatar-circle" style={{
                width:40, height:40, fontSize:14, flexShrink:0,
                background: companion
                  ? `linear-gradient(135deg,${companion.color[0]},${companion.color[1]})`
                  : "linear-gradient(135deg,#555,#999)",
              }}>
                {companion?.initials || "؟"}
              </div>
              <div className="participant-info">
                <div className="participant-name">{p.name} {isMe ? "👑" : ""}</div>
                <div className="participant-companion">{companion?.name}</div>
              </div>
              {part && <div className="participant-part">{part.arabicNumber}</div>}
            </div>
          );
        })}
      </div>

      <div style={{ width:"100%", maxWidth:900, display:"flex", justifyContent:"center", margin:"28px 0 60px" }}>
        <button className="btn-primary" onClick={handleShare}>
          {copied ? "✅ تم النسخ!" : "📤 شارك الختمة"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
//  MAIN APP
// ─────────────────────────────────────────
export default function App() {
  const [screen, setScreen]           = useState("welcome");
  const [user, setUser]               = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [toast, setToast]             = useState(null);
  const [firebaseError, setFirebaseError] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // ── Real-time listener ──
  useEffect(() => {
    try {
      const dbRef = ref(db, "participants");
      const unsub = onValue(dbRef, (snapshot) => {
        setFirebaseError(false);
        const data = snapshot.val();
        if (data) {
          setParticipants(Object.values(data));
        } else {
          setParticipants([]);
        }
      }, (err) => {
        console.error("Firebase error:", err);
        // لو المشكلة في الـ rules بس، مش بنوقف التطبيق
        if (err.code === "PERMISSION_DENIED") {
          setFirebaseError(true);
        }
      });
      return () => unsub();
    } catch (err) {
      console.error("Firebase init error:", err);
      setFirebaseError(true);
    }
  }, []);

  const handleIdentityNext = (data) => {
    const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setUser({ ...data, userId, companionId: data.companion.id });
    setScreen("parts");
  };

  // ── ATOMIC booking via Firebase transaction ──
  const handlePartSelect = async (part) => {
    setLoading(true);
    try {
      const partRef = ref(db, `participants/part_${part.number}`);

      const result = await runTransaction(partRef, (current) => {
        // لو الجزء محجوز خليه زي ما هو ← بيفشل التراجنزاكشن
        if (current !== null && current !== undefined) {
          return; // abort
        }
        // احجزه
        return {
          userId:      user.userId,
          name:        user.name,
          companionId: user.companionId,
          partNumber:  part.number,
          joinedAt:    new Date().toISOString(),
        };
      });

      if (result.committed) {
        setUser((prev) => ({ ...prev, partNumber: part.number }));
        setScreen("dashboard");
        showToast(`✅ جزاك الله خيراً! تم حجز الجزء ${part.arabicNumber}`);
      } else {
        // الجزء محجوز من شخص ثاني في نفس اللحظة
        showToast(`❌ سبقك أحدهم! الجزء ${part.arabicNumber} محجوز، اختر غيره`);
      }
    } catch (err) {
      console.error(err);
      showToast("⚠️ حدث خطأ، يرجى المحاولة مجدداً");
    }
    setLoading(false);
  };

  if (firebaseError) {
    return (
      <>
        <style>{styles}</style>
        <div className="app-wrapper">
          <Stars />
          <div className="screen" style={{ justifyContent:"center" }}>
            <div className="firebase-error">
              <div style={{ fontSize:48, marginBottom:16 }}>⚠️</div>
              <div style={{ color:"var(--gold)", fontWeight:700, fontSize:20, marginBottom:12 }}>
                خطأ في الاتصال بقاعدة البيانات
              </div>
              <div style={{ color:"var(--text-dim)", fontSize:14, lineHeight:1.8 }}>
                تأكد من إعداد Firebase بشكل صحيح في ملف <code style={{ color:"var(--gold)" }}>.env</code>
                <br />راجع ملف <strong>README.md</strong> للتعليمات الكاملة
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="app-wrapper">
        <Stars />
        {screen === "welcome"   && <WelcomeScreen onStart={() => setScreen("identity")} />}
        {screen === "identity"  && <IdentityScreen onNext={handleIdentityNext} />}
        {screen === "parts"     && (
          <PartSelectionScreen
            user={user} participants={participants}
            onSelect={handlePartSelect} loading={loading}
          />
        )}
        {screen === "dashboard" && user && (
          <DashboardScreen user={user} participants={participants} />
        )}
        {toast && <div className="toast">{toast}</div>}
      </div>
    </>
  );
}
