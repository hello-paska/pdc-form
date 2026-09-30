/*
 * Renders the form from questions.js and collects answers.
 * You normally don't need to edit this file — change questions.js instead.
 */
(function () {
  const C = window.FORM_CONTENT;
  const root = document.getElementById("form-root");
  const form = document.getElementById("brand-form");

  // ── helpers ────────────────────────────────────────────────
  const el = (tag, attrs = {}, children = []) => {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") node.className = v;
      else if (k === "text") node.textContent = v;
      else if (k === "html") node.innerHTML = v;
      else node.setAttribute(k, v);
    }
    [].concat(children).forEach((c) => c && node.append(c));
    return node;
  };

  const escapeHtml = (s) =>
    s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // "*word*" → <em>word</em>
  const accent = (s) => escapeHtml(s).replace(/\*(.+?)\*/g, "<em>$1</em>");

  const meta = (number, label) =>
    el("div", { class: "meta" }, [el("span", { text: number }), el("span", { text: label })]);

  const fieldControl = (f) =>
    f.kind === "textarea"
      ? el("textarea", { class: "textarea", name: f.id, id: f.id, placeholder: f.placeholder || "" })
      : el("input", { class: "input", type: "text", name: f.id, id: f.id, placeholder: f.placeholder || "", autocomplete: "off" });

  const labelled = (f, control) =>
    el("div", {}, [el("label", { class: "field-label", for: f.id, text: f.label }), control]);

  // ── state for non-native inputs ────────────────────────────
  const selections = {}; // chips: id -> Set
  const brandLists = {}; // brand lists: id -> rows container

  // ── section renderers ──────────────────────────────────────
  const renderers = {
    text(s) {
      return fieldControl({ id: s.id, placeholder: s.placeholder });
    },

    chips(s) {
      const chosen = (selections[s.id] = new Set());
      const wrap = el("div");
      const list = el("div", { class: "chips", role: "group", "aria-label": s.label });
      const counter = el("div", { class: "counter" });

      const refresh = () => {
        const full = s.max && chosen.size >= s.max;
        list.querySelectorAll(".chip").forEach((c) => {
          const on = chosen.has(c.dataset.value);
          c.setAttribute("aria-pressed", on);
          c.disabled = !on && full;
        });
        counter.innerHTML = `<strong>${chosen.size}/${s.max}</strong> selected`;
      };

      const addChip = (value) => {
        const chip = el("button", { type: "button", class: "chip", "data-value": value, text: value });
        chip.addEventListener("click", () => {
          chosen.has(value) ? chosen.delete(value) : chosen.add(value);
          refresh();
        });
        list.append(chip);
        return chip;
      };

      s.options.forEach(addChip);
      wrap.append(list);

      if (s.allowCustom) {
        const custom = el("input", {
          class: "input",
          type: "text",
          placeholder: s.customPlaceholder || "Add your own word, then press Enter",
          "aria-label": "Add your own word",
        });
        custom.addEventListener("keydown", (e) => {
          if (e.key !== "Enter") return;
          e.preventDefault();
          const value = custom.value.trim();
          if (!value) return;
          const existing = [...list.children].find((c) => c.dataset.value.toLowerCase() === value.toLowerCase());
          const target = existing ? existing.dataset.value : (addChip(value), value);
          if (!s.max || chosen.size < s.max) chosen.add(target);
          custom.value = "";
          refresh();
        });
        wrap.append(custom);
      }

      wrap.append(counter);
      wrap._reset = () => {
        chosen.clear();
        list.querySelectorAll(".chip").forEach((c, i) => i >= s.options.length && c.remove());
        refresh();
      };
      refresh();
      return wrap;
    },

    sliders(s) {
      const wrap = el("div");
      const range = s.max - s.min;
      const mid = s.default;

      s.dials.forEach((d) => {
        const input = el("input", {
          class: "range",
          type: "range",
          name: `${s.id}.${d.id}`,
          min: s.min,
          max: s.max,
          step: 1,
          value: s.default,
          "aria-label": `${d.left} to ${d.right}`,
        });
        const value = el("span", { class: "dial-value" });
        const update = () => {
          const v = Number(input.value);
          input.style.setProperty("--pct", `${((v - s.min) / range) * 100}%`);
          value.textContent = v === mid ? `${v} · even` : `${v} · leans ${(v < mid ? d.left : d.right).toLowerCase()}`;
        };
        input.addEventListener("input", update);
        input._update = update;
        update();

        wrap.append(
          el("div", { class: "dial" }, [
            el("div", { class: "dial-head" }, [
              el("span", { text: d.left }),
              value,
              el("span", { class: "right", text: d.right }),
            ]),
            input,
          ])
        );
      });
      return wrap;
    },

    grid(s) {
      const grid = el("div", { class: "grid" }, s.fields.map((f) => labelled(f, fieldControl(f))));
      if (!s.footnote) return grid;
      const note = el("p", { class: "footnote", text: s.footnote.text });
      s.footnote.links.forEach((l) =>
        note.append(el("a", { href: l.href, target: "_blank", rel: "noopener", text: l.label }))
      );
      return el("div", {}, [grid, note]);
    },

    textarea(s) {
      return fieldControl({ id: s.id, placeholder: s.placeholder, kind: "textarea" });
    },

    brands(s) {
      return el(
        "div",
        { class: "stack" },
        s.lists.map((list) => {
          const rows = el("div", { class: "brand-rows" });
          let count = 0;
          const addRow = () => {
            count += 1;
            const linkId = `${list.id}_${count}_link`;
            rows.append(
              el("div", { class: "brand-row" }, [
                el("input", {
                  class: "input",
                  type: "url",
                  id: linkId,
                  placeholder: list.linkPlaceholder,
                  "aria-label": `${list.label}: link ${count}`,
                  autocomplete: "off",
                  "data-role": "link",
                }),
                el("textarea", {
                  class: "textarea",
                  id: `${list.id}_${count}_notes`,
                  placeholder: list.notesPlaceholder,
                  "aria-label": `${list.label}: what you like or dislike ${count}`,
                  "data-role": "notes",
                }),
              ])
            );
          };
          addRow();
          brandLists[list.id] = rows;

          const add = el("button", { type: "button", class: "btn-add", text: `+ ${list.addButton}` });
          add.addEventListener("click", () => {
            addRow();
            rows.lastElementChild.querySelector("input").focus();
          });

          const wrap = el("div", {}, [el("span", { class: "field-label", text: list.label }), rows, add]);
          wrap._reset = () => {
            while (rows.children.length > 1) rows.lastElementChild.remove();
            count = 1;
          };
          return wrap;
        })
      );
    },
  };

  // ── build page ─────────────────────────────────────────────
  const i = C.intro;
  root.append(
    el("section", { class: "section" }, [
      meta(i.number, i.label),
      el("div", { class: "intro-body" }, [
        el("h1", {
          class: "display intro-title",
          html: `${escapeHtml(i.titleLine1)}<em>${escapeHtml(i.titleLine2)}</em>`,
        }),
        el("div", { class: "intro-side" }, [
          el("p", { text: i.description }),
          el("ul", { class: "checklist" }, i.bullets.map((b) => el("li", { text: b }))),
        ]),
      ]),
    ])
  );

  C.sections.forEach((s) => {
    const body = renderers[s.type](s);
    root.append(
      el("section", { class: "section" }, [
        meta(s.number, s.label),
        el("h2", { class: "display section-title", html: accent(s.title) }),
        s.hint ? el("p", { class: "hint", text: s.hint }) : null,
        body,
      ])
    );
  });

  document.getElementById("submit-btn").textContent = C.submit.button;
  document.getElementById("clear-btn").textContent = C.submit.clear;
  document.getElementById("thanks-title").textContent = C.submit.thanksTitle;
  document.getElementById("thanks-text").textContent = C.submit.thanksText;
  document.getElementById("footer-tagline").textContent = C.footer.tagline;
  document.getElementById("footer-copy").textContent = C.footer.copyright;
  document.getElementById("footer-location").textContent = C.footer.location;

  // ── start screen (branching questions before the form) ────
  const S = C.start;
  const startEl = document.getElementById("start");
  const now = () => new Date().toISOString();

  const choice = (label) => el("button", { type: "button", class: "choice", "aria-pressed": "false", text: label });

  // A yes/no step. Picking an answer marks it and hides everything after it.
  const question = (cfg, onYes, onNo, { big = false } = {}) => {
    const yes = choice(cfg.yes);
    const no = choice(cfg.no);
    const title = big
      ? el("div", { class: "intro-body" }, [
          el("h1", { class: "display intro-title start-title", html: accent(cfg.title) }),
          el("div", { class: "intro-side" }, [el("p", { text: cfg.description })]),
        ])
      : el("div", {}, [
          el("h2", { class: "display section-title", html: accent(cfg.title) }),
          cfg.hint ? el("p", { class: "hint", text: cfg.hint }) : null,
        ]);
    const node = el("div", { class: big ? "" : "step" }, [title, el("div", { class: "choices" }, [yes, no])]);
    const pick = (on, off, next) => {
      on.setAttribute("aria-pressed", "true");
      off.setAttribute("aria-pressed", "false");
      next();
    };
    yes.addEventListener("click", () => pick(yes, no, onYes));
    no.addEventListener("click", () => pick(no, yes, onNo));
    node._reset = () => [yes, no].forEach((b) => b.setAttribute("aria-pressed", "false"));
    return node;
  };

  // Upload step (guidelines file)
  const U = S.upload;
  const fileInput = el("input", { type: "file", id: "guidelines_file", accept: U.accept, class: "file-input" });
  const fileName = el("span", { class: "file-name", text: "Click to choose a file, or drop it here" });
  const dropzone = el("label", { class: "dropzone", for: "guidelines_file" }, [
    fileInput,
    el("span", { class: "dropzone-icon", "aria-hidden": "true", text: "↑" }),
    fileName,
  ]);
  const uploadBtn = el("button", { type: "button", class: "btn-primary", text: U.sendButton, disabled: "" });
  const uploadError = el("p", { class: "form-error", role: "alert", hidden: "" });
  const uploadStep = el("div", { class: "step", hidden: "" }, [
    el("h2", { class: "display section-title", html: accent(U.title) }),
    el("p", { class: "hint", text: U.hint }),
    dropzone,
    uploadError,
    el("div", { class: "actions" }, [uploadBtn]),
  ]);

  const MAX_BYTES = 50 * 1024 * 1024;
  const pickFile = (file) => {
    uploadError.hidden = true;
    if (!file) return;
    if (file.size > MAX_BYTES) {
      uploadError.textContent = "That file is over 50 MB. Please upload a smaller file or a ZIP.";
      uploadError.hidden = false;
      uploadBtn.disabled = true;
      return;
    }
    fileName.textContent = file.name;
    dropzone.classList.add("has-file");
    uploadBtn.disabled = false;
  };
  fileInput.addEventListener("change", () => pickFile(fileInput.files[0]));
  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragging");
  });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragging"));
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragging");
    if (!e.dataTransfer.files.length) return;
    fileInput.files = e.dataTransfer.files;
    pickFile(fileInput.files[0]);
  });
  uploadBtn.addEventListener("click", async () => {
    uploadBtn.disabled = true;
    try {
      await submitBrief({ submittedAt: now(), path: "follow-guidelines" }, fileInput.files[0]);
      openPopup("confirmation");
    } catch (err) {
      console.error(err);
      uploadError.textContent = "The upload didn't go through. Check your connection and try again.";
      uploadError.hidden = false;
      uploadBtn.disabled = false;
    }
  });

  // Sources step (links to where the brand lives)
  const R = S.sources;
  const linkRows = el("div", { class: "brand-rows" });
  const sourcesBtn = el("button", { type: "button", class: "btn-primary", text: R.sendButton, disabled: "" });
  const sourcesError = el("p", { class: "form-error", role: "alert", hidden: "" });
  const links = () => [...linkRows.querySelectorAll("input")].map((i) => i.value.trim()).filter(Boolean);
  const addLink = () => {
    const n = linkRows.children.length + 1;
    const input = el("input", {
      class: "input",
      type: "url",
      id: `source_link_${n}`,
      placeholder: R.placeholder,
      "aria-label": `Link ${n}`,
      autocomplete: "off",
    });
    input.addEventListener("input", () => (sourcesBtn.disabled = !links().length));
    linkRows.append(input);
    return input;
  };
  addLink();
  const addLinkBtn = el("button", { type: "button", class: "btn-add", text: `+ ${R.addButton}` });
  addLinkBtn.addEventListener("click", () => addLink().focus());
  const sourcesStep = el("div", { class: "step", hidden: "" }, [
    el("h2", { class: "display section-title", html: accent(R.title) }),
    el("p", { class: "hint", text: R.hint }),
    linkRows,
    addLinkBtn,
    sourcesError,
    el("div", { class: "actions" }, [sourcesBtn]),
  ]);
  sourcesBtn.addEventListener("click", async () => {
    sourcesBtn.disabled = true;
    try {
      await submitBrief({ submittedAt: now(), path: "follow-touchpoints", links: links() });
      openPopup("confirmation");
    } catch (err) {
      console.error(err);
      sourcesError.textContent = "The links didn't send. Check your connection and try again.";
      sourcesError.hidden = false;
      sourcesBtn.disabled = false;
    }
  });

  // Wire the tree together
  const hide = (...nodes) =>
    nodes.forEach((n) => {
      n.hidden = true;
      n._reset && n._reset();
    });
  const reveal = (node) => {
    node.hidden = false;
    node.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const followQ = question(
    S.follow,
    () => reveal(uploadStep),
    () => {
      hide(uploadStep);
      openPopup("toForm");
    }
  );
  const touchQ = question(
    S.touchpoints,
    () => reveal(sourcesStep),
    () => {
      hide(sourcesStep);
      openPopup("toForm");
    }
  );
  followQ.hidden = true;
  touchQ.hidden = true;

  const firstQ = question(
    S,
    () => {
      hide(touchQ, sourcesStep);
      reveal(followQ);
    },
    () => {
      hide(followQ, uploadStep);
      reveal(touchQ);
    },
    { big: true }
  );

  startEl.append(firstQ, followQ, uploadStep, touchQ, sourcesStep);

  const openForm = () => {
    startEl.hidden = true;
    form.hidden = false;
    window.scrollTo({ top: 0 });
  };

  document.getElementById("back-btn").addEventListener("click", () => {
    form.hidden = true;
    startEl.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // ── pop-ups ────────────────────────────────────────────────
  const modal = document.getElementById("thanks-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalText = document.getElementById("modal-text");
  const modalBtn = document.getElementById("modal-btn");
  let currentPopup = null;

  function openPopup(kind) {
    const P = C.popups[kind];
    currentPopup = kind;
    modalTitle.textContent = P.title;
    modalText.textContent = P.text;
    modalBtn.textContent = P.button;
    modal.hidden = false;
    modalBtn.focus();
  }

  const finish = () => {
    const P = C.popups.confirmation;
    startEl.hidden = true;
    form.hidden = true;
    document.getElementById("thanks-title").textContent = P.title;
    document.getElementById("thanks-text").textContent = P.text;
    document.getElementById("thanks").hidden = false;
    window.scrollTo({ top: 0 });
  };

  modalBtn.addEventListener("click", () => {
    modal.hidden = true;
    currentPopup === "toForm" ? openForm() : finish();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || modal.hidden) return;
    modal.hidden = true;
    if (currentPopup === "confirmation") finish();
  });

  // ── collect answers ────────────────────────────────────────
  function collect() {
    const data = {};
    new FormData(form).forEach((v, k) => {
      if (k.includes(".")) {
        const [group, key] = k.split(".");
        (data[group] = data[group] || {})[key] = Number(v);
      } else {
        data[k] = String(v).trim();
      }
    });
    for (const [k, set] of Object.entries(selections)) data[k] = [...set];
    for (const [k, rows] of Object.entries(brandLists)) {
      data[k] = [...rows.children]
        .map((r) => ({
          link: r.querySelector('[data-role="link"]').value.trim(),
          notes: r.querySelector('[data-role="notes"]').value.trim(),
        }))
        .filter((b) => b.link || b.notes);
    }
    return data;
  }

  /*
   * Where answers (and an uploaded guidelines file) go.
   * For now this only logs them in the browser console.
   * This is the single function the back-end step will replace.
   */
  async function submitBrief(data, file) {
    console.log("Brand brief:", data, file ? `(file: ${file.name})` : "");
    return true;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("submit-btn");
    btn.disabled = true;
    showError("");
    try {
      await submitBrief({ submittedAt: new Date().toISOString(), answers: collect() });
      form.hidden = true;
      document.getElementById("thanks").hidden = false;
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      showError("The brief didn't send. Check your connection and press Send again.");
    } finally {
      btn.disabled = false;
    }
  });

  const errorBox = el("p", { class: "form-error", role: "alert", hidden: "" });
  form.append(errorBox);
  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.hidden = !msg;
  }

  // Two-step clear: first click asks, second click within 4s clears.
  const clearBtn = document.getElementById("clear-btn");
  let clearTimer = null;
  clearBtn.addEventListener("click", () => {
    if (!clearTimer) {
      clearBtn.textContent = "Click again to clear everything";
      clearTimer = setTimeout(() => {
        clearBtn.textContent = C.submit.clear;
        clearTimer = null;
      }, 4000);
      return;
    }
    clearTimeout(clearTimer);
    clearTimer = null;
    clearBtn.textContent = C.submit.clear;
    form.reset();
    for (const set of Object.values(selections)) set.clear();
    form.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", "false"));
    root.querySelectorAll("div").forEach((d) => d._reset && d._reset());
    form.querySelectorAll(".range").forEach((r) => r._update());
  });
})();
