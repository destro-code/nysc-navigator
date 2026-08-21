import { storage, uid } from "@/data/storage";
import { seedPosts, seedReports, seedVotes } from "@/data/seed";
import { profileService } from "./profile.service";
import type { ForumPost, PostFlair, PostReport, PostVote, VoteType } from "@/types";
const POSTS="forum.posts",VOTES="forum.votes",REPORTS="forum.reports";
const posts=()=>storage.get<ForumPost[]>(POSTS,seedPosts()); const votes=()=>storage.get<PostVote[]>(VOTES,seedVotes()); const reports=()=>storage.get<PostReport[]>(REPORTS,seedReports());
const withCounts=(p:ForumPost):ForumPost=>{const vs=votes().filter(v=>v.post_id===p.id);return {...p,upvotes:p.upvotes+vs.filter(v=>v.value===1).length,downvotes:p.downvotes+vs.filter(v=>v.value===-1).length};};
export const forumService={
 async listPosts(){return posts().sort((a,b)=>+new Date(b.created_at)-+new Date(a.created_at)).map(withCounts);},
 async getUserVotes(userId:string){return Object.fromEntries(votes().filter(v=>v.user_id===userId).map(v=>[v.post_id,v.value===1?"up":"down"]));},
 async createPost(input:{user_id:string;content:string;flair:PostFlair}){const content=input.content.trim();if(!content)throw new Error("Post cannot be empty.");const profile=await profileService.getProfile(input.user_id);const post:ForumPost={id:uid(),user_id:input.user_id,author_username:profile?.username??"Corper",author_status:profile?.status??"serving",content,flair:input.flair,created_at:new Date().toISOString(),upvotes:0,downvotes:0,comments_count:0};storage.set(POSTS,[post,...posts()]);return post;},
 async deletePost(postId:string){storage.set(POSTS,posts().filter(p=>p.id!==postId));storage.set(VOTES,votes().filter(v=>v.post_id!==postId));},
 async vote(userId:string,postId:string,type:VoteType){const value=type==="up"?1:-1;const current=votes();const existing=current.find(v=>v.post_id===postId&&v.user_id===userId);let next=current;if(existing?.value===value)next=current.filter(v=>v!==existing);else next=[...current.filter(v=>!(v.post_id===postId&&v.user_id===userId)),{id:uid(),post_id:postId,user_id:userId,value}];storage.set(VOTES,next);const all=next.filter(v=>v.post_id===postId);return{upvotes:posts().find(p=>p.id===postId)?.upvotes??0+all.filter(v=>v.value===1).length,downvotes:posts().find(p=>p.id===postId)?.downvotes??0+all.filter(v=>v.value===-1).length,user_vote:existing?.value===value?null:type};},
 async reportPost(input:{user_id:string;post_id:string;reason:string}){if(reports().some(r=>r.user_id===input.user_id&&r.post_id===input.post_id&&r.status==="pending"))throw new Error("You've already reported this post.");const report:PostReport={id:uid(),...input,status:"pending",created_at:new Date().toISOString()};storage.set(REPORTS,[...reports(),report]);return report;},
 async listReports(){return reports().filter(r=>r.status==="pending").map(r=>({...r,post_content:posts().find(p=>p.id===r.post_id)?.content}));},
 async resolveReport(reportId:string,action:"dismissed"|"reviewed",opts?:{removePostId?:string}){storage.set(REPORTS,reports().map(r=>r.id===reportId?{...r,status:action}:r));if(opts?.removePostId)await this.deletePost(opts.removePostId);},
 async listUserPosts(userId:string){return (await this.listPosts()).filter(p=>p.user_id===userId);},
 async listLikedPosts(userId:string){const ids=new Set(votes().filter(v=>v.user_id===userId&&v.value===1).map(v=>v.post_id));return (await this.listPosts()).filter(p=>ids.has(p.id));},
};
