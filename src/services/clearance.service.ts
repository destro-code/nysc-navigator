import { storage } from "@/data/storage";
import { seedClearance } from "@/data/seed";
import type { ClearanceProgressEntry } from "@/types";
const key=(id:string)=>`clearance.${id}`;
export const clearanceService={
 async list(userId:string){return storage.get<ClearanceProgressEntry[]>(key(userId),userId==="demo-user-1"?seedClearance():[]);},
 async toggle(entry:Omit<ClearanceProgressEntry,"completed_at">){const next={...entry,completed_at:entry.completed?new Date().toISOString():null};const rows=await this.list(entry.user_id);const result=[...rows.filter(r=>r.item_id!==entry.item_id),next];storage.set(key(entry.user_id),result);return next;},
};
