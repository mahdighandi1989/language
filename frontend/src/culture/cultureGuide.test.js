import { describe, it, expect } from 'vitest';
import { CULTURE_GUIDE, cacheInsight } from './cultureGuide.js';

describe('culture guide', () => {
  it('every category has an overview, do/don\'t and phrases with Persian', () => {
    for (const key of ['food', 'social', 'family', 'religion', 'music', 'business', 'daily', 'language']) {
      const g = CULTURE_GUIDE[key];
      expect(g.overview.length).toBeGreaterThan(50);
      expect(g.do.length).toBeGreaterThan(0);
      expect(g.dont.length).toBeGreaterThan(0);
      for (const p of g.phrases) { expect(p.arabic).toBeTruthy(); expect(p.persian).toBeTruthy(); }
    }
  });
  it('caches insights by topic', () => {
    const s = cacheInsight({}, 'تعارف', { title: 't' }, 'T');
    expect(s['تعارف']).toEqual({ title: 't', savedAt: 'T' });
  });
});
