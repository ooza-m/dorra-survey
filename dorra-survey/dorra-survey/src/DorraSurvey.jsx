import { useState, useEffect, useCallback, useRef } from "react";

// ═══════════════════════════════════════════
// COLORS — Rose/Pink palette from logo
// ═══════════════════════════════════════════
const C = {
  primary:    "#C17E7E",   // dusty rose main
  dark:       "#8B4A4A",   // deep rose dark
  light:      "#FDF0F0",   // very light blush
  mid:        "#E8C4C4",   // mid rose
  cream:      "#FDF8F8",   // warm cream
  text:       "#2D1F1F",   // near black warm
  gray:       "#8A6E6E",   // warm gray
  white:      "#FFFFFF",
  accent:     "#D4929E",   // rose accent
  soft:       "#F5E6E6",   // soft blush bg
};

// ═══════════════════════════════════════════
// GOOGLE SHEETS WEBHOOK
// Replace with your Google Apps Script URL
// ═══════════════════════════════════════════
const SHEET_URL = "https://script.google.com/macros/s/AKfycbwbqpDWm2tvn_M0Si4LVArjFcG9Oq11X5LLOuJ7zMglBJw7Mt3aOz3QPHbHf4HQ1KKF/exec";

async function sendToSheets(data) {
  try {
    const form = new FormData();
    form.append("data", JSON.stringify(data));
    await fetch(SHEET_URL, {
      method: "POST",
      mode: "no-cors",
      body: form
    });
  } catch (e) {
    console.log("Sheet sync failed:", e);
  }
}

// ═══════════════════════════════════════════
// QUESTIONS
// ═══════════════════════════════════════════
const QUESTIONS = [
  {
    id: "q1", section: 1,
    sectionTitle: "عنكِ أنتِ",
    sectionIcon: "👤",
    text: "الجنس",
    type: "single", required: true,
    options: ["أنثى","ذكر"]
  },
  {
    id: "q1b", section: 1,
    text: "الجنسية",
    type: "single", required: true,
    options: ["إماراتية","إحدى دول مجلس التعاون الخليجي","غير ذلك"]
  },
  {
    id: "q1c", section: 1,
    text: "أين تقيمين؟",
    type: "single", required: true,
    options: ["أبوظبي","دبي","الشارقة","عجمان","أم القيوين","رأس الخيمة","الفجيرة","خارج دولة الإمارات العربية المتحدة"]
  },
  {
    id: "q2", section: 1,
    text: "كم عمركِ؟",
    type: "single", required: true,
    options: ["أقل من 15 سنة","15 – 18 سنة","19 – 24 سنة","25 – 30 سنة","31 – 35 سنة","أكبر من 35 سنة"]
  },
  {
    id: "q3", section: 1,
    text: "ما الذي يصفكِ أكثر الآن؟",
    hint: "يمكن اختيار أكثر من إجابة",
    type: "multi", required: true,
    options: ["طالبة","موظفة","صانعة أجيال (ربة منزل)","رائدة أعمال","أبحث عن عمل","غير موظفة","متقاعدة"]
  },
  {
    id: "q3b", section: 1,
    text: "ما حالتكِ الاجتماعية؟",
    type: "single", required: true,
    options: ["عزباء","متزوجة","مطلقة","أرملة"]
  },
  {
    id: "q3c", section: 1,
    text: "هل لديكِ أبناء؟",
    type: "single", required: true,
    options: ["نعم","لا"]
  },
  {
    id: "q4", section: 2,
    sectionTitle: "علاقتكِ بالثقافة والقراءة",
    sectionIcon: "📚",
    text: "كيف تصفين علاقتكِ بالقراءة؟",
    type: "single", required: true,
    options: [
      "أقرأ بانتظام وأعشق الكتب",
      "أقرأ أحياناً لكن أودّ أن أقرأ أكثر",
      "أجد صعوبة في إيجاد كتب تشدّني",
      "القراءة لم تكن عادتي حتى الآن"
    ]
  },
  {
    id: "q5", section: 2,
    text: "ما الموضوعات التي تشدّكِ أكثر؟",
    hint: "اختاري حتى 3 موضوعات",
    type: "multi", maxSelect: 3, required: true,
    options: [
      "التطوير الشخصي والعلاقات",
      "التربية والأسرة",
      "الأدب والروايات العربية",
      "التراث الإماراتي والهوية",
      "الثقافة العامة والفكر",
      "الكتب المترجمة عن لغات أخرى"
    ]
  },
  {
    id: "q6", section: 2,
    text: "باللغة العربية تحديداً — كيف تجدين المحتوى الثقافي النوعي المتاح لكِ؟",
    type: "single", required: true,
    options: [
      "وفير ومتنوع وأجد ما يناسبني",
      "موجود لكن أتمنى أن يكون أعمق وأجود",
      "قليل جداً في مجالات أهتم بها",
      "أجد نفسي أتجه للمحتوى الإنجليزي لقلة الخيارات"
    ]
  },
  {
    id: "q7", section: 3,
    sectionTitle: "ما تحتاجينه",
    sectionIcon: "✨",
    text: "ما البرامج والمشاريع الثقافية التي تودّين المشاركة فيها؟",
    hint: "اختاري حتى 3 خيارات",
    type: "multi", maxSelect: 3, required: true,
    options: [
      "صالون قرائي شهري (نقاش كتاب مع مجموعة)",
      "ورش ثقافية ومهارية (تفكير نقدي، كتابة إبداعية، …)",
      "استشارات تربوية وأسرية",
      "استشارات ثقافية وفكرية",
      "ملتقيات ثقافية في (مدارس، جامعات، جهات عمل)",
      "حلقات قرائية فردية أو ثنائية",
      "إنتاج كتب عربية نوعية"
    ]
  },
  {
    id: "q8", section: 3,
    text: "هل سبق أن بحثتِ عن استشارة تربوية أو أسرية ولم تجدي ما يناسبكِ؟",
    type: "single", required: true,
    options: [
      "نعم، وهذا احتياج حقيقي عندي",
      "لم أحتج حتى الآن لكن يهمني وجود هذا",
      "لا، لديّ مصادر كافية حالياً"
    ]
  },
  {
    id: "q8b", section: 3,
    text: "هل سبق أن أردتِ مناقشة كتاب أو فكرة ثقافية مع متخصصة ولم تجدي الفرصة؟",
    type: "single", required: true,
    options: [
      "نعم، كثيراً — هذا ما أبحث عنه",
      "أحياناً تخطر لي هذه الرغبة",
      "لم يخطر لي ذلك من قبل",
      "لديّ من أناقشه في هذا"
    ]
  },
  {
    id: "q9", section: 3,
    text: "إذا قدّمت دُرَّة برنامجاً ثقافياً نوعياً يضيف لكِ فعلاً — ما الذي يناسبكِ؟",
    hint: "إجابتكِ تساعدنا في تصميم برامج تناسب الجميع",
    type: "single", required: true,
    options: [
      "أشارك في البرامج المجانية فقط",
      "مستعدة للدفع حتى 100 درهم للبرنامج الواحد",
      "مستعدة للدفع بين 100 – 500 درهم",
      "مستعدة للدفع بين 500 – 1000 درهم",
      "لا يهمني المبلغ إن كان البرنامج نوعياً ويضيف قيمة حقيقية"
    ]
  },
  {
    id: "q10", section: 3,
    text: "ما طريقة المشاركة التي تناسبكِ أكثر؟",
    type: "single", required: true,
    options: [
      "حضورياً (أبوظبي)",
      "عن بُعد (أونلاين)",
      "كلاهما يناسبني",
      "يعتمد على الموضوع والوقت"
    ]
  },
  {
    id: "q11", section: 4,
    sectionTitle: "دُرَّة والتطوع",
    sectionIcon: "🌿",
    text: "دُرَّة مجتمع نسائي ثقافي ناشئ — هل يسعدكِ أن تكوني جزءاً منه؟",
    type: "single", required: true,
    options: [
      "نعم، أودّ التطوع والمساهمة",
      "أودّ المتابعة والاستفادة من البرامج",
      "كلاهما يعجبني",
      "سأرى عندما تنطلقون"
    ]
  },
  {
    id: "q11b", section: 4,
    text: "هل لديكِ ملاحظة، اقتراح، أو شيء تودّين مشاركتنا إياه؟ 💬",
    hint: "مساحتكِ الحرة — كل كلمة تقولينها تُهمنا",
    type: "textarea", required: false,
    placeholder: "اكتبي ما يخطر في بالكِ..."
  },
  {
    id: "q12", section: 4,
    text: "إذا أردتِ أن نتواصل معكِ — اتركي اسمكِ هنا 🤍",
    type: "text", required: false,
    placeholder: "اسمكِ..."
  },
  {
    id: "q13", section: 4,
    text: "رقم واتساب",
    type: "text", required: false,
    placeholder: "05XXXXXXXX"
  },
  {
    id: "q14", section: 4,
    text: "البريد الإلكتروني",
    type: "text", required: false,
    placeholder: "example@email.com"
  }
];

// ═══════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════

function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:12, color:C.gray }}>
        <span style={{ fontWeight:600 }}>السؤال {current} من {total}</span>
        <span style={{ color:C.primary, fontWeight:800 }}>{pct}%</span>
      </div>
      <div style={{ height:6, background:C.mid, borderRadius:10, overflow:"hidden" }}>
        <div style={{
          height:"100%", width:`${pct}%`,
          background:`linear-gradient(90deg, ${C.dark}, ${C.primary})`,
          borderRadius:10, transition:"width 0.4s cubic-bezier(.4,0,.2,1)"
        }}/>
      </div>
    </div>
  );
}

function SectionBadge({ icon, title }) {
  return (
    <div style={{
      display:"inline-flex", alignItems:"center", gap:8,
      background:C.light, borderRadius:30, padding:"7px 18px",
      border:`1.5px solid ${C.mid}`, marginBottom:20
    }}>
      <span style={{ fontSize:16 }}>{icon}</span>
      <span style={{ fontSize:13, fontWeight:700, color:C.dark }}>{title}</span>
    </div>
  );
}

function Option({ label, selected, onClick, shape }) {
  return (
    <button onClick={onClick} style={{
      width:"100%", textAlign:"right", direction:"rtl",
      padding:"12px 16px", borderRadius:12,
      border:`2px solid ${selected ? C.primary : "#E8D8D8"}`,
      background: selected ? C.light : C.white,
      color: selected ? C.dark : C.text,
      fontFamily:"Tajawal, sans-serif", fontSize:15,
      fontWeight: selected ? 700 : 400,
      cursor:"pointer", transition:"all 0.16s ease",
      display:"flex", alignItems:"center", gap:12,
      marginBottom:8, boxShadow: selected ? `0 2px 12px rgba(193,126,126,0.2)` : "none"
    }}>
      <span style={{
        width:20, height:20, flexShrink:0,
        borderRadius: shape === "circle" ? "50%" : 5,
        border:`2px solid ${selected ? C.primary : "#CCC"}`,
        background: selected ? C.primary : "transparent",
        display:"flex", alignItems:"center", justifyContent:"center",
        transition:"all 0.16s", flexShrink:0
      }}>
        {selected && <span style={{ color:"white", fontSize:11, lineHeight:1 }}>✓</span>}
      </span>
      <span style={{ flex:1 }}>{label}</span>
    </button>
  );
}

function QuestionCard({ q, answer, onChange, qIndex, total }) {
  const inputRef = useRef(null);

  const toggle = (opt) => {
    if (q.type === "single") { onChange(opt); return; }
    if (q.type === "text" || q.type === "textarea") { onChange(opt); return; }
    const arr = Array.isArray(answer) ? answer : [];
    if (arr.includes(opt)) { onChange(arr.filter(x => x !== opt)); return; }
    if (q.maxSelect && arr.length >= q.maxSelect) return;
    onChange([...arr, opt]);
  };

  const inputStyle = {
    width:"100%", padding:"13px 16px", borderRadius:12,
    border:`2px solid ${C.mid}`, background:C.soft,
    fontFamily:"Tajawal, sans-serif", fontSize:15, color:C.text,
    outline:"none", direction:"rtl", transition:"border 0.2s",
    boxSizing:"border-box"
  };

  return (
    <div style={{ direction:"rtl", fontFamily:"Tajawal, sans-serif" }}>
      {q.sectionTitle && <SectionBadge icon={q.sectionIcon} title={q.sectionTitle} />}
      <ProgressBar current={qIndex + 1} total={total} />

      <p style={{
        fontSize:18, fontWeight:800, color:C.text,
        lineHeight:1.65, marginBottom:6
      }}>
        {q.text}
        {!q.required &&
          <span style={{ fontSize:12, color:C.gray, fontWeight:400, marginRight:8 }}>(اختياري)</span>
        }
      </p>

      {q.hint && (
        <p style={{ fontSize:13, color:C.gray, marginBottom:16, fontStyle:"italic" }}>
          {q.hint}
          {q.maxSelect && Array.isArray(answer) && answer.length > 0 &&
            <span style={{ color:C.primary, fontWeight:700, marginRight:6 }}>
              ({answer.length}/{q.maxSelect})
            </span>
          }
        </p>
      )}

      {q.type === "textarea" ? (
        <textarea
          ref={inputRef}
          key={q.id}
          defaultValue={answer || ""}
          onBlur={e => onChange(e.target.value)}
          onChange={e => onChange(e.target.value)}
          placeholder={q.placeholder}
          rows={5}
          style={{ ...inputStyle, resize:"vertical", lineHeight:1.8 }}
          onFocus={e => e.target.style.borderColor = C.primary}
        />
      ) : q.type === "text" ? (
        <input
          ref={inputRef}
          key={q.id}
          type="text"
          defaultValue={answer || ""}
          onBlur={e => onChange(e.target.value)}
          onChange={e => onChange(e.target.value)}
          placeholder={q.placeholder}
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = C.primary}
        />
      ) : (
        <div style={{ marginTop:8 }}>
          {q.options.map(opt => (
            <Option
              key={opt} label={opt}
              selected={q.type === "multi"
                ? Array.isArray(answer) && answer.includes(opt)
                : answer === opt}
              onClick={() => toggle(opt)}
              shape={q.type === "single" ? "circle" : "square"}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// ADMIN
// ═══════════════════════════════════════════
function AdminPanel({ responses, onClose }) {
  const total = responses.length;
  const count = (qid, val) =>
    responses.filter(r => Array.isArray(r[qid]) ? r[qid].includes(val) : r[qid] === val).length;
  const pct = n => total > 0 ? Math.round((n / total) * 100) : 0;

  const Bar = ({ label, n }) => (
    <div style={{ marginBottom:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:3, color:C.text }}>
        <span style={{ flex:1, paddingLeft:8 }}>{label}</span>
        <span style={{ fontWeight:700, color:C.primary, flexShrink:0 }}>{n} ({pct(n)}%)</span>
      </div>
      <div style={{ height:7, background:C.mid, borderRadius:10, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct(n)}%`, background:`linear-gradient(90deg,${C.dark},${C.primary})`, borderRadius:10 }}/>
      </div>
    </div>
  );

  const exportCSV = () => {
    if (responses.length === 0) return;
    const headers = QUESTIONS.map(q => q.text).concat(["الوقت"]);
    const rows = responses.map(r =>
      QUESTIONS.map(q => {
        const v = r[q.id];
        return Array.isArray(v) ? v.join(" | ") : (v || "");
      }).concat([r.timestamp || ""])
    );
    const csv = [headers, ...rows].map(row =>
      row.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")
    ).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type:"text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "dorra_survey.csv"; a.click();
  };

  const contacts = responses.filter(r => r.q12 || r.q13 || r.q14);

  const statGroups = [
    { qid:"q1",   title:"الجنس",                    opts: QUESTIONS[0].options },
    { qid:"q1b",  title:"الجنسية",                  opts: QUESTIONS[1].options },
    { qid:"q1c",  title:"الإمارة",                  opts: QUESTIONS[2].options },
    { qid:"q2",   title:"الفئة العمرية",             opts: QUESTIONS[3].options },
    { qid:"q3",   title:"الوضع الحالي",              opts: QUESTIONS[4].options },
    { qid:"q3b",  title:"الحالة الاجتماعية",         opts: QUESTIONS[5].options },
    { qid:"q3c",  title:"وجود أبناء",               opts: QUESTIONS[6].options },
    { qid:"q4",   title:"علاقة بالقراءة",            opts: QUESTIONS[7].options },
    { qid:"q5",   title:"الموضوعات المفضلة",         opts: QUESTIONS[8].options },
    { qid:"q6",   title:"المحتوى العربي",             opts: QUESTIONS[9].options },
    { qid:"q7",   title:"البرامج والمشاريع المطلوبة", opts: QUESTIONS[10].options },
    { qid:"q8",   title:"الاستشارات الأسرية",        opts: QUESTIONS[11].options },
    { qid:"q8b",  title:"الاستشارات الثقافية",       opts: QUESTIONS[12].options },
    { qid:"q9",   title:"قابلية الدفع للبرامج",      opts: QUESTIONS[13].options },
    { qid:"q10",  title:"طريقة المشاركة",             opts: QUESTIONS[14].options },
    { qid:"q11",  title:"الانضمام لدُرَّة",           opts: QUESTIONS[15].options },
  ];

  return (
    <div style={{ fontFamily:"Tajawal, sans-serif", direction:"rtl", padding:"24px 20px 60px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ fontSize:22, color:C.dark, fontWeight:800 }}>لوحة النتائج — دُرَّة</h2>
          <p style={{ fontSize:14, color:C.gray }}>{total} استجابة مسجلة</p>
        </div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <button onClick={exportCSV} style={{
            background:`linear-gradient(135deg,${C.dark},${C.primary})`,
            color:"white", border:"none", borderRadius:20,
            padding:"9px 20px", cursor:"pointer",
            fontFamily:"Tajawal, sans-serif", fontWeight:700, fontSize:13
          }}>⬇️ تصدير CSV</button>
          <button onClick={onClose} style={{
            background:C.soft, border:`1px solid ${C.mid}`, borderRadius:20,
            padding:"9px 20px", cursor:"pointer",
            color:C.dark, fontFamily:"Tajawal, sans-serif", fontWeight:700, fontSize:13
          }}>← العودة</button>
        </div>
      </div>

      {total === 0 ? (
        <div style={{ textAlign:"center", padding:60, color:C.gray }}>
          <div style={{ fontSize:48, marginBottom:16 }}>📊</div>
          <p style={{ fontSize:15 }}>لا توجد استجابات بعد</p>
        </div>
      ) : (
        <>
          {statGroups.map(({ qid, title, opts }) => (
            <div key={qid} style={{
              background:C.white, borderRadius:16, padding:"20px 24px",
              marginBottom:14, border:`1px solid #F0E0E0`,
              boxShadow:"0 2px 12px rgba(193,126,126,0.07)"
            }}>
              <h3 style={{ fontSize:15, fontWeight:800, color:C.dark, marginBottom:16 }}>{title}</h3>
              {opts.map(opt => <Bar key={opt} label={opt} n={count(qid, opt)} />)}
            </div>
          ))}

          {contacts.length > 0 && (
            <div style={{
              background:C.light, borderRadius:16, padding:"20px 24px",
              border:`1px solid ${C.mid}`, marginTop:8
            }}>
              <h3 style={{ fontSize:15, fontWeight:800, color:C.dark, marginBottom:16 }}>
                📋 جهات التواصل ({contacts.length})
              </h3>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                  <thead>
                    <tr style={{ background:C.mid }}>
                      {["الاسم","واتساب","البريد الإلكتروني","الإمارة","العمر"].map(h => (
                        <th key={h} style={{ padding:"8px 12px", textAlign:"right", color:C.dark, fontWeight:700, whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((r, i) => (
                      <tr key={i} style={{ background: i%2===0 ? C.white : C.soft }}>
                        <td style={{ padding:"8px 12px", color:C.text }}>{r.q12 || "—"}</td>
                        <td style={{ padding:"8px 12px", color:C.text }}>{r.q13 || "—"}</td>
                        <td style={{ padding:"8px 12px", color:C.text }}>{r.q14 || "—"}</td>
                        <td style={{ padding:"8px 12px", color:C.text }}>{r.q1c || "—"}</td>
                        <td style={{ padding:"8px 12px", color:C.text }}>{r.q2 || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {responses.filter(r => r.q11b).length > 0 && (
            <div style={{
              background:C.white, borderRadius:16, padding:"20px 24px",
              border:`1px solid #F0E0E0`, marginTop:14,
              boxShadow:"0 2px 12px rgba(193,126,126,0.07)"
            }}>
              <h3 style={{ fontSize:15, fontWeight:800, color:C.dark, marginBottom:16 }}>
                💬 ملاحظات واقتراحات ({responses.filter(r => r.q11b).length})
              </h3>
              {responses.filter(r => r.q11b).map((r, i) => (
                <div key={i} style={{
                  background:C.soft, borderRadius:10, padding:"12px 16px",
                  marginBottom:10, fontSize:14, color:C.text, lineHeight:1.7,
                  borderRight:`3px solid ${C.primary}`
                }}>
                  <div style={{ fontSize:12, color:C.gray, marginBottom:4 }}>
                    {r.q12 || "مجهولة"} — {r.q1c || ""} — {r.q2 || ""}
                  </div>
                  {r.q11b}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════
export default function DorraSurvey() {
  const [step, setStep]       = useState("intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [responses, setResponses] = useState([]);
  const [error, setError]     = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [showAdmin, setShowAdmin] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      window.storage.get("dorra_v2_responses").then(r => {
        if (r) setResponses(JSON.parse(r.value));
      }).catch(() => {});
    } catch {}
  }, []);

  const q = QUESTIONS[current];
  const total = QUESTIONS.length;

  const handleAnswer = (val) => {
    setAnswers(prev => ({ ...prev, [q.id]: val }));
    setError("");
  };

  const next = () => {
    const ans = answers[q.id];
    if (q.required && (!ans || (Array.isArray(ans) && ans.length === 0))) {
      setError("يرجى الإجابة قبل المتابعة 🌸");
      return;
    }
    setError("");
    if (current < total - 1) { setCurrent(c => c + 1); }
    else { submit(); }
  };

  const prev = () => {
    if (current > 0) { setCurrent(c => c - 1); setError(""); }
  };

  const submit = async () => {
    setSubmitting(true);
    const entry = { ...answers, timestamp: new Date().toISOString() };
    const updated = [...responses, entry];
    setResponses(updated);
    try {
      await window.storage.set("dorra_v2_responses", JSON.stringify(updated));
    } catch {}
    await sendToSheets(entry);
    setSubmitting(false);
    setStep("done");
  };

  const openAdmin = () => {
    if (adminPass === "dorra2025") { setStep("admin"); setShowAdmin(false); setError(""); }
    else setError("كلمة المرور غير صحيحة");
  };

  // ── SHARED LAYOUT ──
  const Layout = ({ children, noPad }) => (
    <div style={{
      minHeight:"100vh", background:C.cream,
      fontFamily:"Tajawal, sans-serif", direction:"rtl",
      display:"flex", flexDirection:"column", alignItems:"center"
    }}>
      {/* Header */}
      <div style={{
        width:"100%",
        background:`linear-gradient(135deg, ${C.dark} 0%, ${C.primary} 60%, ${C.accent} 100%)`,
        padding:"26px 24px 20px", textAlign:"center",
        boxShadow:"0 4px 20px rgba(139,74,74,0.25)"
      }}>
        <div style={{ fontSize:28, fontWeight:800, color:"white", letterSpacing:3, textShadow:"0 2px 8px rgba(0,0,0,0.2)" }}>جمعية دُرَّة</div>
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.8)", marginTop:4, letterSpacing:1 }}>مجتمع نسائي ثقافي — أبوظبي، الإمارات العربية المتحدة</div>
      </div>
      <div style={{
        width:"100%", maxWidth:540,
        padding: noPad ? 0 : "28px 20px 60px",
        flex:1
      }}>
        {children}
      </div>
      {/* Footer */}
      <div style={{
        width:"100%", textAlign:"center",
        padding:"18px 24px",
        borderTop:`1px solid ${C.mid}`,
        background:C.white
      }}>
        <div style={{ fontSize:12, color:C.gray, lineHeight:1.9 }}>
          © {new Date().getFullYear()} جمعية دُرَّة للمشاريع الثقافية والتربوية
          <br/>
          <span style={{ fontSize:11, color:C.mid }}>
            جميع الحقوق محفوظة · أبوظبي، دولة الإمارات العربية المتحدة
            <br/>
            البيانات المُدخلة سرية وتُستخدم لأغراض بحثية وتطويرية داخلية فقط
          </span>
        </div>
      </div>
    </div>
  );

  // ── INTRO ──
  if (step === "intro") return (
    <Layout>
      <div style={{ textAlign:"center", marginBottom:28, paddingTop:8 }}>
        <div style={{ fontSize:36, marginBottom:12, lineHeight:1 }}>◇ ◆ ◇</div>
        <h1 style={{ fontSize:26, fontWeight:800, color:C.dark, marginBottom:14, lineHeight:1.4 }}>
          أخبرينا عنكِ
        </h1>
        <p style={{ fontSize:15.5, color:C.gray, lineHeight:2, maxWidth:380, margin:"0 auto" }}>
          نحن دُرَّة — جمعية ثقافية تربوية ناشئة في إمارة أبوظبي، دولة الإمارات العربية المتحدة. نؤمن أن المرأة التي تقرأ وتتعلم وتنتمي لمجتمع ملهم تصنع فرقاً حقيقياً.
          <br/>قبل أن ننطلق، أردنا أن نسمعكِ أنتِ.
        </p>
      </div>

      <div style={{
        background:C.white, borderRadius:16, padding:"18px 20px",
        border:`1.5px solid ${C.mid}`, marginBottom:24,
        display:"flex", alignItems:"center", gap:14,
        boxShadow:"0 2px 16px rgba(193,126,126,0.1)"
      }}>
        <span style={{ fontSize:30, flexShrink:0 }}>⏱️</span>
        <div>
          <div style={{ fontWeight:700, fontSize:15, color:C.text }}>5 دقائق فقط</div>
          <div style={{ fontSize:13, color:C.gray, marginTop:2 }}>19 سؤالاً — وكل إجابة تُشكّل معنا دُرَّة</div>
        </div>
      </div>

      <button onClick={() => setStep("survey")} style={{
        width:"100%", padding:"15px", borderRadius:14,
        background:`linear-gradient(135deg, ${C.dark}, ${C.primary})`,
        color:"white", fontSize:17, fontWeight:800, border:"none",
        cursor:"pointer", fontFamily:"Tajawal, sans-serif",
        boxShadow:`0 6px 24px rgba(139,74,74,0.35)`,
        transition:"transform 0.1s"
      }}
        onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"}
        onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
      >
        ابدئي الاستبيان 🌸
      </button>

      {/* Admin */}
      <div style={{ textAlign:"center", marginTop:36 }}>
        <button onClick={() => setShowAdmin(v => !v)} style={{
          background:"none", border:"none", color:C.mid,
          fontSize:12, cursor:"pointer", fontFamily:"Tajawal, sans-serif"
        }}>⚙️ لوحة النتائج</button>

        {showAdmin && (
          <div style={{ marginTop:12, display:"flex", gap:8, justifyContent:"center", alignItems:"center" }}>
            <input
              type="password"
              placeholder="كلمة المرور"
              value={adminPass}
              onChange={e => setAdminPass(e.target.value)}
              onKeyDown={e => e.key === "Enter" && openAdmin()}
              style={{
                padding:"8px 14px", borderRadius:8,
                border:`1px solid ${C.mid}`, fontFamily:"Tajawal, sans-serif",
                fontSize:14, direction:"ltr", outline:"none", width:150
              }}
            />
            <button onClick={openAdmin} style={{
              background:C.primary, color:"white", border:"none",
              borderRadius:8, padding:"8px 16px", cursor:"pointer",
              fontFamily:"Tajawal, sans-serif", fontSize:13, fontWeight:700
            }}>دخول</button>
          </div>
        )}
        {showAdmin && error && (
          <div style={{ color:"tomato", fontSize:12, marginTop:6 }}>{error}</div>
        )}
      </div>
    </Layout>
  );

  // ── SURVEY ──
  if (step === "survey") return (
    <Layout>
      <QuestionCard
        q={q} answer={answers[q.id]}
        onChange={handleAnswer}
        qIndex={current} total={total}
      />

      {error && (
        <div style={{
          marginTop:12, padding:"10px 16px", borderRadius:10,
          background:"#FFF0F0", color:"#C0392B", fontSize:14, fontWeight:600
        }}>{error}</div>
      )}

      <div style={{ display:"flex", gap:10, marginTop:24 }}>
        {current > 0 && (
          <button onClick={prev} style={{
            flex:1, padding:"13px", borderRadius:12,
            border:`2px solid ${C.mid}`, background:C.white,
            color:C.dark, fontSize:15, fontWeight:700,
            cursor:"pointer", fontFamily:"Tajawal, sans-serif"
          }}>→ السابق</button>
        )}
        <button onClick={next} disabled={submitting} style={{
          flex:2, padding:"13px", borderRadius:12,
          background: submitting ? C.mid : `linear-gradient(135deg, ${C.dark}, ${C.primary})`,
          color:"white", fontSize:16, fontWeight:800, border:"none",
          cursor: submitting ? "default" : "pointer",
          fontFamily:"Tajawal, sans-serif",
          boxShadow: submitting ? "none" : `0 4px 16px rgba(139,74,74,0.3)`,
          transition:"all 0.2s"
        }}>
          {submitting ? "جاري الإرسال..." : current < total - 1 ? "← التالي" : "إرسال الاستبيان 🌸"}
        </button>
      </div>
    </Layout>
  );

  // ── DONE ──
  if (step === "done") return (
    <Layout>
      <div style={{ textAlign:"center", padding:"40px 0 20px" }}>
        <div style={{
          width:80, height:80, borderRadius:"50%",
          background:`linear-gradient(135deg,${C.dark},${C.primary})`,
          display:"flex", alignItems:"center", justifyContent:"center",
          margin:"0 auto 24px", fontSize:36,
          boxShadow:`0 8px 32px rgba(139,74,74,0.35)`
        }}>🌸</div>
        <h2 style={{ fontSize:26, fontWeight:800, color:C.dark, marginBottom:14 }}>
          شكراً من القلب 🤍
        </h2>
        <p style={{ fontSize:15.5, color:C.gray, lineHeight:2, maxWidth:340, margin:"0 auto 32px" }}>
          كل إجابة وضعتِها ستُضيء لنا طريقاً.
          <br/>دُرَّة قادمة — وأنتِ جزء من بدايتها.
        </p>
        <div style={{
          background:C.light, borderRadius:16, padding:"20px 24px",
          border:`1.5px solid ${C.mid}`, maxWidth:360, margin:"0 auto"
        }}>
          <div style={{ fontSize:14, color:C.dark, fontWeight:700 }}>
            تابعينا قريباً على منصاتنا 🌿
          </div>
          <div style={{ fontSize:13, color:C.gray, marginTop:6, lineHeight:1.7 }}>
            سيتم التواصل معكِ عند الانطلاق إن تركتِ بياناتكِ
          </div>
        </div>
      </div>
    </Layout>
  );

  // ── ADMIN ──
  if (step === "admin") return (
    <Layout noPad>
      <AdminPanel
        responses={responses}
        onClose={() => setStep("intro")}
      />
    </Layout>
  );

  return null;
}
