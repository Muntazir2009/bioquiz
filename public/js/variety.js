/* Freshness guard for the AI quiz forge.
   The model answers the same prompt with the same handful of textbook
   questions, so a set is assembled from several small requests and every
   candidate is checked against what this topic has already asked.
   Loaded by quiz.html; require()d by scripts/check-variety.mjs. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.QuizVariety = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const STOPWORDS = new Set(('a an the of in on to for and or is are was were be been which what how why ' +
    'when where who that this these those with from by as at it its their your our do does did not no ' +
    'more most than then into about all any each other some such only also both can could should would ' +
    'may might must will between within during under over following').split(' '));

  function words(s) {
    return String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9]+/g, ' ')
      .split(' ').filter(w => w.length > 2 && !STOPWORDS.has(w));
  }

  function overlap(a, b) {
    const A = new Set(a), B = new Set(b);
    if (!A.size || !B.size) return 0;
    let n = 0;
    A.forEach(w => { if (B.has(w)) n++; });
    return n;
  }

  function jaccard(a, b) {
    const A = new Set(a), B = new Set(b);
    if (!A.size || !B.size) return 0;
    return overlap(a, b) / new Set([...A, ...B]).size;
  }

  function containment(a, b) {
    const A = new Set(a), B = new Set(b);
    if (!A.size || !B.size) return 0;
    return overlap(a, b) / Math.min(A.size, B.size);
  }

  function fullWords(s) {
    return String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9]+/g, ' ')
      .trim().split(' ').filter(Boolean);
  }

  /* Longest run of identical consecutive words. A shared phrase of 8+ words is
     a genuine reword ("...composed of a lipid bilayer with a high concentration
     of cholesterol..."), while shared sentence templates are only 5-6 words. */
  function longestRun(a, b) {
    let best = 0;
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < b.length; j++) {
        let k = 0;
        while (i + k < a.length && j + k < b.length && a[i + k] === b[j + k]) k++;
        if (k > best) best = k;
      }
    }
    return best;
  }

  function answerOf(q) {
    return q && Array.isArray(q.options) ? String(q.options[q.answer] || '') : '';
  }

  function record(q) {
    return { q: q.q, a: answerOf(q) };
  }

  /* A normalized record carries its pick inside options[]; the stored history
     entries carry the answer text in `a`. Accept both shapes. */
  function answerOfRecord(r) {
    return r && r.a != null ? r.a : answerOf(r);
  }

  function sameQuestion(a, b) {
    const stemA = words(a.q), stemB = words(b.q);
    const j = jaccard(stemA, stemB);
    if (j >= 0.7) return true;
    if (longestRun(words(a.q), words(b.q)) >= 6) return true;
    const c = containment(stemA, stemB);
    if (c >= 0.9) return true;
    const ansA = words(answerOfRecord(a)), ansB = words(answerOfRecord(b));
    const sameAnswer = ansA.length > 0 && ansB.length > 0 &&
      (jaccard(ansA, ansB) >= 0.7 || containment(ansA, ansB) >= 0.9);
    return sameAnswer && (j >= 0.5 || c >= 0.75);
  }

  function maxSimilarity(q, list) {
    let best = 0;
    (list || []).forEach(other => {
      const sA = words(q.q), sB = words(other.q);
      const j = jaccard(sA, sB), c = containment(sA, sB);
      const run = longestRun(words(q.q), words(other.q));
      const a1 = words(answerOfRecord(q)), a2 = words(answerOfRecord(other));
      const sameAnswer = a1.length > 0 && a2.length > 0 &&
        (jaccard(a1, a2) >= 0.7 || containment(a1, a2) >= 0.9);
      const score = Math.max(j, c * 0.85, Math.min(1, run / 10)) + (sameAnswer ? 0.1 : 0);
      if (score > best) best = score;
    });
    return best;
  }

  function isRepeat(q, seen, accepted) {
    if ((seen || []).some(s => sameQuestion(q, s))) return true;
    return (accepted || []).some(s => sameQuestion(q, s));
  }

  /* The stem already names the keyed option, so the question answers itself
     ("...home of the Andromeda Galaxy?" / "Andromeda Galaxy"). */
  function givesItselfAway(q) {
    const answer = String(answerOf(q)).toLowerCase().replace(/\s+/g, ' ').trim();
    if (answer.length < 5) return false;
    const stem = ' ' + String(q.q || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
    return stem.includes(' ' + answer + ' ');
  }

  function selectFresh(batch, accepted, seen, count) {
    const out = accepted.slice();
    (batch || []).forEach(q => {
      if (out.length >= count) return;
      if (!q || !q.q || !Array.isArray(q.options) || q.options.length < 2) return;
      if (givesItselfAway(q)) return;
      if (isRepeat(q, seen, out)) return;
      out.push(q);
    });
    return out;
  }

  const STYLES = [
    'define a term precisely',
    'explain the function of something',
    'identify a structure from the job it does',
    'compare two things that are easy to confuse',
    'apply the idea to a real scenario or experiment',
    'spot the exception (which one is NOT true)',
    'put a process in the right order',
    'interpret a result, number or measurement'
  ];

  /* Asking the same topic again with a new angle is what actually produces
     fresh questions once the obvious ones are used up. */
  const LENSES = [
    'experimental evidence: classic experiments, what a microscope or a measurement would show',
    'comparisons: pairs of similar organs or structures and how to tell them apart',
    'real-world and medical angles: diseases, drugs, and what happens when the structure fails',
    'historical detail: who discovered it, how, and what the first evidence was',
    'numbers and scale: sizes, counts, rates and units a student should recognise',
    'common misconceptions: statements that sound true but are not',
    'process detail: the exact order of steps and what each step needs',
    'links to other systems: what this affects elsewhere and how'
  ];

  function shuffle(list, rng) {
    const r = typeof rng === 'function' ? rng : Math.random;
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
    return out;
  }

  function pickLenses(count, rng) {
    return shuffle(LENSES, rng).slice(0, Math.max(1, count));
  }

  function pickStyles(rng) {
    const r = typeof rng === 'function' ? rng : Math.random;
    const pool = STYLES.slice();
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    return pool.slice(0, 3 + Math.floor(r() * 3)).join('; ');
  }

  function buildPrompt(opts) {
    const topic = opts.topic, difficulty = opts.difficulty || 'medium';
    const audience = opts.audience || 'Students';
    const count = opts.count, avoid = opts.avoid || [], seed = opts.seed || '';
    const avoidBlock = avoid.length
      ? '\nDo NOT reuse, reword or lightly disguise any of these questions already asked on this topic:\n' +
        avoid.slice(-25).map(t => '- ' + String(t).replace(/\s+/g, ' ').slice(0, 160)).join('\n') + '\n'
      : '';
    const lensBlock = opts.lens ? '\nFocus this batch on: ' + opts.lens + '.\n' : '';
    return `Generate exactly ${count} multiple-choice quiz questions about: "${topic}".
Difficulty: ${difficulty}. Target Audience: ${audience}.
Variety rules:
1. Every question must test a DIFFERENT fact or sub-concept. No two questions may ask the same thing in different words.
2. Spread the questions across different parts of the topic, not just its most famous fact.
3. Vary the question style: ${pickStyles()}. Do not start every question with "Which ... is responsible for".
4. Prefer specific, less obvious facts over the single most common textbook question.
5. Never put the correct answer's wording inside the question stem.
6. Before writing, silently list 12 different sub-aspects of the topic, then write each question about a different one. Do not show that list.
Randomisation seed: ${seed}. Use it to pick angles you would not normally choose.${lensBlock}${avoidBlock}
Return ONLY a valid JSON array of objects. NO markdown formatting. NO backticks.
Format each object like this:
{"q":"Question text","options":["Answer A","Answer B","Answer C","Answer D"],"answer":2,"explanation":"Brief reason why that option is correct."}
Answer rules:
1. Exactly 4 options.
2. "answer" is the 0-based index of the correct option inside "options" (0, 1, 2 or 3).
3. The explanation must justify exactly the option named by "answer", never a different one.
4. Output raw JSON ONLY.`;
  }

  return {
    words, jaccard, containment, answerOf, record, sameQuestion, isRepeat,
    givesItselfAway, selectFresh, maxSimilarity, longestRun, buildPrompt,
    pickStyles, pickLenses, LENSES
  };
});
