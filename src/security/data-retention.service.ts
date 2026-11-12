export class DataRetentionService { constructor(private days=90){} shouldDelete(createdAt:string){return Date.now()-Date.parse(createdAt)>this.days*86400000;} }
