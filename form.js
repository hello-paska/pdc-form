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

  // ── state for non-native inputs (chips / multi) ────────────
  const selections = {}; // id -> Set

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

    mixed(s) {
      return el(
        "div",
        { class: "stack" },
        s.fields.map((f) => {
          if (f.kind !== "multi") return labelled(f, fieldControl(f));
          const chosen = (selections[f.id] = new Set());
          const list = el("div", { class: "chips", role: "group", "aria-label": f.label });
          f.options.forEach((o) => {
            const chip = el("button", { type: "button", class: "chip", "aria-pressed": "false", text: o });
            chip.addEventListener("click", () => {
              chosen.has(o) ? chosen.delete(o) : chosen.add(o);
              chip.setAttribute("aria-pressed", chosen.has(o));
            });
            list.append(chip);
          });
          return el("div", {}, [el("span", { class: "field-label", text: f.label }), list]);
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
    return data;
  }

  /*
   * Where answers go. For now this only logs them in the browser console.
   * This is the single function the back-end step will replace.
   */
  async function submitBrief(data) {
    console.log("Brand brief:", data);
    return true;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("submit-btn");
    btn.disabled = true;
    try {
      await submitBrief({ submittedAt: new Date().toISOString(), answers: collect() });
      form.hidden = true;
      document.getElementById("thanks").hidden = false;
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      alert("Something went wrong sending the brief. Please try again.");
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById("clear-btn").addEventListener("click", () => {
    if (!confirm("Clear all answers?")) return;
    form.reset();
    for (const set of Object.values(selections)) set.clear();
    form.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", "false"));
    root.querySelectorAll("div").forEach((d) => d._reset && d._reset());
    form.querySelectorAll(".range").forEach((r) => r._update());
  });
})();
