export class AvailabilityService { isAvailable(_date:string,_time:string){return true;} suggest(date:string){return [`${date} 10:00`,`${date} 14:00`];} }
