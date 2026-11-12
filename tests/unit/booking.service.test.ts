import { describe, expect, it } from 'vitest';
import { BookingService } from '../../src/bookings/booking.service.js';

describe('BookingService', () => {
  it('collects booking fields and only confirms after explicit approval', () => {
    const service = new BookingService();
    expect(service.start('966700000001').status).toBe('جديد');
    const filled = service.update('966700000001', { service: 'استشارة', date: '2026-12-01', time: '10:00', name: 'سارة' });
    expect(filled.missing).toEqual([]);
    expect(filled.status).toBe('بانتظار التأكيد');
    expect(service.confirm('966700000001').status).toBe('مؤكد');
  });
});
