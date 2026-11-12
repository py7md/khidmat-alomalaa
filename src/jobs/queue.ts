export type Job={name:string;payload:unknown}; export class JobQueue {jobs:Job[]=[]; add(name:string,payload:unknown){const job={name,payload};this.jobs.push(job);return job;} }
