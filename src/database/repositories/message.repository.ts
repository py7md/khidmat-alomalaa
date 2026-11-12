export class MessageRepository { private records:unknown[]=[]; create<T>(record:T){this.records.push(record);return record;} list(){return [...this.records];} }
