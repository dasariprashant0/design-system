// Best-effort keyboard table from the `a11y` lines of meta.json. Pure.
const KEYS = '(?:Shift\\s*\\+\\s*Tab|Ctrl\\s*\\+\\s*\\w+|Cmd\\s*\\+\\s*\\w+|Meta\\s*\\+\\s*\\w+|Enter|Space|Escape|Esc|Tab|Home|End|Page\\s?Up|Page\\s?Down|Arrow\\s+keys?|Backspace|Delete|Arrow\\s+(?:Up|Down|Left|Right)(?:\\s*/\\s*(?:Up|Down|Left|Right))?|Arrow(?:Up|Down|Left|Right))';
const LIST = new RegExp(`^(?:the\\s+)?(${KEYS}(?:\\s*(?:,|/|and|or|&)\\s*${KEYS})*)\\s+(?!is\\b|are\\b|and\\b|or\\b|order\\b|stops?\\b|keys?\\b)(.+)$`, 'i');
const COLON = new RegExp(`^(?:[\\w<>/ ]+:\\s*)?(${KEYS}(?:\\s*(?:,|/|and|or|&)\\s*${KEYS})*)\\s+(?!is\\b|are\\b|and\\b|or\\b|order\\b|stops?\\b|keys?\\b)(.+)$`, 'i');
const SPLIT = new RegExp(`;\\s+|\\.\\s+(?=[A-Z])|,\\s+(?=${KEYS}\\b)`, 'i');

/** Each line may carry several clauses separated by `;` or `. `. Returns [{keys, action}]. */
export function keyboardRows(lines) {
  const rows = [];
  for (const line of lines) {
    const clauses = line.replace(/<[^>]+>/g, '').split(SPLIT);
    for (const raw of clauses) {
      const c = raw.trim().replace(/\.$/, '');
      const m = c.match(LIST) ?? c.match(COLON);
      if (!m) continue;
      const keys = m[1].replace(/\s*(,|\band\b|\bor\b|&|\/)\s*/gi, ' / ').replace(/\s+/g, ' ').trim().replace(/^./, (c) => c.toUpperCase());
      const action = m[2].trim().replace(/^[:,-]\s*/, '');
      if (action.length < 3) continue;
      rows.push({keys, action: action[0].toUpperCase() + action.slice(1)});
    }
  }
  return rows;
}
