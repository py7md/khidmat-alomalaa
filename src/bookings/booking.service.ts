export type BookingStatus = 'جديد'|'بانتظار التأكيد'|'مؤكد'|'مرفوض'|'ملغى'|'محال لموظف';
export type Booking = { phone:string; service?:string; date?:string; time?:string; name?:string; status:BookingStatus };
const required = ['service','date','time','name'] as const;
export class BookingService {
  private bookings = new Map<string, Booking>();
  start(phone:string): Booking { const booking:Booking={phone,status:'جديد'}; this.bookings.set(phone,booking); return booking; }
  update(phone:string, values:Partial<Omit<Booking,'phone'|'status'>>): Booking & {missing:string[]} {
    const booking=this.bookings.get(phone) ?? this.start(phone); Object.assign(booking, values);
    const missing=required.filter((key)=>!booking[key]); if(!missing.length && booking.status==='جديد') booking.status='بانتظار التأكيد';
    return {...booking, missing:[...missing]};
  }
  confirm(phone:string): Booking { const booking=this.bookings.get(phone); if(!booking) throw new Error('BOOKING_NOT_FOUND'); if(booking.status!=='بانتظار التأكيد') throw new Error('BOOKING_NOT_READY'); booking.status='مؤكد'; return booking; }
  get(phone:string){ return this.bookings.get(phone); }
}
