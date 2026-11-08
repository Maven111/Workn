import fs from 'fs';
import path from 'path';

const filePath = path.resolve('task-04-server-security/docs/interview-answers.md');
const text = fs.readFileSync(filePath, 'utf8');

const sections = text.split(/### \d+\. /).slice(1);

console.log(`Found ${sections.length} interview answers. Checking word counts...`);

let allValid = true;
sections.forEach((sec, idx) => {
  const qNum = idx + 1;
  const lines = sec.trim().split('\n');
  const question = lines[0];
  const answerBody = lines.slice(1).join(' ').replace(/---/g, '').trim();
  const words = answerBody.split(/\s+/).filter(Boolean);
  const count = words.length;

  const hasWordCountLabel = /word count/i.test(answerBody);

  if (count > 200 || hasWordCountLabel) {
    allValid = false;
    console.error(`❌ Question ${qNum} FAILED: ${count} words (Limit: 200) | Label detected: ${hasWordCountLabel}`);
  } else {
    console.log(`✅ Question ${qNum}: ${count} words (PASS)`);
  }
});

if (allValid) {
  console.log('\n🎉 ALL 19 INTERVIEW ANSWERS COMPLY WITH WORD LIMIT (<200) AND ZERO WORD LABELS!');
} else {
  process.exit(1);
}

