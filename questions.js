/*
 * ─────────────────────────────────────────────────────────────
 *  BRAND INTAKE FORM — CONTENT
 *  Edit everything the client reads here. No HTML needed.
 *
 *  Section types:
 *    "text"      – single-line answer
 *    "chips"     – pick words from a list (+ optional custom word)
 *    "sliders"   – dials between two opposites (1–10)
 *    "grid"      – several labelled fields side by side
 *                  (each field: kind "input" or "textarea")
 *    "mixed"     – a list of fields stacked vertically
 *                  (field kinds: "input", "textarea", "multi")
 *
 *  Every answer is saved under its `id`, so keep ids unique and
 *  avoid renaming them once clients have started answering.
 *
 *  In titles, wrap a word in *asterisks* to make it the orange
 *  italic accent, e.g. "What should people *feel* when they see it?"
 * ─────────────────────────────────────────────────────────────
 */

window.FORM_CONTENT = {
  intro: {
    number: "1.0",
    label: "Brand intake",
    titleLine1: "The brand",
    titleLine2: "formula",
    description:
      "Eight quick questions. They tell us how your brand should feel before we design a single pixel. There are no wrong answers, only honest ones.",
    bullets: ["Eight questions", "About four minutes", "No account needed"],
  },

  sections: [
    {
      number: "1.0",
      label: "What you do",
      title: "In one line, what do you do?",
      hint: "Plain language, the way you would tell a friend. This grounds everything below.",
      type: "text",
      id: "what_you_do",
      placeholder: "e.g. We help solar installers get paid faster.",
    },

    {
      number: "2.0",
      label: "Audience",
      title: "Who is this brand for?",
      hint: "The one person who should feel it was made for them. A brand only means something relative to who is looking.",
      type: "text",
      id: "audience",
      placeholder: "e.g. Ops managers at mid-size construction firms.",
    },

    {
      number: "3.0",
      label: "Emotion",
      title: "What should people *feel* when they see it?",
      hint: "Pick up to three. Add your own if a word is missing.",
      type: "chips",
      id: "emotions",
      max: 3,
      allowCustom: true,
      customPlaceholder: "Add your own word, then press Enter",
      options: [
        "Trustworthy", "Bold", "Premium", "Approachable", "Playful",
        "Innovative", "Calm", "Confident", "Warm", "Sharp",
        "Human", "Elegant", "Rebellious", "Reliable", "Energetic",
        "Understated",
      ],
    },

    {
      number: "4.0",
      label: "Anti-brand",
      title: "What should it *never* feel like?",
      hint: "Often sharper than the yes list. What are we steering hard away from?",
      type: "text",
      id: "anti_brand",
      placeholder: "e.g. Corporate, cold, another boring fintech.",
    },

    {
      number: "5.0",
      label: "Personality",
      title: "Place the brand on each dial.",
      hint: "Drag toward the side that feels more true. The middle is fine if it is genuinely balanced.",
      type: "sliders",
      id: "personality",
      min: 1,
      max: 10,
      default: 5,
      dials: [
        { id: "serious_playful", left: "Serious", right: "Playful" },
        { id: "classic_modern", left: "Classic", right: "Modern" },
        { id: "premium_accessible", left: "Premium", right: "Accessible" },
        { id: "understated_loud", left: "Understated", right: "Bold & loud" },
        { id: "corporate_human", left: "Corporate", right: "Human & warm" },
        { id: "minimal_expressive", left: "Minimal", right: "Expressive" },
      ],
    },

    {
      number: "6.0",
      label: "Colour & type",
      title: "Colours and type you are drawn to, *or hate.*",
      hint: "Share instincts, not final picks. We keep the design call, your gut steers it. Not sure? Leave it blank.",
      type: "grid",
      fields: [
        { id: "colours_love", label: "Colours you love", kind: "input", placeholder: "e.g. Deep green, warm cream" },
        { id: "colours_avoid", label: "Colours to avoid", kind: "input", placeholder: "e.g. Bright red, pastels" },
        { id: "fonts_like", label: "Fonts or lettering you like", kind: "input", placeholder: "Paste a name or a link" },
        { id: "type_avoid", label: "Type styles to avoid", kind: "input", placeholder: "e.g. Anything too playful" },
      ],
      footnote: {
        text: "Need a starting point?",
        links: [
          { label: "Browse the font library", href: "https://fonts.google.com/" },
          { label: "Browse colour palettes", href: "https://coolors.co/palettes/trending" },
        ],
      },
    },

    {
      number: "7.0",
      label: "Inspiration",
      title: "Any inspiration?",
      hint: "Two lists. Brands you admire, and brands in your space you do not want to look like.",
      type: "grid",
      fields: [
        { id: "admire", label: "Admire (any industry)", kind: "textarea", placeholder: "Names, links, screenshots you will send us" },
        { id: "not_resemble", label: "Do not want to resemble", kind: "textarea", placeholder: "Competitors or looks that feel wrong" },
      ],
    },

    {
      number: "8.0",
      label: "Constraints",
      title: "Anything locked, and where does it live most?",
      hint: "Must-keeps (an existing logo, a name, a colour you cannot change) and where the brand shows up first.",
      type: "mixed",
      fields: [
        { id: "must_keep", label: "Must-keep constraints", kind: "input", placeholder: "e.g. Keep the logo mark, company name is fixed" },
        {
          id: "lives_on",
          label: "Lives mostly on",
          kind: "multi",
          options: ["Pitch deck", "Website", "Social", "Product UI", "Print", "Email"],
        },
      ],
    },
  ],

  submit: {
    button: "Send the brief",
    clear: "Clear",
    thanksTitle: "Brief received.",
    thanksText: "Thank you. We will read every word and come back to you shortly.",
  },

  footer: {
    tagline: "We are not just entrepreneurs, we are designers at heart.",
    copyright: "©2026. Pitch Deck Creators",
    location: "Based in Switzerland",
  },
};
