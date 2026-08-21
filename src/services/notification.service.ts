import { storage, uid } from "@/data/storage";
import { seedNotifications } from "@/data/seed";
import type { AppNotification, NotificationType } from "@/types";
const key=(id:string)=>`notifications.${id}`;
export const notificationService={
 async list(userId:string){return storage.get<AppNotification[]>(key(userId),userId==="demo-user-1"?seedNotifications():[]).sort((a,b)=>+new Date(b.created_at)-+new Date(a.created_at));},
 async unreadCount(userId:string){return (await this.list(userId)).filter(n=>!n.read).length;},
 async markRead(userId:string,id:string){storage.set(key(userId),(await this.list(userId)).map(n=>n.id===id?{...n,read:true}:n));},
 async markAllRead(userId:string){storage.set(key(userId),(await this.list(userId)).map(n=>({...n,read:true})));},
 async create(userId:string,type:NotificationType,title:string,message:string){const n:AppNotification={id:uid(),user_id:userId,type,title,message,created_at:new Date().toISOString(),read:false};storage.set(key(userId),[n,...await this.list(userId)]);return n;},
};
