export type HandoffReason='طلب موظف'|'معلومة غير موثوقة'|'شكوى'|'مشكلة دفع'|'فشل تكامل'; export type HandoffRecord={phone:string;reason:HandoffReason;at:string;status:'مفتوح'|'مغلق'};
