export type KnowledgeVersion={version:string;updatedAt:string;updatedBy:string}; export function isCurrent(a:KnowledgeVersion,b:KnowledgeVersion){return a.updatedAt>=b.updatedAt;}
