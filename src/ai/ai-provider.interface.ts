export interface AIProvider { complete(system:string,user:string):Promise<string>; }
