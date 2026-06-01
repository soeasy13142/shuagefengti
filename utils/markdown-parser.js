const { generateId } = require('./util');

function parseMarkdown(text) {
  if (!text || typeof text !== 'string') return [];

  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  const blocks = splitIntoBlocks(text);
  const questions = [];

  for (const block of blocks) {
    const q = parseBlock(block);
    if (q) questions.push(q);
  }

  return questions;
}

function splitIntoBlocks(text) {
  const pattern = /(?=^\d+[\.\、\)]\s)|(?=^##\s*第?\d+题)/gm;
  const blocks = text.split(pattern).filter(b => b.trim());
  return blocks;
}

function parseBlock(block) {
  const lines = block.trim().split('\n').map(l => l.trim()).filter(l => l);

  if (lines.length === 0) return null;

  let stem = lines[0]
    .replace(/^\d+[\.\、\)]\s*/, '')
    .replace(/^##\s*第?\d+题\s*/, '')
    .trim();

  const options = [];
  let answerLine = '';
  let explanationLine = '';

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const optionMatch = line.match(/^([A-Z])[\.\、\)]\s*(.+)/);
    const answerMatch = line.match(/(?:答案|answer)[：:]\s*(.+)/i);
    const explanationMatch = line.match(/(?:解析|explanation|解释|说明)[：:]\s*(.+)/i);

    if (optionMatch) {
      options.push({ letter: optionMatch[1], text: line });
    } else if (answerMatch) {
      answerLine = answerMatch[1].trim();
    } else if (explanationMatch) {
      explanationLine = explanationMatch[1].trim();
    } else if (!answerLine) {
      if (!stem) {
        stem = line;
      } else {
        stem += '\n' + line;
      }
    }
  }

  if (!stem) return null;

  let answer = answerLine.replace(/\*\*/g, '').trim();
  answer = answer.replace(/\s+/g, '');

  let type = 'essay';
  if (options.length >= 2) {
    const optionLetters = options.map(o => o.letter);
    const isJudge = options.length === 2 &&
      ((optionLetters.includes('A') && optionLetters.includes('B')) ||
       options.some(o => /[对错是否真假]/.test(o.text)));

    if (isJudge) {
      type = 'judge';
    } else {
      const normalizedAnswer = answer.replace(/,/g, '');
      if (normalizedAnswer.length > 1 || /[A-Z].*[A-Z]/.test(normalizedAnswer)) {
        type = 'multi';
        answer = normalizedAnswer;
      } else {
        type = 'single';
      }
    }
  } else if (answer && (stem.includes('___') || stem.includes('（ ）') || stem.includes('____'))) {
    type = 'fill';
  }

  return {
    id: generateId(),
    type,
    stem,
    options,
    answer,
    explanation: explanationLine
  };
}

module.exports = { parseMarkdown };
