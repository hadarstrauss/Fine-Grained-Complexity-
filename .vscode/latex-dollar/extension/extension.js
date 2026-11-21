const vscode = require('vscode');

// Math state at the end of `text` (one line): 'none' | 'inline' | 'display'.
function mathState(text) {
  let st = 'none';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '\\') { i++; continue; }      // skip escaped char, e.g. \$
    if (ch === '%') break;                    // rest of line is a comment
    if (ch !== '$') continue;
    const dbl = text[i + 1] === '$';
    if (st === 'none') { st = dbl ? 'display' : 'inline'; if (dbl) i++; }
    else if (st === 'inline') { st = 'none'; }
    else if (dbl) { st = 'none'; i++; }
  }
  return st;
}

const CLOSE_BEFORE = new Set([undefined, ' ', '\t', ';', ':', '.', ',', '=', '}', ']', ')', '>', '`', '\'', '~']);

async function smartDollar(editor) {
  const sel = editor.selection;
  if (!sel.isEmpty) {
    // Wrap selection using the language's surroundingPairs.
    return vscode.commands.executeCommand('default:type', { text: '$' });
  }
  const pos = sel.active;
  const line = editor.document.lineAt(pos.line).text;
  const c = pos.character;
  const prev = line[c - 1], next = line[c], next2 = line[c + 1];
  const setCursor = (p) => { editor.selection = new vscode.Selection(p, p); };

  if (prev === '\\') {                        // \$ : literal dollar
    return vscode.commands.executeCommand('default:type', { text: '$' });
  }

  // Empty inline pair $|$  ->  $$|$$
  if (prev === '$' && next === '$' && next2 !== '$' &&
      mathState(line.slice(0, c - 1)) === 'none') {
    await editor.edit(e => e.insert(pos, '$$'));
    return setCursor(pos.translate(0, 1));
  }

  // Inside math with a $ right after the cursor: step over it.
  if (next === '$' && mathState(line.slice(0, c)) !== 'none') {
    return setCursor(pos.translate(0, 1));
  }

  // Opening a new inline math: insert $|$
  if (mathState(line.slice(0, c)) === 'none' && CLOSE_BEFORE.has(next)) {
    await editor.edit(e => e.insert(pos, '$$'));
    return setCursor(pos.translate(0, 1));
  }

  return vscode.commands.executeCommand('default:type', { text: '$' });
}

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('latexDollar.type', smartDollar)
  );
}

function deactivate() {}

module.exports = { activate, deactivate };

