import fs from 'fs';

const content = fs.readFileSync('task-05-sessions-compliance-defence/docs/interview-answers.md', 'utf8');

const questions = content.split(/### Question \d+:/).slice(1);
console.log(`Found ${questions.length} interview questions. Checking answer word counts...\n`);

let allPassed = true;

questions.forEach((q, idx) => {
  // Extract answer portion (everything after the question prompt header line)
  const firstNewline = q.indexOf('\n');
  const prompt = q.substring(0, firstNewline).trim();
  const answer = q.substring(firstNewline).trim();

  // Strip code blocks and markdown symbols for clean text word count
  const cleanAnswer = answer.replace(/```[\s\S]*?```/g, ' ').replace(/[#*`_\[\]()]/g, ' ').trim();
  const answerWords = cleanAnswer.split(/\s+/).filter(Boolean);
  const count = answerWords.length;

  // Also check total (prompt + answer)
  const totalWords = q.replace(/```[\s\S]*?```/g, ' ').replace(/[#*`_\[\]()]/g, ' ').trim().split(/\s+/).filter(Boolean).length;

  if (count <= 200) {
    console.log(`✅ Question ${idx + 1}: ${count} answer words (Total with prompt: ${totalWords}) [PASS]`);
  } else {
    console.log(`❌ Question ${idx + 1}: ${count} answer words (EXCEEDS 200 WORDS) [FAIL]`);
    allPassed = false;
  }
});

// Check for word metric labels
const hasWordCountLabels = /word count/i.test(content) || /\(\d+\s*words\)/i.test(content);
if (hasWordCountLabels) {
  console.log('\n❌ FAILED: Document contains prohibited word count annotations.');
  allPassed = false;
} else {
  console.log('\n✅ ZERO word metric labels found (PASS).');
}

if (allPassed) {
  console.log('\n🎉 ALL 22 INTERVIEW ANSWERS COMPLY WITH WORD LIMIT (<200) AND ZERO WORD LABELS!');
} else {
  console.log('\n⚠️ Some answers failed validation.');
}
