import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════
// COLORS
// ═══════════════════════════════════════════
const C = {
  primary: "#C17E7E",
  dark: "#8B4A4A",
  light: "#FDF0F0",
  mid: "#E8C4C4",
  cream: "#FDF8F8",
  text: "#2D1F1F",
  gray: "#8A6E6E",
  white: "#FFFFFF",
  accent: "#D4929E",
  soft: "#F5E6E6",
};

// ═══════════════════════════════════════════
// GOOGLE SHEETS WEBHOOK
// ═══════════════════════════════════════════
const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbwbqpDWm2tvn_M0Si4LVArjFcG9Oq11X5LLOuJ7zMglBJw7Mt3aOz3QPHbHf4HQ1KKF/exec";

async function sendToSheets(data) {
  try {
    const body = new URLSearchParams();

    // نرسل نسخة كاملة كـ JSON
    body.append("data", JSON.stringify(data));

    // ونرسل كل إجابة كحقل مستقل احتياطياً
    Object.keys(data).forEach((key) => {
      const value = data[key];
      body.append(
        key,
        Array.isArray(value) ? value.join(" | ") : String(value ?? "")
      );
    });

    await fetch(SHEET_URL, {
      method: "POST",
      mode: "no-cors",
      body,
    });
  } catch (e) {
    console.log("Sheet sync failed:", e);
  }
}


function fetchResponsesFromSheets() {
  return new Promise((resolve, reject) => {
    const callbackName =
      "dorraSheetCallback_" +
      Date.now() +
      "_" +
      Math.random().toString(36).slice(2);

    const script = document.createElement("script");
    const separator = SHEET_URL.includes("?") ? "&" : "?";

    const cleanup = () => {
      try {
        delete window[callbackName];
      } catch {
        window[callbackName] = undefined;
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };

    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error("انتهت مهلة تحميل النتائج من Google Sheets"));
    }, 12000);

    window[callbackName] = (payload) => {
      window.clearTimeout(timer);
      cleanup();

      if (payload && payload.status === "ok" && Array.isArray(payload.responses)) {
        resolve(payload.responses);
      } else {
        reject(new Error("صيغة الرد من Google Sheets غير صحيحة"));
      }
    };

    script.onerror = () => {
      window.clearTimeout(timer);
      cleanup();
      reject(new Error("تعذر الاتصال بـ Google Sheets"));
    };

    script.src =
      SHEET_URL +
      separator +
      "callback=" +
      encodeURIComponent(callbackName) +
      "&t=" +
      Date.now();

    document.body.appendChild(script);
  });
}

const NATIONALITIES = [
  "الإمارات العربية المتحدة",
  "السعودية",
  "الكويت",
  "البحرين",
  "قطر",
  "عُمان",
  "اليمن",
  "العراق",
  "الأردن",
  "فلسطين",
  "لبنان",
  "سوريا",
  "مصر",
  "السودان",
  "ليبيا",
  "تونس",
  "الجزائر",
  "المغرب",
  "موريتانيا",
  "الصومال",
  "جيبوتي",
  "جزر القمر",
  "أفغانستان",
  "ألبانيا",
  "أرمينيا",
  "أذربيجان",
  "أستراليا",
  "النمسا",
  "البوسنة والهرسك",
  "بنغلاديش",
  "بلجيكا",
  "بلغاريا",
  "البرازيل",
  "بروناي",
  "كندا",
  "الصين",
  "الهند",
  "إندونيسيا",
  "إيران",
  "باكستان",
  "ماليزيا",
  "الفلبين",
  "سنغافورة",
  "تايلاند",
  "تركيا",
  "اليابان",
  "كوريا الجنوبية",
  "كوريا الشمالية",
  "فيتنام",
  "سريلانكا",
  "نيبال",
  "المالديف",
  "بوتان",
  "ميانمار",
  "كمبوديا",
  "لاوس",
  "منغوليا",
  "كازاخستان",
  "أوزبكستان",
  "تركمانستان",
  "قرغيزستان",
  "طاجيكستان",
  "روسيا",
  "أوكرانيا",
  "بيلاروسيا",
  "مولدوفا",
  "بولندا",
  "ألمانيا",
  "فرنسا",
  "إيطاليا",
  "إسبانيا",
  "البرتغال",
  "هولندا",
  "الدنمارك",
  "السويد",
  "النرويج",
  "فنلندا",
  "آيسلندا",
  "سويسرا",
  "إيرلندا",
  "المملكة المتحدة",
  "اليونان",
  "قبرص",
  "مالطا",
  "رومانيا",
  "المجر",
  "التشيك",
  "سلوفاكيا",
  "سلوفينيا",
  "كرواتيا",
  "صربيا",
  "الجبل الأسود",
  "كوسوفو",
  "مقدونيا الشمالية",
  "ليتوانيا",
  "لاتفيا",
  "إستونيا",
  "لوكسمبورغ",
  "موناكو",
  "أندورا",
  "سان مارينو",
  "الفاتيكان",
  "الولايات المتحدة الأمريكية",
  "المكسيك",
  "كوبا",
  "جامايكا",
  "هايتي",
  "جمهورية الدومينيكان",
  "غواتيمالا",
  "هندوراس",
  "السلفادور",
  "نيكاراغوا",
  "كوستاريكا",
  "بنما",
  "كولومبيا",
  "فنزويلا",
  "الإكوادور",
  "بيرو",
  "بوليفيا",
  "تشيلي",
  "الأرجنتين",
  "الأوروغواي",
  "باراغواي",
  "غانا",
  "نيجيريا",
  "السنغال",
  "مالي",
  "النيجر",
  "تشاد",
  "إثيوبيا",
  "إريتريا",
  "كينيا",
  "تنزانيا",
  "أوغندا",
  "رواندا",
  "بوروندي",
  "جنوب السودان",
  "إفريقيا الوسطى",
  "الكاميرون",
  "الغابون",
  "غينيا",
  "غينيا بيساو",
  "سيراليون",
  "ليبيريا",
  "ساحل العاج",
  "بوركينا فاسو",
  "بنين",
  "توغو",
  "غامبيا",
  "الرأس الأخضر",
  "ساو تومي وبرينسيب",
  "غينيا الاستوائية",
  "الكونغو",
  "جمهورية الكونغو الديمقراطية",
  "أنغولا",
  "زامبيا",
  "زيمبابوي",
  "موزمبيق",
  "مالاوي",
  "ناميبيا",
  "بوتسوانا",
  "جنوب إفريقيا",
  "ليسوتو",
  "إسواتيني",
  "مدغشقر",
  "موريشيوس",
  "سيشل",
  "نيوزيلندا",
  "فيجي",
  "بابوا غينيا الجديدة",
  "ساموا",
  "تونغا",
  "غير ذلك"
];

// ═══════════════════════════════════════════
// QUESTIONS
// ═══════════════════════════════════════════
const QUESTIONS = [
  {
    id: "q1",
    section: 1,
    sectionTitle: "عنكِ أنتِ",
    sectionIcon: "👤",
    text: "الجنس",
    type: "single",
    required: true,
    options: ["أنثى", "ذكر"],
  },
  {
    id: "q1b",
    section: 1,
    text: "الجنسية",
    type: "select",
    required: true,
    placeholder: "اختاري الجنسية",
    options: NATIONALITIES,
  },
  {
    id: "q1c",
    section: 1,
    text: "أين تقيمين؟",
    type: "select",
    required: true,
    placeholder: "اختاري مكان الإقامة",
    options: [
      "أبوظبي",
      "دبي",
      "الشارقة",
      "عجمان",
      "أم القيوين",
      "رأس الخيمة",
      "الفجيرة",
      "خارج دولة الإمارات العربية المتحدة",
    ],
  },
  {
    id: "q2",
    section: 1,
    text: "كم عمركِ؟",
    type: "single",
    required: true,
    options: [
      "أقل من 15 سنة",
      "15 – 18 سنة",
      "19 – 24 سنة",
      "25 – 30 سنة",
      "31 – 35 سنة",
      "أكبر من 35 سنة",
    ],
  },
  {
    id: "q3",
    section: 1,
    text: "ما الأقرب لوضعكِ حالياً؟",
    hint: "يمكن اختيار أكثر من إجابة",
    type: "multi",
    required: true,
    options: [
      "طالبة",
      "موظفة",
      "صانعة أجيال (ربة منزل)",
      "رائدة أعمال",
      "أبحث عن عمل",
      "غير موظفة",
      "متقاعدة",
    ],
  },
  {
    id: "q3b",
    section: 1,
    text: "ما حالتكِ الاجتماعية؟",
    type: "single",
    required: true,
    options: ["عزباء", "متزوجة", "مطلقة", "أرملة"],
  },
  {
    id: "q3c",
    hidden: true,
    section: 1,
    text: "هل لديكِ أبناء؟",
    type: "single",
    required: true,
    options: ["نعم", "لا"],
  },
  {
    id: "q4",
    section: 2,
    sectionTitle: "علاقتكِ بالثقافة والقراءة",
    sectionIcon: "📚",
    text: "هل تحبين القراءة؟",
    type: "single",
    required: true,
    options: [
      "نعم، أقرأ كثيراً",
      "أقرأ أحياناً",
      "أحب القراءة لكن لا أجد ما يناسبني",
      "لا أقرأ كثيراً حالياً",
    ],
  },
  {
    id: "q5",
    section: 2,
    text: "من بين الموضوعات التالية، أيها أقرب إلى اهتمامك؟",
    hint: "اختاري حتى 3 موضوعات",
    type: "multi",
    maxSelect: 3,
    required: true,
    options: [
      "التطوير الشخصي والعلاقات",
      "التربية والأسرة",
      "الأدب والروايات العربية",
      "الثقافة العامة والفكر",
      "الكتب والمحتوى المترجم",
    ],
  },
  {
    id: "q6",
    section: 2,
    text: "هل تجدين المحتوى الثقافي العربي المتنوع متاحًا لكِ؟",
    hint: "المحتوى الثقافي: الكتب، المنشورات، المحتوى الرقمي، ...",
    type: "single",
    required: true,
    options: [
      "نعم، أجد ما يناسبني",
      "أجد بعض المحتوى، لكن أحتاج ما هو أفضل",
      "قليل، ولا أجد ما أحتاجه بسهولة",
      "غالباً أبحث عن محتوى باللغة الإنجليزية",
    ],
  },
  {
    id: "q7",
    section: 3,
    sectionTitle: "ما تحتاجينه",
    sectionIcon: "✨",
    text: "ما البرامج التي تتمنين وجودها؟",
    hint: "اختاري حتى 3 خيارات",
    type: "multi",
    maxSelect: 3,
    required: true,
    options: [
      "صالون قرائي شهري (نقاش كتاب مع مجموعة)",
      "ورش ثقافية في القراءة والكتابة والتفكير",
      "استشارات تربوية وأسرية",
      "استشارات ثقافية وفكرية",
      "ملتقيات ثقافية في (مدارس، جامعات، جهات عمل)",
      "حلقات قرائية فردية وثنائية",
      "إنتاج كتب عربية نوعية",
    ],
  },
  {
    id: "q8",
    section: 3,
    text: "هل سبق أن احتجتِ استشارةً تربوية أو أسرية؟",
    type: "single",
    required: true,
    options: [
      "نعم، لكن لم تكن بالمستوى المطلوب",
      "نعم، ووجدت استشارة جيدة",
      "لا أحتاجها حالياً، لكن يهمني وجودها",
      "لا أحتاجها حاليًا",
    ],
  },
  {
    id: "q8b",
    section: 3,
    text: "هل سبق أن أردتِ مناقشة كتاب أو فكرة ثقافية مع متخصصة ولم تجدي الفرصة؟",
    type: "single",
    required: true,
    options: [
      "نعم، كثيراً — هذا ما أبحث عنه",
      "أحياناً تخطر لي هذه الرغبة",
      "لم يخطر لي ذلك من قبل",
      "لديّ من أناقشه في هذا",
    ],
  },
  {
    id: "q9",
    section: 3,
    text: "إذا قدّمت دُرَّة برنامجاً ثقافياً يوافق اهتماماتكِ — ما الذي يناسبكِ؟",
    hint: "يمكنكِ اختيار أكثر من إجابة",
    type: "multi",
    required: true,
    options: [
      "أشارك في البرامج المجانية",
      "مستعدة للدفع حتى 100 درهم للبرنامج الواحد",
      "مستعدة للدفع بين 100 – 500 درهم",
      "مستعدة للدفع بين 500 – 1000 درهم",
      "لا يهمني المبلغ إذا كان البرنامج نافعاً فعلاً",
    ],
  },
  {
    id: "q10",
    section: 3,
    text: "كيف تفضلين المشاركة؟",
    type: "single",
    required: true,
    options: [
      "حضوريًا (في أبوظبي)",
      "عن بُعد / أونلاين",
      "كلاهما يناسبني",
      "حسب الموضوع والوقت",
      "لا يناسبني أيٌّ منها حالياً",
    ],
  },
  {
    id: "q11",
    section: 4,
    sectionTitle: "دُرَّة والتطوع",
    sectionIcon: "🌿",
    text: "دُرَّة مجتمع نسائي ثقافي ناشئ — هل يسعدكِ أن تكوني جزءاً منه؟",
    type: "single",
    required: true,
    options: [
      "أود التطوع فقط",
      "أود الاستفادة فقط (المشاركة في الرامج والأنشطة)",
      "أود الاثنين معاً",
      "سأرى عندما تنطلقون",
    ],
  },
  {
    id: "q11b",
    section: 4,
    text: "هل لديكِ ملاحظة، اقتراح، أو شيء تودّين مشاركتنا إياه؟ 💬",
    hint: "مساحتكِ الحرة — كل كلمة تقولينها تُهمنا",
    type: "textarea",
    required: false,
    placeholder: "اكتبي ما يخطر في بالكِ...",
  },
  {
    id: "q12",
    section: 4,
    text: "بيانات التواصل",
    hint: "إن كنتِ تودين أن تكوني جزءًا من دُرَّة",
    subHint:
      "اتركي بياناتكِ إن أحببتِ أن نبقى على تواصل معكِ، سواء للتطوع، أو حضور البرامج، أو معرفة أخبار دُرَّة عند الانطلاق.",
    type: "contact",
    required: false,
    fields: [
      {
        id: "q12",
        label: "الاسم",
        placeholder: "اسمكِ الثلاثي...",
        inputMode: "text",
      },
      {
        id: "q13",
        label: "رقم الواتساب",
        placeholder: "05XXXXXXXX",
        inputMode: "numeric",
      },
      {
        id: "q14",
        label: "البريد الإلكتروني",
        placeholder: "example@email.com",
        inputMode: "email",
      },
    ],
  },
];

const MALE_NOTICE = [
  "دُرَّة مساحة ثقافية تربوية ناشئة، وُجهت في أصلها لفهم احتياج الفتاة والمرأة في دولة الإمارات.",
  "ومع ذلك، فإن رأيك محل تقدير إن كنت أبًا، أو زوجًا، أو متخصصًا؛ وترى أهمية وجود مؤسسات تدعم فكر المرأة وأثرها في أسرتها ومجتمعها.",
  "نرجو أن تجيب عن الأسئلة التالية من زاوية ما تراه من احتياجات الفتيات والنساء من حولك، أو من واقع خبرتك واهتمامك.",
];

const MALE_QUESTIONS = [
  {
    id: "q1b",
    section: 1,
    sectionTitle: "رؤيتك واهتمامك",
    sectionIcon: "👤",
    text: "الجنسية",
    type: "select",
    required: true,
    placeholder: "اختر الجنسية",
    options: NATIONALITIES,
  },
  {
    id: "q1c",
    section: 1,
    text: "أين تقيم حالياً؟",
    type: "select",
    required: true,
    placeholder: "اختر مكان الإقامة",
    options: [
      "أبوظبي",
      "دبي",
      "الشارقة",
      "عجمان",
      "أم القيوين",
      "رأس الخيمة",
      "الفجيرة",
      "خارج دولة الإمارات العربية المتحدة",
    ],
  },
  {
    id: "q2",
    section: 1,
    text: "إلى أي فئة عمرية تنتمي؟",
    type: "single",
    required: true,
    options: ["أقل من 25 سنة", "25 – 40 سنة", "أكبر من 40 سنة"],
  },
  {
    id: "q3",
    section: 1,
    text: "ما الأقرب لدورك أو صلتك بهذا الموضوع؟",
    hint: "يمكنك اختيار أكثر من إجابة",
    type: "multi_other",
    required: true,
    otherOption: "غير ذلك",
    otherKey: "q3_other",
    otherPlaceholder: "اكتب صلتك بالموضوع...",
    options: [
      "أب / زوج",
      "مختص في التربية أو الأسرة",
      "مهتم بالثقافة والعمل المجتمعي",
      "غير ذلك",
    ],
  },
  {
    id: "q3b",
    section: 1,
    text: "من الفئات التي ترى أنها قد تستفيد أكثر من برامج دُرَّة؟",
    hint: "يمكنك اختيار أكثر من إجابة",
    type: "multi",
    required: true,
    options: [
      "الفتيات في سن الدراسة",
      "طالبات الجامعة",
      "المتزوجات حديثًا",
      "الأمهات",
      "العاطلات عن العمل",
      "الموظفات",
    ],
  },
  {
    id: "q4",
    section: 2,
    sectionTitle: "القراءة والثقافة",
    sectionIcon: "📚",
    text: "كيف ترى علاقة الفتيات والنساء من حولك بالقراءة والثقافة؟",
    type: "single",
    required: true,
    options: [
      "لديهن اهتمام واضح بالقراءة والثقافة",
      "لديهن اهتمام، لكنه يحتاج تشجيعًا وتنظيمًا",
      "الاهتمام موجود عند بعضهن فقط",
      "أرى أن القراءة والثقافة ليستا حاضرتين بما يكفي",
    ],
  },
  {
    id: "q5",
    section: 2,
    text: "ما الموضوعات التي ترى أنها أنفع للفتيات والنساء؟",
    hint: "اختر حتى موضوعين",
    type: "multi",
    maxSelect: 2,
    required: true,
    options: [
      "تطوير الذات والعلاقات",
      "التربية والأسرة",
      "الأدب والروايات العربية",
      "الثقافة العامة والفكر",
      "الكتب والمحتوى المترجم",
    ],
  },
  {
    id: "q6",
    section: 2,
    text: "هل ترى أن المحتوى الثقافي العربي المتنوع متاح للفتاة والمرأة بصورة كافية؟",
    hint: "المحتوى الثقافي: الكتب، المنشورات، المحتوى الرقمي، ...",
    type: "single",
    required: true,
    options: [
      "نعم، متاح بصورة جيدة",
      "متاح، لكنه يحتاج جودة وعمقًا أكبر",
      "قليل، ولا يصل إليهن بسهولة",
      "كثير منهن يتجهن للمحتوى الأجنبي لقلة البدائل المناسبة",
    ],
  },
  {
    id: "q7",
    section: 3,
    sectionTitle: "ما تراه نافعًا",
    sectionIcon: "✨",
    text: "ما البرامج التي ترى أن وجودها سيكون نافعًا للفتاة والمرأة؟",
    hint: "اختر حتى 3 خيارات",
    type: "multi",
    maxSelect: 3,
    required: true,
    options: [
      "لقاءات شهرية لمناقشة الكتب",
      "ورش ثقافية في القراءة والكتابة والتفكير",
      "استشارات تربوية وأسرية",
      "استشارات ثقافية وفكرية",
      "ملتقيات ثقافية في المدارس أو الجامعات أو جهات العمل",
      "حلقات قرائية فردية وثنائية",
      "إنتاج كتب عربية نوعية",
    ],
  },
  {
    id: "q8",
    section: 3,
    text: "من واقع ما تراه، هل هناك حاجة إلى استشارات تربوية أو أسرية موجّهة للمرأة والأسرة؟",
    type: "single",
    required: true,
    options: [
      "نعم، والحاجة واضحة",
      "نعم، لكن الخيارات المتاحة ليست بالمستوى المطلوب",
      "توجد خيارات جيدة، لكنها لا تصل للجميع",
      "لا أرى حاجة كبيرة حاليًا",
    ],
  },
  {
    id: "q8b",
    section: 3,
    text: "هل ترى أن الفتيات والنساء قد يستفدن من مساحة آمنة لمناقشة الكتب والأفكار مع متخصصات؟",
    type: "single",
    required: true,
    options: [
      "نعم، أرى أن ذلك مهم جدًا",
      "ربما، لم أفكر في ذلك من قبل",
      "أرى أن لديهن بدائل كافية حاليًا",
    ],
  },
  {
    id: "q9",
    section: 3,
    text: "إذا قدّمت دُرَّة برنامجًا ثقافيًا نافعًا للفتاة أو المرأة — ما الذي تراه مناسبًا؟",
    hint: "يمكنك اختيار أكثر من إجابة",
    type: "multi",
    required: true,
    options: [
      "أفضّل أن تكون البرامج مجانية",
      "أرى أن الرسوم البسيطة مناسبة حتى 100 درهم",
      "أرى أن 100 – 500 درهم مناسب للبرامج النوعية",
      "أرى أن 500 – 1000 درهم مناسب للبرامج المتخصصة",
      "لا يهمني المبلغ إذا كان البرنامج نافعًا فعلاً",
    ],
  },
  {
    id: "q10",
    section: 3,
    text: "ما الطريقة التي ترى أنها أنسب لمشاركة الفتيات والنساء في هذه البرامج؟",
    type: "single",
    required: true,
    options: [
      "حضوريًا (في أبوظبي)",
      "عن بُعد / أونلاين",
      "كلاهما مناسب",
      "حسب الموضوع والوقت",
      "لا يناسبهن أيٌّ منها حاليًا",
    ],
  },
  {
    id: "q11",
    section: 4,
    sectionTitle: "دُرَّة والدعم المجتمعي",
    sectionIcon: "🌿",
    text: "دُرَّة مجتمع نسائي ثقافي ناشئ — كيف يمكن أن تكون قريبًا منه أو داعمًا له؟",
    type: "single",
    required: true,
    options: [
      "أود المساهمة بخبرتي أو وقتي",
      "أود ترشيح البرامج للنساء من حولي",
      "أود الاثنين معًا",
      "سأرى عندما تنطلقون",
    ],
  },
  {
    id: "q11b",
    section: 4,
    text: "هل لديك ملاحظة، اقتراح، أو شيء تود مشاركتنا إياه؟ 💬",
    hint: "مساحتك الحرة — كل كلمة تقولها تهمنا",
    type: "textarea",
    required: false,
    placeholder: "اكتب ما يخطر في بالك...",
  },
  {
    id: "q12",
    section: 4,
    text: "بيانات التواصل",
    hint: "إن كنت تود أن تكون جزءًا من دُرَّة، أو تساهم بخبرتك أو علاقاتك أو دعمك في خدمة المرأة والأسرة، فاترك بياناتك لنتواصل معك عند الانطلاق.",
    type: "contact",
    required: false,
    fields: [
      {
        id: "q12",
        label: "الاسم",
        placeholder: "اسمك الثلاثي...",
        inputMode: "text",
      },
      {
        id: "q13",
        label: "رقم الواتساب",
        placeholder: "05XXXXXXXX",
        inputMode: "numeric",
      },
      {
        id: "q14",
        label: "البريد الإلكتروني",
        placeholder: "example@email.com",
        inputMode: "email",
      },
    ],
  },
];

// ═══════════════════════════════════════════
// LAYOUT
// ═══════════════════════════════════════════
function Layout({ children, noPad }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.cream,
        fontFamily: "Tajawal, Arial, sans-serif",
        direction: "rtl",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          background: `linear-gradient(135deg, ${C.dark} 0%, ${C.primary} 60%, ${C.accent} 100%)`,
          padding: "26px 24px 20px",
          textAlign: "center",
          boxShadow: "0 4px 20px rgba(139,74,74,0.25)",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "white",
            letterSpacing: 3,
            textShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          جمعية دُرَّة
        </div>
        <div
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.8)",
            marginTop: 4,
            letterSpacing: 1,
          }}
        >
          مجتمع نسائي ثقافي — الإمارات العربية المتحدة
        </div>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 540,
          padding: noPad ? 0 : "28px 20px 60px",
          flex: 1,
          boxSizing: "border-box",
        }}
      >
        {children}
      </div>

      <div
        style={{
          width: "100%",
          textAlign: "center",
          padding: "18px 24px",
          borderTop: `1px solid ${C.mid}`,
          background: C.white,
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontSize: 12, color: C.gray, lineHeight: 1.9 }}>
          © {new Date().getFullYear()} جمعية دُرَّة للمشاريع الثقافية والتربوية
          <br />
          <span style={{ fontSize: 11, color: C.mid }}>
            جميع الحقوق محفوظة · دولة الإمارات العربية المتحدة
            <br />
            البيانات المُدخلة سرية وتُستخدم لأغراض بحثية وتطويرية داخلية فقط
          </span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════
function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100);

  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
          fontSize: 12,
          color: C.gray,
        }}
      >
        <span style={{ fontWeight: 600 }}>
          السؤال {current} من {total}
        </span>
        <span style={{ color: C.primary, fontWeight: 800 }}>{pct}%</span>
      </div>

      <div
        style={{
          height: 6,
          background: C.mid,
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${C.dark}, ${C.primary})`,
            transition: "width 0.4s cubic-bezier(.4,0,.2,1)",
          }}
        />
      </div>
    </div>
  );
}

function SectionBadge({ icon, title }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: C.light,
        borderRadius: 30,
        padding: "7px 18px",
        border: `1.5px solid ${C.mid}`,
        marginBottom: 20,
      }}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>
        {title}
      </span>
    </div>
  );
}

function Option({ label, selected, onClick, shape }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "right",
        direction: "rtl",
        padding: "12px 16px",
        borderRadius: 12,
        border: `2px solid ${selected ? C.primary : "#E8D8D8"}`,
        background: selected ? C.light : C.white,
        color: selected ? C.dark : C.text,
        fontFamily: "Tajawal, Arial, sans-serif",
        fontSize: 15,
        fontWeight: selected ? 700 : 400,
        cursor: "pointer",
        transition: "all 0.16s ease",
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 8,
        boxShadow: selected ? "0 2px 12px rgba(193,126,126,0.2)" : "none",
      }}
    >
      <span
        style={{
          width: 20,
          height: 20,
          flexShrink: 0,
          borderRadius: shape === "circle" ? "50%" : 5,
          border: `2px solid ${selected ? C.primary : "#CCC"}`,
          background: selected ? C.primary : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.16s",
        }}
      >
        {selected && (
          <span style={{ color: "white", fontSize: 11, lineHeight: 1 }}>✓</span>
        )}
      </span>
      <span style={{ flex: 1 }}>{label}</span>
    </button>
  );
}

function QuestionCard({
  q,
  answer,
  allAnswers = {},
  draftAnswers = {},
  currentTextValue,
  onAnswer,
  onTextDraft,
  qIndex,
  total,
}) {
  const inputStyle = {
    width: "100%",
    padding: "13px 16px",
    borderRadius: 12,
    border: `2px solid ${C.mid}`,
    background: C.soft,
    fontFamily: "Tajawal, Arial, sans-serif",
    fontSize: 15,
    color: C.text,
    outline: "none",
    direction: "rtl",
    transition: "border 0.2s",
    boxSizing: "border-box",
  };

  const handleTextInput = (e) => {
    let value = e.currentTarget.value;

    if (q.id === "q13") {
      value = value.replace(/\D/g, "");
      e.currentTarget.value = value;
    }

    onTextDraft(q.id, value);
  };

  const textInputProps =
    q.id === "q13"
      ? { inputMode: "numeric", pattern: "[0-9]*", maxLength: 20 }
      : q.id === "q14"
      ? { inputMode: "email" }
      : {};

  const toggle = (opt) => {
    if (q.type === "single") {
      onAnswer(q.id, opt);
      return;
    }

    const arr = Array.isArray(answer) ? answer : [];

    if (arr.includes(opt)) {
      onAnswer(
        q.id,
        arr.filter((x) => x !== opt)
      );
      return;
    }

    if (q.maxSelect && arr.length >= q.maxSelect) return;

    onAnswer(q.id, [...arr, opt]);
  };

  const childrenQuestion = QUESTIONS.find((item) => item.id === "q3c");
  const shouldShowChildrenQuestion =
    q.id === "q3b" && ["متزوجة", "مطلقة", "أرملة"].includes(answer);

  return (
    <div style={{ direction: "rtl", fontFamily: "Tajawal, Arial, sans-serif" }}>
      {q.sectionTitle && (
        <SectionBadge icon={q.sectionIcon} title={q.sectionTitle} />
      )}

      <ProgressBar current={qIndex + 1} total={total} />

      <p
        style={{
          fontSize: 18,
          fontWeight: 800,
          color: C.text,
          lineHeight: 1.65,
          marginBottom: 6,
        }}
      >
        {q.text}
        {!q.required && (
          <span
            style={{
              fontSize: 12,
              color: C.gray,
              fontWeight: 400,
              marginRight: 8,
            }}
          >
            (اختياري)
          </span>
        )}
      </p>

      {q.hint && (
        <p
          style={{
            fontSize: 14.5,
            color: C.dark,
            marginBottom: 16,
            fontWeight: 700,
            lineHeight: 1.8,
          }}
        >
          {q.hint}
          {q.maxSelect && Array.isArray(answer) && answer.length > 0 && (
            <span style={{ color: C.primary, fontWeight: 700, marginRight: 6 }}>
              ({answer.length}/{q.maxSelect})
            </span>
          )}
        </p>
      )}

      {q.subHint && (
        <p
          style={{
            fontSize: 13.8,
            color: C.gray,
            marginTop: -8,
            marginBottom: 16,
            fontWeight: 500,
            lineHeight: 1.8,
          }}
        >
          {q.subHint}
        </p>
      )}

      {q.type === "contact" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {q.fields.map((field) => (
            <label key={field.id} style={{ display: "block" }}>
              <div
                style={{
                  fontSize: 13,
                  color: C.dark,
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                {field.label}
              </div>

              <input
                type={field.inputMode === "email" ? "email" : "text"}
                inputMode={field.inputMode}
                pattern={field.id === "q13" ? "[0-9]*" : undefined}
                maxLength={field.id === "q13" ? 20 : undefined}
                defaultValue={currentTextValue?.[field.id] || ""}
                onInput={(e) => {
                  let value = e.currentTarget.value;

                  if (field.id === "q13") {
                    value = value.replace(/\D/g, "");
                    e.currentTarget.value = value;
                  }

                  onTextDraft(field.id, value);
                }}
                onBlur={(e) => {
                  onTextDraft(field.id, e.currentTarget.value);
                  e.currentTarget.style.borderColor = C.mid;
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = C.primary;
                }}
                placeholder={field.placeholder}
                style={{
                  ...inputStyle,
                  background: C.white,
                }}
              />
            </label>
          ))}
        </div>
      ) : q.type === "select" ? (
        <select
          value={answer || ""}
          onChange={(e) => onAnswer(q.id, e.currentTarget.value)}
          style={{
            ...inputStyle,
            appearance: "auto",
            cursor: "pointer",
            background: C.white,
          }}
        >
          <option value="">{q.placeholder || "اختاري من القائمة"}</option>
          {q.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : q.type === "textarea" ? (
        <textarea
          key={q.id}
          defaultValue={currentTextValue || ""}
          onInput={handleTextInput}
          onBlur={(e) => {
            onTextDraft(q.id, e.currentTarget.value);
            e.currentTarget.style.borderColor = C.mid;
          }}
          placeholder={q.placeholder}
          rows={5}
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.8 }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = C.primary;
          }}
        />
      ) : q.type === "text" ? (
        <input
          key={q.id}
          type="text"
          {...textInputProps}
          defaultValue={currentTextValue || ""}
          onInput={handleTextInput}
          onBlur={(e) => {
            onTextDraft(q.id, e.currentTarget.value);
            e.currentTarget.style.borderColor = C.mid;
          }}
          placeholder={q.placeholder}
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = C.primary;
          }}
        />
      ) : (
        <div style={{ marginTop: 8 }}>
          {q.options.map((opt) => (
            <Option
              key={opt}
              label={opt}
              selected={
                q.type === "multi" || q.type === "multi_other"
                  ? Array.isArray(answer) && answer.includes(opt)
                  : answer === opt
              }
              onClick={() => toggle(opt)}
              shape={q.type === "single" ? "circle" : "square"}
            />
          ))}

          {q.type === "multi_other" &&
            q.otherOption &&
            Array.isArray(answer) &&
            answer.includes(q.otherOption) && (
              <input
                type="text"
                defaultValue={draftAnswers[q.otherKey] ?? allAnswers[q.otherKey] ?? ""}
                onInput={(e) => onTextDraft(q.otherKey, e.currentTarget.value)}
                onBlur={(e) => {
                  onTextDraft(q.otherKey, e.currentTarget.value);
                  e.currentTarget.style.borderColor = C.mid;
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = C.primary;
                }}
                placeholder={q.otherPlaceholder || "اكتب إجابتك..."}
                style={{
                  ...inputStyle,
                  background: C.white,
                  marginTop: 4,
                }}
              />
            )}
        </div>
      )}

      {q.id === "q1" && answer === "ذكر" && (
        <div
          style={{
            marginTop: 16,
            color: C.dark,
            lineHeight: 1.9,
            fontSize: 14.5,
            fontWeight: 600,
          }}
        >
          <p style={{ margin: "0 0 8px", fontWeight: 800 }}>ملاحظة:</p>
          {MALE_NOTICE.map((line, i) => (
            <p
              key={i}
              style={{
                margin: i === MALE_NOTICE.length - 1 ? 0 : "0 0 8px",
              }}
            >
              {line}
            </p>
          ))}
        </div>
      )}

      {shouldShowChildrenQuestion && childrenQuestion && (
        <div
          style={{
            marginTop: 22,
            paddingTop: 20,
            borderTop: `1.5px solid ${C.mid}`,
          }}
        >
          <p
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: C.text,
              lineHeight: 1.65,
              marginBottom: 14,
            }}
          >
            {childrenQuestion.text}
          </p>

          <div style={{ marginTop: 8 }}>
            {childrenQuestion.options.map((opt) => (
              <Option
                key={opt}
                label={opt}
                selected={allAnswers.q3c === opt}
                onClick={() => onAnswer("q3c", opt)}
                shape="circle"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// ADMIN PANEL
// ═══════════════════════════════════════════
function AdminPanel({ responses, onClose }) {
  const [activePath, setActivePath] = useState("female");

  const isFemaleMode = activePath === "female";
  const pathResponses = responses.filter((r) =>
    isFemaleMode ? r.q1 !== "ذكر" : r.q1 === "ذكر"
  );

  const total = pathResponses.length;

  const toItems = (value) => {
    if (Array.isArray(value)) return value;

    return String(value || "")
      .split("|")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const count = (qid, val) =>
    pathResponses.filter((r) => {
      const items = toItems(r[qid]);

      return items.some((item) => {
        if (item === val) return true;
        if (val === "غير ذلك" && String(item).startsWith("غير ذلك")) return true;
        return false;
      });
    }).length;

  const pct = (n) => (total > 0 ? Math.round((n / total) * 100) : 0);

  const Bar = ({ label, n }) => (
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 13,
          marginBottom: 3,
          color: C.text,
        }}
      >
        <span style={{ flex: 1, paddingLeft: 8 }}>{label}</span>
        <span style={{ fontWeight: 700, color: C.primary, flexShrink: 0 }}>
          {n} ({pct(n)}%)
        </span>
      </div>
      <div
        style={{
          height: 7,
          background: C.mid,
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct(n)}%`,
            background: `linear-gradient(90deg,${C.dark},${C.primary})`,
            borderRadius: 10,
          }}
        />
      </div>
    </div>
  );

  const femaleFieldIds = [
    "q1",
    "q1b",
    "q1c",
    "q2",
    "q3",
    "q3b",
    "q3c",
    "q4",
    "q5",
    "q6",
    "q7",
    "q8",
    "q8b",
    "q9",
    "q10",
    "q11",
    "q11b",
    "q12",
    "q13",
    "q14",
    "timestamp",
  ];

  const femaleHeaders = [
    "الجنس",
    "الجنسية",
    "الإمارة",
    "العمر",
    "الوضع الحالي",
    "الحالة الاجتماعية",
    "أبناء",
    "علاقة بالقراءة",
    "الموضوعات",
    "المحتوى العربي",
    "البرامج المطلوبة",
    "الاستشارات الأسرية",
    "الاستشارات الثقافية",
    "قابلية الدفع",
    "طريقة المشاركة",
    "الانضمام",
    "ملاحظات",
    "الاسم",
    "واتساب",
    "البريد",
    "الوقت",
  ];

  const maleFieldIds = [
    "q1",
    "q1b",
    "q1c",
    "q2",
    "q3",
    "q3b",
    "q4",
    "q5",
    "q6",
    "q7",
    "q8",
    "q8b",
    "q9",
    "q10",
    "q11",
    "q11b",
    "q12",
    "q13",
    "q14",
    "timestamp",
  ];

  const maleHeaders = [
    "الجنس",
    "الجنسية",
    "الإمارة",
    "العمر",
    "صلة بالموضوع",
    "الفئة المستفيدة",
    "علاقة بالقراءة والثقافة",
    "الموضوعات الأنفع",
    "المحتوى العربي",
    "البرامج النافعة",
    "الاستشارات الأسرية",
    "مناقشة الكتب والأفكار",
    "دعم البرامج",
    "طريقة المشاركة",
    "الدعم المجتمعي",
    "ملاحظات",
    "الاسم",
    "واتساب",
    "البريد",
    "الوقت",
  ];

  const exportCSV = () => {
    if (pathResponses.length === 0) return;

    const headers = isFemaleMode ? femaleHeaders : maleHeaders;
    const fieldIds = isFemaleMode ? femaleFieldIds : maleFieldIds;

    const rows = pathResponses.map((r) =>
      fieldIds.map((id) => {
        const v = r[id];
        return Array.isArray(v) ? v.join(" | ") : v || "";
      })
    );

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = isFemaleMode ? "dorra_survey_female.csv" : "dorra_survey_male.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const contacts = pathResponses.filter((r) => r.q12 || r.q13 || r.q14);

  const femaleStatGroups = [
    { qid: "q1", title: "الجنس", opts: QUESTIONS[0].options },
    { qid: "q1b", title: "الجنسية", opts: QUESTIONS[1].options },
    { qid: "q1c", title: "الإمارة", opts: QUESTIONS[2].options },
    { qid: "q2", title: "الفئة العمرية", opts: QUESTIONS[3].options },
    { qid: "q3", title: "الوضع الحالي", opts: QUESTIONS[4].options },
    { qid: "q3b", title: "الحالة الاجتماعية", opts: QUESTIONS[5].options },
    { qid: "q3c", title: "وجود أبناء", opts: QUESTIONS[6].options },
    { qid: "q4", title: "علاقة بالقراءة", opts: QUESTIONS[7].options },
    { qid: "q5", title: "الموضوعات المفضلة", opts: QUESTIONS[8].options },
    { qid: "q6", title: "المحتوى العربي", opts: QUESTIONS[9].options },
    {
      qid: "q7",
      title: "البرامج والمشاريع المطلوبة",
      opts: QUESTIONS[10].options,
    },
    { qid: "q8", title: "الاستشارات الأسرية", opts: QUESTIONS[11].options },
    {
      qid: "q8b",
      title: "الاستشارات الثقافية",
      opts: QUESTIONS[12].options,
    },
    { qid: "q9", title: "قابلية الدفع للبرامج", opts: QUESTIONS[13].options },
    { qid: "q10", title: "طريقة المشاركة", opts: QUESTIONS[14].options },
    { qid: "q11", title: "الانضمام لدُرَّة", opts: QUESTIONS[15].options },
  ];

  const maleStatGroups = [
    { qid: "q1", title: "الجنس", opts: QUESTIONS[0].options },
    { qid: "q1b", title: "الجنسية", opts: MALE_QUESTIONS[0].options },
    { qid: "q1c", title: "الإمارة", opts: MALE_QUESTIONS[1].options },
    { qid: "q2", title: "الفئة العمرية", opts: MALE_QUESTIONS[2].options },
    { qid: "q3", title: "صلة المشارِك بالموضوع", opts: MALE_QUESTIONS[3].options },
    { qid: "q3b", title: "الفئات الأكثر استفادة", opts: MALE_QUESTIONS[4].options },
    { qid: "q4", title: "علاقة الفتيات والنساء بالقراءة والثقافة", opts: MALE_QUESTIONS[5].options },
    { qid: "q5", title: "الموضوعات الأنفع", opts: MALE_QUESTIONS[6].options },
    { qid: "q6", title: "توفر المحتوى العربي", opts: MALE_QUESTIONS[7].options },
    { qid: "q7", title: "البرامج النافعة", opts: MALE_QUESTIONS[8].options },
    { qid: "q8", title: "الحاجة إلى الاستشارات", opts: MALE_QUESTIONS[9].options },
    { qid: "q8b", title: "مناقشة الكتب والأفكار", opts: MALE_QUESTIONS[10].options },
    { qid: "q9", title: "المساهمة المالية أو دعم البرامج", opts: MALE_QUESTIONS[11].options },
    { qid: "q10", title: "طريقة المشاركة الأنسب", opts: MALE_QUESTIONS[12].options },
    { qid: "q11", title: "الدعم المجتمعي لدُرَّة", opts: MALE_QUESTIONS[13].options },
  ];

  const statGroups = isFemaleMode ? femaleStatGroups : maleStatGroups;

  const TabButton = ({ mode, children }) => {
    const active = activePath === mode;

    return (
      <button
        type="button"
        onClick={() => setActivePath(mode)}
        style={{
          flex: 1,
          minWidth: 130,
          padding: "11px 18px",
          borderRadius: 14,
          border: `1.5px solid ${active ? C.primary : C.mid}`,
          background: active
            ? `linear-gradient(135deg, ${C.dark}, ${C.primary})`
            : C.white,
          color: active ? "white" : C.dark,
          cursor: "pointer",
          fontFamily: "Tajawal, Arial, sans-serif",
          fontWeight: 800,
          fontSize: 14,
          boxShadow: active ? "0 4px 14px rgba(139,74,74,0.2)" : "none",
        }}
      >
        {children}
      </button>
    );
  };

  return (
    <div
      style={{
        fontFamily: "Tajawal, Arial, sans-serif",
        direction: "rtl",
        padding: "24px 20px 60px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 18,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ fontSize: 22, color: C.dark, fontWeight: 800 }}>
            لوحة النتائج — دُرَّة
          </h2>
          <p style={{ fontSize: 14, color: C.gray }}>
            {total} استجابة في {isFemaleMode ? "مسار الأنثى" : "مسار الذكر"}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={exportCSV}
            style={{
              background: `linear-gradient(135deg,${C.dark},${C.primary})`,
              color: "white",
              border: "none",
              borderRadius: 20,
              padding: "9px 20px",
              cursor: "pointer",
              fontFamily: "Tajawal, Arial, sans-serif",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            ⬇️ تصدير CSV
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: C.soft,
              border: `1px solid ${C.mid}`,
              borderRadius: 20,
              padding: "9px 20px",
              cursor: "pointer",
              color: C.dark,
              fontFamily: "Tajawal, Arial, sans-serif",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            ← العودة
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <TabButton mode="female">مسار الأنثى</TabButton>
        <TabButton mode="male">مسار الذكر</TabButton>
      </div>

      {total === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: C.gray }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <p style={{ fontSize: 15 }}>
            لا توجد استجابات في {isFemaleMode ? "مسار الأنثى" : "مسار الذكر"} بعد
          </p>
        </div>
      ) : (
        <>
          {statGroups.map(({ qid, title, opts }) => {
            const visibleOpts =
              qid === "q1b" ? opts.filter((opt) => count(qid, opt) > 0) : opts;

            if (visibleOpts.length === 0) return null;

            return (
              <div
                key={qid}
                style={{
                  background: C.white,
                  borderRadius: 16,
                  padding: "20px 24px",
                  marginBottom: 14,
                  border: "1px solid #F0E0E0",
                  boxShadow: "0 2px 12px rgba(193,126,126,0.07)",
                }}
              >
                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: C.dark,
                    marginBottom: 16,
                  }}
                >
                  {title}
                </h3>

                {visibleOpts.map((opt) => (
                  <Bar key={opt} label={opt} n={count(qid, opt)} />
                ))}
              </div>
            );
          })}

          {contacts.length > 0 && (
            <div
              style={{
                background: C.light,
                borderRadius: 16,
                padding: "20px 24px",
                border: `1px solid ${C.mid}`,
                marginTop: 8,
              }}
            >
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: C.dark,
                  marginBottom: 16,
                }}
              >
                📋 جهات التواصل ({contacts.length})
              </h3>

              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 13,
                  }}
                >
                  <thead>
                    <tr style={{ background: C.mid }}>
                      {["الاسم", "واتساب", "البريد الإلكتروني", "الإمارة", "العمر"].map(
                        (h) => (
                          <th
                            key={h}
                            style={{
                              padding: "8px 12px",
                              textAlign: "right",
                              color: C.dark,
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {contacts.map((r, i) => (
                      <tr
                        key={i}
                        style={{ background: i % 2 === 0 ? C.white : C.soft }}
                      >
                        <td style={{ padding: "8px 12px", color: C.text }}>
                          {r.q12 || "—"}
                        </td>
                        <td style={{ padding: "8px 12px", color: C.text }}>
                          {r.q13 || "—"}
                        </td>
                        <td style={{ padding: "8px 12px", color: C.text }}>
                          {r.q14 || "—"}
                        </td>
                        <td style={{ padding: "8px 12px", color: C.text }}>
                          {r.q1c || "—"}
                        </td>
                        <td style={{ padding: "8px 12px", color: C.text }}>
                          {r.q2 || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {pathResponses.filter((r) => r.q11b).length > 0 && (
            <div
              style={{
                background: C.white,
                borderRadius: 16,
                padding: "20px 24px",
                border: "1px solid #F0E0E0",
                marginTop: 14,
                boxShadow: "0 2px 12px rgba(193,126,126,0.07)",
              }}
            >
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: C.dark,
                  marginBottom: 16,
                }}
              >
                💬 ملاحظات واقتراحات (
                {pathResponses.filter((r) => r.q11b).length})
              </h3>

              {pathResponses
                .filter((r) => r.q11b)
                .map((r, i) => (
                  <div
                    key={i}
                    style={{
                      background: C.soft,
                      borderRadius: 10,
                      padding: "12px 16px",
                      marginBottom: 10,
                      fontSize: 14,
                      color: C.text,
                      lineHeight: 1.7,
                      borderRight: `3px solid ${C.primary}`,
                    }}
                  >
                    <div
                      style={{ fontSize: 12, color: C.gray, marginBottom: 4 }}
                    >
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
  const [step, setStep] = useState("intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [responses, setResponses] = useState([]);
  const [error, setError] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [showAdmin, setShowAdmin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  // هذا أهم جزء لحل مشكلة الكتابة:
  // نخزن كل الإجابات في ref حتى لا تعيد خانة الكتابة رسم نفسها مع كل حرف.
  const answersRef = useRef({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dorra_v3_responses");
      if (saved) setResponses(JSON.parse(saved));
    } catch {}
  }, []);

  const selectedGender = answersRef.current.q1 ?? answers.q1;
  const isMalePath = selectedGender === "ذكر";
  const femaleQuestions = QUESTIONS.filter((item) => !item.hidden);
  const activeQuestions = isMalePath ? [QUESTIONS[0], ...MALE_QUESTIONS] : femaleQuestions;
  const q = activeQuestions[current] || activeQuestions[0];
  const total = activeQuestions.length;

  const handleAnswer = (qid, val) => {
    const previousGender = answersRef.current.q1 ?? answers.q1;

    if (qid === "q1" && previousGender && previousGender !== val) {
      answersRef.current = { q1: val };
      setAnswers({ q1: val });
      setCurrent(0);
      setError("");
      return;
    }

    answersRef.current[qid] = val;

    if (qid === "q3b" && !isMalePath && val === "عزباء") {
      answersRef.current.q3c = "";
      setAnswers((prev) => ({ ...prev, [qid]: val, q3c: "" }));
      setError("");
      return;
    }

    setAnswers((prev) => ({ ...prev, [qid]: val }));
    setError("");
  };

  const handleTextDraft = (qid, val) => {
    answersRef.current[qid] = val;
  };

  const isEmptyAnswer = (val) => {
    if (Array.isArray(val)) return val.length === 0;
    return val === undefined || val === null || String(val).trim() === "";
  };

  const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
  };

  const validateCurrentAnswer = () => {
    const ans = answersRef.current[q.id] ?? answers[q.id];

    if (q.required && isEmptyAnswer(ans)) {
      return "يرجى الإجابة قبل المتابعة 🌸";
    }

    if (
      q.id === "q3b" &&
      !isMalePath &&
      ["متزوجة", "مطلقة", "أرملة"].includes(ans) &&
      isEmptyAnswer(answersRef.current.q3c ?? answers.q3c)
    ) {
      return "يرجى الإجابة عن سؤال الأبناء 🌸";
    }

    if (
      q.type === "multi_other" &&
      Array.isArray(ans) &&
      ans.includes(q.otherOption) &&
      isEmptyAnswer(answersRef.current[q.otherKey] ?? answers[q.otherKey])
    ) {
      return "يرجى كتابة الإجابة في خانة غير ذلك 🌸";
    }

    if (q.type === "contact") {
      const phone = answersRef.current.q13 ?? answers.q13;
      const email = answersRef.current.q14 ?? answers.q14;

      if (!isEmptyAnswer(phone)) {
        const phoneText = String(phone).trim();

        if (!/^\d+$/.test(phoneText)) {
          return "رقم الواتساب يجب أن يحتوي على أرقام فقط";
        }

        if (phoneText.length < 7) {
          return "رقم الواتساب يجب ألا يقل عن 7 أرقام";
        }
      }

      if (!isEmptyAnswer(email) && !isValidEmail(email)) {
        return "يرجى كتابة البريد الإلكتروني بصيغة صحيحة";
      }
    }

    if (q.id === "q13" && !isEmptyAnswer(ans)) {
      const phone = String(ans).trim();

      if (!/^\d+$/.test(phone)) {
        return "رقم الواتساب يجب أن يحتوي على أرقام فقط";
      }

      if (phone.length < 7) {
        return "رقم الواتساب يجب ألا يقل عن 7 أرقام";
      }
    }

    if (q.id === "q14" && !isEmptyAnswer(ans)) {
      if (!isValidEmail(ans)) {
        return "يرجى كتابة البريد الإلكتروني بصيغة صحيحة";
      }
    }

    return "";
  };

  const next = () => {
    const validationMessage = validateCurrentAnswer();

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setError("");

    if (current < total - 1) {
      setCurrent((c) => c + 1);
    } else {
      submit();
    }
  };

  const prev = () => {
    if (current > 0) {
      setCurrent((c) => c - 1);
      setError("");
    }
  };

  const restartSurvey = () => {
    answersRef.current = {};
    setAnswers({});
    setCurrent(0);
    setError("");
    setShowAdmin(false);
    setAdminPass("");
    setStep("intro");
  };

  const submit = async () => {
    setSubmitting(true);

    const entry = {
      ...answers,
      ...answersRef.current,
      timestamp: new Date().toISOString(),
    };

    if (entry.q1 === "ذكر" && Array.isArray(entry.q3) && entry.q3.includes("غير ذلك")) {
      const otherText = String(entry.q3_other || "").trim();
      entry.q3 = entry.q3.map((item) =>
        item === "غير ذلك" && otherText ? `غير ذلك: ${otherText}` : item
      );
    }

    const updated = [...responses, entry];

    setResponses(updated);

    try {
      localStorage.setItem("dorra_v3_responses", JSON.stringify(updated));
    } catch {}

    await sendToSheets(entry);

    setSubmitting(false);
    setStep("done");
  };

  const openAdmin = async () => {
    if (adminPass !== "mecc@1446") {
      setError("كلمة المرور غير صحيحة");
      return;
    }

    setAdminLoading(true);
    setError("");

    try {
      const remoteResponses = await fetchResponsesFromSheets();
      setResponses(remoteResponses);

      try {
        localStorage.setItem("dorra_v3_responses", JSON.stringify(remoteResponses));
      } catch {}

      setStep("admin");
      setShowAdmin(false);
      setError("");
    } catch (err) {
      console.log("Admin results loading failed:", err);

      // في حال تعذر التحميل من الشيت، ندخل اللوحة بالنسخة المحلية فقط
      // لكن نخبرك أن النتائج قد لا تكون كاملة.
      setStep("admin");
      setShowAdmin(false);
      setError("");
    } finally {
      setAdminLoading(false);
    }
  };

  // INTRO
  if (step === "intro") {
    return (
      <Layout>
        <div style={{ textAlign: "center", marginBottom: 28, paddingTop: 8 }}>
          <div style={{ fontSize: 36, marginBottom: 12, lineHeight: 1 }}>
            ◇ ◆ ◇
          </div>

          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: C.dark,
              marginBottom: 14,
              lineHeight: 1.4,
            }}
          >
            أخبرينا عنكِ
          </h1>

          <div
            style={{
              fontSize: 16.2,
              color: C.text,
              lineHeight: 2.05,
              maxWidth: 430,
              margin: "0 auto",
              textAlign: "right",
              fontWeight: 500,
            }}
          >
            <p style={{ margin: "0 0 13px" }}>
              دُرَّة مساحة ثقافية تربوية ناشئة في دولة الإمارات العربية المتحدة،
              وُلدت من الإيمان بأن الفتاة حين تجد من يسمعها، ويثري فكرها،
              ويقوّي صلتها بالمعرفة والقيم والجمال، تصبح أقدر على صناعة أثرها
              في نفسها وأسرتها ومجتمعها.
            </p>

            <p style={{ margin: "0 0 13px" }}>
              نطمح في دُرَّة إلى بناء مجتمع نسائي واعٍ، يفتح للفتاة والمرأة
              والأم أبواب المعرفة، والاستشارة، والبرامج الثقافية التي تلامس
              واقعها واحتياجها.
            </p>

            <p style={{ margin: "0 0 13px" }}>
              قبل أن ننطلق، نود أن نسمعكِ أنتِ: ما الذي تحتاجينه؟ ما الذي
              يشدّكِ؟ وما نوع البرامج التي تتمنين وجودها لكِ أو لابنتكِ أو لمن
              حولكِ؟
            </p>

            <p style={{ margin: 0, color: C.dark, fontWeight: 800 }}>
              إجابتكِ في هذا الاستبيان القصير ليست مجرد رأي، بل لبنة تساعدنا
              على تشكيل دُرَّة بما يليق بالمرأة في الإمارات، وبما يصنع أثراً
              أعمق بإذن الله.
            </p>

            <p
              style={{
                margin: "12px 0 0",
                color: C.dark,
                opacity: 0.78,
                fontSize: 14.5,
                fontWeight: 400,
                lineHeight: 1.8,
              }}
            >
              *وإن كنتَ ذكرًا فتسعدنا مشاركتك في السؤال التالي
            </p>
          </div>
        </div>

        <div
          style={{
            background: C.white,
            borderRadius: 16,
            padding: "18px 20px",
            border: `1.5px solid ${C.mid}`,
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 14,
            boxShadow: "0 2px 16px rgba(193,126,126,0.1)",
          }}
        >
          <span style={{ fontSize: 30, flexShrink: 0 }}>⏱️</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>
              4 دقائق فقط
            </div>
            <div style={{ fontSize: 13, color: C.gray, marginTop: 2 }}>
              {total} سؤالاً — وكل إجابة تُشكّل معنا دُرَّة
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setError("");
            setShowAdmin(false);
            setStep("survey");
          }}
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: 14,
            background: `linear-gradient(135deg, ${C.dark}, ${C.primary})`,
            color: "white",
            fontSize: 17,
            fontWeight: 800,
            border: "none",
            cursor: "pointer",
            fontFamily: "Tajawal, Arial, sans-serif",
            boxShadow: "0 6px 24px rgba(139,74,74,0.35)",
          }}
        >
          ابدأ الاستبيان 🌸
        </button>

        <div style={{ textAlign: "center", marginTop: 36 }}>
          <button
            type="button"
            onClick={() => setShowAdmin((v) => !v)}
            style={{
              background: "none",
              border: "none",
              color: C.mid,
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "Tajawal, Arial, sans-serif",
            }}
          >
            ⚙️ لوحة النتائج
          </button>

          {showAdmin && (
            <div
              style={{
                marginTop: 12,
                display: "flex",
                gap: 8,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <input
                type="password"
                placeholder="كلمة المرور"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && openAdmin()}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                        fontFamily: "Tajawal, Arial, sans-serif",
                  fontSize: 14,
                  direction: "ltr",
                  outline: "none",
                  width: 150,
                }}
              />

              <button
                type="button"
                onClick={openAdmin}
                disabled={adminLoading}
                style={{
                  background: C.primary,
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 16px",
                  cursor: "pointer",
                  fontFamily: "Tajawal, Arial, sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {adminLoading ? "جاري التحميل..." : "دخول"}
              </button>
            </div>
          )}

          {showAdmin && error && (
            <div
              style={{
                color: adminLoading ? C.dark : "tomato",
                fontSize: 12,
                marginTop: 6,
                fontWeight: adminLoading ? 700 : 400,
              }}
            >
              {error}
            </div>
          )}
        </div>
      </Layout>
    );
  }

  // SURVEY
  if (step === "survey") {
    return (
      <Layout>
        <QuestionCard
          q={q}
          answer={answers[q.id]}
          allAnswers={answers}
          draftAnswers={answersRef.current}
          currentTextValue={
            q.type === "contact"
              ? {
                  q12: answersRef.current.q12 ?? answers.q12,
                  q13: answersRef.current.q13 ?? answers.q13,
                  q14: answersRef.current.q14 ?? answers.q14,
                }
              : answersRef.current[q.id] ?? answers[q.id]
          }
          onAnswer={handleAnswer}
          onTextDraft={handleTextDraft}
          qIndex={current}
          total={total}
        />

        {error && (
          <div
            style={{
              marginTop: 12,
              padding: "10px 16px",
              borderRadius: 10,
              background: "#FFF0F0",
              color: "#C0392B",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          {current >= 0 && (
            <button
              type="button"
              onClick={current === 0 ? () => {
                setError("");
                setStep("intro");
              } : prev}
              style={{
                flex: 1,
                padding: "13px",
                borderRadius: 12,
                border: `2px solid ${C.mid}`,
                background: C.white,
                color: C.dark,
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "Tajawal, Arial, sans-serif",
              }}
            >
              → السابق
            </button>
          )}

          <button
            type="button"
            onClick={next}
            disabled={submitting}
            style={{
              flex: 2,
              padding: "13px",
              borderRadius: 12,
              background: submitting
                ? C.mid
                : `linear-gradient(135deg, ${C.dark}, ${C.primary})`,
              color: "white",
              fontSize: 16,
              fontWeight: 800,
              border: "none",
              cursor: submitting ? "default" : "pointer",
              fontFamily: "Tajawal, Arial, sans-serif",
              boxShadow: submitting
                ? "none"
                : "0 4px 16px rgba(139,74,74,0.3)",
              transition: "all 0.2s",
            }}
          >
            {submitting
              ? "جاري الإرسال..."
              : current < total - 1
              ? "التالي ←"
              : "إرسال الاستبيان 🌸"}
          </button>
        </div>
      </Layout>
    );
  }

  // DONE
  if (step === "done") {
    return (
      <Layout>
        <div style={{ textAlign: "center", padding: "40px 0 20px" }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: `linear-gradient(135deg,${C.dark},${C.primary})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              fontSize: 36,
              boxShadow: "0 8px 32px rgba(139,74,74,0.35)",
            }}
          >
            🌸
          </div>

          <h2
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: C.dark,
              marginBottom: 14,
            }}
          >
            شكراً من القلب 🤍
          </h2>

          <p
            style={{
              fontSize: 15.5,
              color: C.gray,
              lineHeight: 2,
              maxWidth: 360,
              margin: "0 auto 32px",
            }}
          >
            {isMalePath ? (
              <>
                كل إجابة شاركتَ بها أضافت لنا زاوية مهمة في فهم احتياج الفتاة
                والمرأة في مجتمعنا.
                <br />
                دُرَّة تبدأ بسماع الأصوات القريبة من الواقع؛ صوت المرأة، وصوت
                من يساندها، ويؤمن بأثرها، ويرى حاجتها إلى مساحات ثقافية وتربوية
                تليق بها.
              </>
            ) : (
              <>
                كل إجابة وضعتِها ستُضيء لنا طريقاً.
                <br />
                دُرَّة قادمة — وأنتِ جزء من بدايتها.
              </>
            )}
          </p>

          <div
            style={{
                borderRadius: 16,
              padding: "20px 24px",
              border: `1.5px solid ${C.mid}`,
              maxWidth: 360,
              margin: "0 auto",
            }}
          >
            <div style={{ fontSize: 14, color: C.dark, fontWeight: 700 }}>
              {isMalePath ? "نسعد بقربك من دُرَّة 🌿" : "تابعينا قريباً على منصاتنا 🌿"}
            </div>
            <div
              style={{
                fontSize: 13,
                color: C.gray,
                marginTop: 6,
                lineHeight: 1.7,
              }}
            >
              {isMalePath
                ? "سيتم التواصل معك عند الانطلاق إن تركت بياناتك."
                : "سيتم التواصل معكِ عند الانطلاق إن تركتِ بياناتكِ"}
            </div>
          </div>

          <button
            type="button"
            onClick={restartSurvey}
            style={{
              marginTop: 32,
              background: "none",
              border: "none",
              color: C.dark,
              opacity: 0.72,
              fontSize: 15,
              fontWeight: 400,
              cursor: "pointer",
              fontFamily: "Tajawal, Arial, sans-serif",
            }}
          >
            إرسال رد آخر
          </button>
        </div>
      </Layout>
    );
  }

  // ADMIN
  if (step === "admin") {
    return (
      <Layout noPad>
        <AdminPanel responses={responses} onClose={() => setStep("intro")} />
      </Layout>
    );
  }

  return null;
}
