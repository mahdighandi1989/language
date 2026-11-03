/**
 * Purpose: WHEN DOES THE SUPERVISOR COME? Answered from evidence, not faith
 * (ported from the sibling projects' supervisor_rounds).
 *
 * The routines live in claude.ai, not in this repo, so their schedule is
 * MEASURED: every urgent round knocks on the server when it claims the queue
 * (even an empty one), every full round knocks when it pulls the queue. From
 * the last knocks we say when the next one is due, and how sure we are:
 *   observed — watched; this is when it is next due
 *   assumed  — nothing watched yet; the configured default
 *   stale    — it has not knocked for several cycles; the routine may be off
 * «Unmeasured» must never look like «about an hour».
 *
 * Pure: a clock and timestamps in, an answer out. Downstream: routes/inspection.js,
 * frontend/src/inspection/nextRound.js (renders the instant on the reader's clock).
 */

export const KEEP = 12;
export const HOURLY_LO = 45 * 60;
export const HOURLY_HI = 75 * 60;
export const STALE_CYCLES = 3;

const iso = (d) => new Date(d).toISOString();

function parse(list) {
  return (Array.isArray(list) ? list : [])
    .map((v) => new Date(v))
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => a - b);
}

/** Add a knock, newest last, capped at `keep`. Returns ISO strings. */
export function recordKnock(list, now = new Date(), keep = KEEP) {
  const set = new Set(parse(list).map(iso));
  set.add(iso(now));
  return Array.from(set).sort().slice(-keep);
}

function median(xs) {
  const s = [...xs].sort((a, b) => a - b);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

function commonMinute(stamps) {
  const counts = new Map();
  for (const s of stamps) counts.set(s.getUTCMinutes(), (counts.get(s.getUTCMinutes()) || 0) + 1);
  const best = Math.max(...counts.values());
  for (let i = stamps.length - 1; i >= 0; i -= 1) if (counts.get(stamps[i].getUTCMinutes()) === best) return stamps[i].getUTCMinutes();
  return stamps[stamps.length - 1].getUTCMinutes();
}

function atMinute(now, minute) {
  const at = new Date(now);
  at.setUTCMinutes(Math.max(0, Math.min(59, Number(minute) || 0)), 0, 0);
  if (at <= now) at.setUTCHours(at.getUTCHours() + 1);
  return at;
}

/** The urgent (hourly) round: { at, inMinutes, everyMinutes, basis, lastSeen }. */
export function nextRound(now = new Date(), list = [], assumedMinute = 37) {
  const stamps = parse(list);
  const gaps = [];
  for (let i = 1; i < stamps.length; i += 1) {
    const g = (stamps[i] - stamps[i - 1]) / 1000;
    if (g > 0 && g <= 24 * 3600) gaps.push(g);
  }
  let basis = 'assumed';
  let every = 3600;
  let at = atMinute(now, assumedMinute);
  if (gaps.length) {
    every = median(gaps);
    if (every >= HOURLY_LO && every <= HOURLY_HI) {
      at = atMinute(now, commonMinute(stamps));
      every = 3600;
    } else {
      at = new Date(stamps[stamps.length - 1]);
      while (at <= now) at = new Date(at.getTime() + every * 1000);
    }
    basis = 'observed';
    if ((now - stamps[stamps.length - 1]) / 1000 > STALE_CYCLES * every) basis = 'stale';
  }
  return {
    at: iso(at),
    inMinutes: Math.max(0, Math.round((at - now) / 60000)),
    everyMinutes: Math.round(every / 60),
    basis,
    lastSeen: stamps.length ? iso(stamps[stamps.length - 1]) : null,
  };
}

function parseCron(expr) {
  try {
    const [minute, hour, , , dows] = String(expr).trim().split(/\s+/);
    const days = dows === '*' ? [0, 1, 2, 3, 4, 5, 6] : [...new Set(dows.split(',').map((d) => Number(d) % 7))].sort();
    if ([minute, hour].some((x) => !/^\d+$/.test(x)) || days.some((d) => Number.isNaN(d))) throw new Error('bad');
    return { minute: Number(minute), hour: Number(hour), days };
  } catch {
    return { minute: 23, hour: 2, days: [1, 4] };
  }
}

/** The full round: next from the configured cron (UTC); knocks say when it last came / stopped. */
export function nextFullRound(now = new Date(), list = [], cron = '23 2 * * 1,4') {
  const { minute, hour, days } = parseCron(cron);
  let at = null;
  for (let add = 0; add < 8 && !at; add += 1) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() + add);
    d.setUTCHours(hour, minute, 0, 0);
    if (days.includes(d.getUTCDay()) && d > now) at = d;
  }
  if (!at) at = new Date(now.getTime() + 7 * 86400000);
  const stamps = parse(list);
  const last = stamps.length ? stamps[stamps.length - 1] : null;
  const sorted = [...days].sort((a, b) => a - b);
  const gaps = sorted.map((d, i) => ((sorted[(i + 1) % sorted.length] - d + 7) % 7) || 7);
  const longest = gaps.length ? Math.max(...gaps) : 7;
  const basis = last && (now - last) / 1000 > (longest + 1) * 86400 ? 'stale' : 'scheduled';
  return {
    at: iso(at),
    inMinutes: Math.max(0, Math.round((at - now) / 60000)),
    lastSeen: last ? iso(last) : null,
    basis,
    schedule: cron,
  };
}
