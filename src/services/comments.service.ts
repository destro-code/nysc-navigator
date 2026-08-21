import { storage, uid } from "@/data/storage";
import { seedPosts, seedUsers } from "@/data/seed";
export interface ForumComment{id:string;post_id:string;user_id:string;author_username:string;content:string;created_at:string;updated_at:string;}
const key=(post:string)=>`comments.${post}`;
export const commentsService={
 async list(postId:string){return storage.get<ForumComment[]>(key(postId),[]);},
 async create(userId:string,postId:string,content:string){const trimmed=content.trim();if(!trimmed)throw new Error("Comment cannot be empty.");if(trimmed.length>2000)throw new Error("Comment cannot exceed 2000 characters.");const profile=seedUsers().find(u=>u.user_id===userId)||storage.get<any[]>("users",seedUsers()).find(u=>u.user_id===userId);const now=new Date().toISOString();const comment={id:uid(),post_id:postId,user_id:userId,author_username:profile?.username??"Corper",content:trimmed,created_at:now,updated_at:now};storage.set(key(postId),[...await this.list(postId),comment]);return comment;},
 async update(userId:string,commentId:string,content:string){const trimmed=content.trim();if(!trimmed)throw new Error("Comment cannot be empty.");for(const post of storage.get<any[]>("forum.posts",seedPosts())){const rows=await this.list(post.id);const found=rows.find(c=>c.id===commentId&&c.user_id===userId);if(found){const next={...found,content:trimmed,updated_at:new Date().toISOString()};storage.set(key(post.id),rows.map(c=>c.id===commentId?next:c));return next;}}throw new Error("Comment not found.");},
 async remove(userId:string,commentId:string){for(const post of storage.get<any[]>("forum.posts",seedPosts())){const rows=await this.list(post.id);if(rows.some(c=>c.id===commentId&&c.user_id===userId)){storage.set(key(post.id),rows.filter(c=>c.id!==commentId));return;}}},
};
