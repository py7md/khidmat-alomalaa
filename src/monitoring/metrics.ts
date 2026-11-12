export class Metrics {private counters=new Map<string,number>(); inc(name:string){this.counters.set(name,(this.counters.get(name)??0)+1);} snapshot(){return Object.fromEntries(this.counters);}}
