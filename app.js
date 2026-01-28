const el = (id) => document.getElementById(id);

const ui = {
  mode: el("mode"),
  joiner: el("joiner"),
  column: el("column"),
  operator: el("operator"),
  inLayout: el("inLayout"),
  comma: el("comma"),
  quote: el("quote"),
  escapeSql: el("escapeSql"),
  trim: el("trim"),
  skipEmpty: el("skipEmpty"),
  input: el("input"),
  output: el("output"),
  copyBtn: el("copyBtn"),
  resetBtn: el("resetBtn"),
  clearBtn: el("clearBtn"),
  status: el("status"),
  joinerWrap: el("joinerWrap"),
  operatorWrap: el("operatorWrap"),
  inLayoutWrap: el("inLayoutWrap"),
  commaWrap: el("commaWrap")
};

const settingsKey = "sql-quoter-settings";

function loadSettings() {
  try {
    const data = JSON.parse(localStorage.getItem(settingsKey) || "{}");
    Object.keys(data).forEach((key) => {
      if (ui[key] && ui[key].type === "checkbox") ui[key].checked = data[key];
      else if (ui[key] && "value" in ui[key]) ui[key].value = data[key];
    });
  } catch (_) {}
}

function saveSettings() {
  const data = {
    mode: ui.mode.value,
    joiner: ui.joiner.value,
    column: ui.column.value,
    operator: ui.operator.value,
    inLayout: ui.inLayout.value,
    comma: ui.comma.value,
    quote: ui.quote.value,
    escapeSql: ui.escapeSql.checked,
    trim: ui.trim.checked,
    skipEmpty: ui.skipEmpty.checked
  };
  localStorage.setItem(settingsKey, JSON.stringify(data));
}

function resetSettings() {
  localStorage.removeItem(settingsKey);

  const defaults = [
    ui.mode, ui.joiner, ui.column, ui.operator,
    ui.inLayout, ui.comma, ui.quote,
    ui.escapeSql, ui.trim, ui.skipEmpty
  ];

  defaults.forEach((node) => {
    if (!node) return;
    if (node.type === "checkbox") {
      node.checked = node.defaultChecked;
    } else if ("value" in node) {
      node.value = node.defaultValue;
    }
  });

  ui.status.textContent = "Settings reset to defaults.";
  setTimeout(() => {
    if (ui.status.textContent === "Settings reset to defaults.") {
      ui.status.textContent = "";
    }
  }, 1200);
}

function parseLines() {
  let lines = ui.input.value.split(/\r?\n/);
  if (ui.trim.checked) lines = lines.map((s) => s.trim());
  if (ui.skipEmpty.checked) lines = lines.filter((s) => s.length > 0);
  return lines;
}

function escapeQuoteChar(s, q) {
  if (!q) return s;
  const escaped = q === "'" ? "''" : "\\" + q;
  return s.replace(new RegExp(q, "g"), escaped);
}

function applyQuotes(values) {
  const q = ui.quote.value;
  return values.map((raw) => {
    let s = raw;
    if (ui.escapeSql.checked && q) s = escapeQuoteChar(s, q);
    return q ? (q + s + q) : s;
  });
}

function splitColumns(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  const cols = [];
  let current = "";
  let inQuote = null;
  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (inQuote) {
      current += ch;
      if (ch === inQuote) inQuote = null;
    } else if (ch === '"' || ch === "`" || ch === "[") {
      inQuote = ch === "[" ? "]" : ch;
      current += ch;
    } else if (ch === "," || /\s/.test(ch)) {
      if (current) cols.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  if (current) cols.push(current);
  return cols;
}

function formatInList(quoted) {
  const layout = ui.inLayout.value;
  const commaStyle = ui.comma.value;
  if (layout === "single") {
    return "(" + quoted.join(",") + ")";
  }
  const lines = quoted.map((s, i) => {
    const isLast = i === quoted.length - 1;
    if (commaStyle === "trailing") return isLast ? s : (s + ",");
    if (commaStyle === "leading") return i === 0 ? s : ("," + s);
    return s;
  });
  return "(\n  " + lines.join("\n  ") + "\n)";
}

function formatLogic(values, quoted, cols) {
  const op = ui.operator.value;
  const joiner = ui.joiner.value;

  let columns = cols.slice();
  if (columns.length === 0) columns = ["col"];

  let warning = "";
  if (columns.length !== 1 && columns.length !== values.length) {
    warning = `Column count (${columns.length}) does not match values (${values.length}); using '${columns[0]}' for all.`;
    columns = [columns[0]];
  }

  const lines = values.map((_, i) => {
    const col = columns.length === 1 ? columns[0] : columns[i];
    const clause = col + " " + op + " " + quoted[i];
    return i === 0 ? clause : (joiner + " " + clause);
  });

  return { text: lines.join("\n"), warning };
}

function updateVisibility() {
  const isIn = ui.mode.value === "in";
  ui.joinerWrap.classList.toggle("hidden", isIn);
  ui.operatorWrap.classList.toggle("hidden", isIn);
  ui.inLayoutWrap.classList.toggle("hidden", !isIn);
  ui.commaWrap.classList.toggle("hidden", !isIn);
}

function compute() {
  const values = parseLines();
  if (values.length === 0) {
    ui.output.value = "";
    ui.status.textContent = "";
    saveSettings();
    return;
  }

  const quoted = applyQuotes(values);
  const cols = splitColumns(ui.column.value);
  const isIn = ui.mode.value === "in";

  if (isIn) {
    const list = formatInList(quoted);
    const rawColumn = ui.column.value.trim();
    ui.output.value = rawColumn ? (rawColumn + " IN " + list) : list;
    ui.status.textContent = "";
  } else {
    const result = formatLogic(values, quoted, cols);
    ui.output.value = result.text;
    ui.status.textContent = result.warning;
  }

  saveSettings();
}

function wire() {
  loadSettings();
  updateVisibility();
  compute();

  const inputs = [
    ui.mode, ui.joiner, ui.column, ui.operator,
    ui.inLayout, ui.comma, ui.quote,
    ui.escapeSql, ui.trim, ui.skipEmpty, ui.input
  ];
  inputs.forEach((node) => {
    node.addEventListener("input", () => {
      updateVisibility();
      compute();
    });
    node.addEventListener("change", () => {
      updateVisibility();
      compute();
    });
  });

  ui.copyBtn.addEventListener("click", async () => {
    if (!ui.output.value) return;
    try {
      await navigator.clipboard.writeText(ui.output.value);
      ui.copyBtn.textContent = "Copied";
      setTimeout(() => (ui.copyBtn.textContent = "Copy"), 900);
    } catch (_) {
      ui.output.focus();
      ui.output.select();
      document.execCommand("copy");
    }
  });

  ui.resetBtn.addEventListener("click", () => {
    resetSettings();
    updateVisibility();
    compute();
  });

  ui.clearBtn.addEventListener("click", () => {
    ui.input.value = "";
    ui.output.value = "";
    ui.status.textContent = "";
    ui.input.focus();
    saveSettings();
  });
}

wire();
