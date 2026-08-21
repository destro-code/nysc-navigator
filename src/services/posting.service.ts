import { storage } from "@/data/storage";
import { seedPosting } from "@/data/seed";
import type { PostingProgress } from "@/types";
const key=(id:string)=>`posting.${id}`;
const empty=(userId:string):PostingProgress=>({...seedPosting(),user_id:userId,reg_number:"",stream:"",state:"",registration_date:null,camp_start_date:null,ppa_assigned_date:null,cds_assigned_date:null,pop_date:null});
export const postingService={
 async get(userId:string){return storage.get<PostingProgress>(key(userId),userId==="demo-user-1"?seedPosting():empty(userId));},
 async save(userId:string,updates:Partial<PostingProgress>){const next={...await this.get(userId),...updates,user_id:userId};storage.set(key(userId),next);return next;},
};
