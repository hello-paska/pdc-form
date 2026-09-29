/*
 * ─────────────────────────────────────────────────────────────
 *  BRAND INTAKE FORM — CONTENT
 *  Edit everything the client reads here. No HTML needed.
 *
 *  The page opens with `start`: "Do you already have a brand?"
 *    Yes → asks about brand guidelines (upload, or no), then shows `thanksPopup`.
 *    No  → shows `intro` and the full list of `sections` below.
 *
 *  Section types:
 *    "text"      – single-line answer
 *    "textarea"  – multi-line answer
 *    "chips"     – pick words from a list (+ optional custom word)
 *    "sliders"   – dials between two opposites (1–10)
 *    "grid"      – several labelled fields side by side
 *                  (each field: kind "input" or "textarea")
 *    "brands"    – lists of brand links, each with a note on what
 *                  the client likes or dislikes about it
 *
 *  Every answer is saved under its `id`, so keep ids unique and
 *  avoid renaming them once clients have started answering.
 *
 *  In titles, wrap a word in *asterisks* to make it the orange
 *  italic accent, e.g. "What should people *feel* when they see it?"
 * ─────────────────────────────────────────────────────────────
 */

window.FORM_CONTENT = {
  start: {
    label: "Brand intake",
    title: "Do you already have a *brand*?",
    description:
      "If you already have a brand identity, we'll apply your existing visual style to your pitch deck.",
    yes: "Yes, I have a brand",
    no: "No, not yet",

    guidelines: {
      title: "Do you have brand guidelines?",
      hint: "A PDF or file that shows your logo, colours, fonts and how to use them.",
      yes: "Yes",
      no: "No",
      uploadLabel: "Upload your brand guidelines",
      uploadHint: "PDF, images, ZIP, Figma, Keynote or PowerPoint. Up to 50 MB.",
      accept: ".pdf,.png,.jpg,.jpeg,.svg,.zip,.fig,.ai,.key,.ppt,.pptx",
      sendButton: "Send guidelines",
    },
  },

  thanksPopup: {
    title: "Thanks a lot!",
    text: "We'll get back to you with three design proposals based on your existing visual style.",
    button: "Done",
  },

  intro: {
    number: "",
    label: "Brand intake",
    titleLine1: "The brand",
    titleLine2: "formula",
    description:
      "Seven quick questions. They tell us how your pitch deck should look and feel before we design a single slide. There are no wrong answers, only honest ones.",
    bullets: ["Seven questions", "About four minutes", "No account needed"],
  },

  sections: [
    {
      number: "1.0",
      label: "What you do",
      title: "In one line, what do you do?",
      hint: "Use plain language, the way you would explain it to a friend. This grounds everything that follows.",
      type: "text",
      id: "what_you_do",
      placeholder: "e.g. We help solar installers get paid faster.",
    },

    {
      number: "2.0",
      label: "Emotion",
      title: "What should investors *feel* when they see it?",
      hint: "Pick up to three. If a word is missing, add your own.",
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
      number: "3.0",
      label: "Anti-brand",
      title: "What should it *never* feel like?",
      hint: "This is often more telling than the list above. What should we steer well clear of?",
      type: "text",
      id: "anti_brand",
      placeholder: "e.g. Corporate, cold, another boring fintech.",
    },

    {
      number: "4.0",
      label: "Personality",
      title: "Place the brand on each dial.",
      hint: "Drag each dial toward the side that fits better. Leave it in the middle only if it's genuinely balanced.",
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
      number: "5.0",
      label: "Colour & type",
      title: "Colours and fonts you love, *or hate.*",
      hint: "Share your instincts, not final choices. We make the design decisions, but your gut steers them.",
      type: "grid",
      fields: [
        { id: "colours_love", label: "Colours you love", kind: "input", placeholder: "e.g. Deep green, warm cream" },
        { id: "colours_avoid", label: "Colours to avoid", kind: "input", placeholder: "e.g. Bright red, pastels" },
        { id: "fonts_like", label: "Fonts or lettering you like", kind: "input", placeholder: "Paste a name or a link" },
        { id: "type_avoid", label: "Font styles to avoid", kind: "input", placeholder: "e.g. Anything too playful" },
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
      number: "6.0",
      label: "Inspiration",
      title: "Any inspiration?",
      hint: "Share links to brands or decks and tell us exactly what you like or dislike about each one. The more specific, the better.",
      type: "brands",
      lists: [
        {
          id: "brands_admire",
          label: "Brands you admire",
          linkPlaceholder: "Link to the brand, e.g. stripe.com",
          notesPlaceholder: "What do you like or dislike? e.g. I like the blue, but not the font.",
          addButton: "Add another brand",
        },
        {
          id: "brands_avoid",
          label: "Brands you don't want to look like",
          linkPlaceholder: "Link to the brand",
          notesPlaceholder: "What exactly don't you like? e.g. Too corporate, the colours feel cold.",
          addButton: "Add another brand",
        },
      ],
    },

    {
      number: "7.0",
      label: "Constraints",
      title: "Is there anything from your existing brand you need to keep?",
      hint: "For example a colour, font, logo or visuals.",
      type: "textarea",
      id: "must_keep",
      placeholder: "e.g. We need to keep our logo and the dark green colour.",
    },
  ],

  submit: {
    button: "Send the brief",
    clear: "Clear",
    thanksTitle: "Brief received.",
    thanksText: "Thank you. We'll read every answer carefully and get back to you shortly.",
  },

  footer: {
    tagline: "We are not just entrepreneurs, we are designers at heart.",
    copyright: "©2026. Pitch Deck Creators",
    location: "Based in Switzerland",
  },
};
