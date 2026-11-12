import { describe, expect, it } from 'vitest';
import { AgentService } from '../../src/ai/agent.service.js';

describe('AgentService', () => {
  it('answers from the knowledge base and refuses unknown facts', () => {
    const agent = new AgentService();
    expect(agent.reply('ما هي ساعات العمل؟').text).toContain('09:00');
    expect(agent.reply('هل تقدمون خدمة غير موجودة؟').handoff).toBe(true);
  });
});
