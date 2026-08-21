import { storage, uid } from "@/data/storage";
import { seedAllowance } from "@/data/seed";
import type { AllowanceRecord, AllowanceStatus } from "@/types";
const key=(id:string)=>`allowance.${id}`;
export const allowanceService={
 async list(userId:string){return storage.get<AllowanceRecord[]>(key(userId),userId==="demo-user-1"?seedAllowance():[]);},
 async upsert(record:Omit<AllowanceRecord,"id">&{id?:string}){const records=await this.list(record.user_id);const id=record.id??uid();const next={...record,id};const filtered=records.filter(r=>!(r.month===record.month&&r.year===record.year));const result=[...filtered,next];storage.set(key(record.user_id),result);return next;},
 async setStatus(id:string,status:AllowanceStatus){for(const [k] of Object.entries(localStorage)){if(!k.startsWith("nysc.v1.allowance."))continue;const records=storage.get<AllowanceRecord[]>(k.replace("nysc.v1.",""),[]);const next=records.map(r=>r.id===id?{...r,status}:r);storage.set(k.replace("nysc.v1.",""),next);}},
 async add(userId:string,month:string,year:number,amount:number){return this.upsert({user_id:userId,month,year,amount,status:"pending",notes:""});},
};
