import sharp from 'sharp';
import {constants} from 'node:fs';
import {mkdir,lstat,realpath,open,rename,rm} from 'node:fs/promises';
import {isAbsolute,resolve,relative,join,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {MarketplaceError,UUID} from './marketplace-validation.js';

export const MAX_PHOTO_BYTES=8*1024*1024;
export const MAX_PHOTOS=20;
export const PHOTO_TYPES=['image/jpeg','image/png','image/webp'];
const variants={gallery:['gallery.webp','image/webp'],thumb:['thumb.webp','image/webp'],share:['share.jpg','image/jpeg']};
const parentSource=fileURLToPath(new URL('../../',import.meta.url));
const sourceRoot=resolve(parentSource)==='/'?fileURLToPath(new URL('../',import.meta.url)):parentSource;
const within=(parent,path)=>{const rel=relative(parent,path);return rel===''||(rel!=='..'&&!rel.startsWith('..'+sep)&&!isAbsolute(rel));};
const failure=(status,code,message)=>new MarketplaceError(status,code,message);
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
let processing=0;
sharp.cache(false);
sharp.concurrency(1);

export function validMediaRoot(value) {
 if(typeof value!=='string'||!isAbsolute(value)||resolve(value)==='/'||within(sourceRoot,resolve(value)))
  throw new Error('LISTING_MEDIA_ROOT must be an absolute private directory outside application source');
 return resolve(value);
}
export async function readyMediaRoot(value) {
 const root=validMediaRoot(value);
 await mkdir(root,{recursive:true,mode:0o700});
 const stat=await lstat(root),actual=await realpath(root),sourceActual=await realpath(sourceRoot);
 if(!stat.isDirectory()||stat.isSymbolicLink()||(stat.mode&0o077)||within(sourceActual,actual))
  throw new Error('Listing media needs a private regular directory outside application source');
 return root;
}
const sniff=bytes=>bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff?'image/jpeg':
 bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))?'image/png':
 bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP'?'image/webp':null;
export async function processPhoto(bytes,type) {
 if(!Buffer.isBuffer(bytes)||!bytes.length)throw failure(422,'INVALID_IMAGE','Choose a valid JPEG, PNG or WebP image.');
 if(bytes.length>MAX_PHOTO_BYTES)throw failure(413,'PHOTO_TOO_LARGE','Each photo must be 8 MiB or smaller.');
 if(!PHOTO_TYPES.includes(type)||sniff(bytes)!==type)throw failure(415,'IMAGE_TYPE_REJECTED','Use an actual JPEG, PNG or WebP photo.');
 if(processing>=2)throw failure(503,'IMAGE_PROCESSING_BUSY','Photo processing is busy. Please try again shortly.');
 processing++;
 try {
  const image=sharp(bytes,{failOn:'warning',limitInputPixels:36000000,autoOrient:true});
  const info=await image.metadata();
  if((info.pages||1)!==1)throw new Error('Animated images are not supported');
  const result={};
  for(const name of Object.keys(variants)) {
   let next=image.clone();
   if(name==='gallery')next=next.resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true}).webp({quality:82});
   if(name==='thumb')next=next.resize(480,360,{fit:'cover'}).webp({quality:80});
   if(name==='share')next=next.resize(1200,630,{fit:'cover'}).flatten({background:'#ffffff'}).jpeg({quality:85});
   // sharp removes EXIF/GPS/ICC metadata by default. Never expose the upload.
   const {data,info:out}=await next.toBuffer({resolveWithObject:true});
   if(!data.length||data.length>MAX_PHOTO_BYTES)throw new Error('Output too large');
   result[name]={data,mime_type:variants[name][1],width:out.width,height:out.height,byte_length:data.length,sha256:hash(data)};
  }
  return result;
 }catch(error){if(error instanceof MarketplaceError)throw error;throw failure(422,'INVALID_IMAGE','This image could not be decoded safely. Use a single JPEG, PNG or WebP photo up to 36 megapixels.');}
 finally{processing--;}
}
export function mediaStorage(root) {
 const assetPath=id=>{if(!UUID.test(String(id)))throw new Error('Invalid media asset');return join(validMediaRoot(root),id);};
 return {
  async write(id,processed) {
   await readyMediaRoot(root);const target=assetPath(id),pending=join(root,'.pending-'+id);
   let created=false;
   try {
    await mkdir(pending,{mode:0o700});created=true;
    for(const [name,[filename]] of Object.entries(variants)) {
     const f=await open(join(pending,filename),constants.O_WRONLY|constants.O_CREAT|constants.O_EXCL|constants.O_NOFOLLOW,0o600);
     try{await f.writeFile(processed[name].data);await f.sync();}finally{await f.close();}
    }
    // A UUID collision must fail rather than replacing existing image bytes.
    try{await lstat(target);throw new Error('Asset already exists');}catch(error){if(error.code!=='ENOENT')throw error;}
    await rename(pending,target);
    const directory=await open(root,constants.O_RDONLY|constants.O_DIRECTORY);try{await directory.sync();}finally{await directory.close();}
   }catch(error){if(created)await rm(pending,{recursive:true,force:true});throw error;}
  },
  async read(id,variant,metadata) {
   if(!Object.hasOwn(variants,variant))throw new Error('Invalid media variant');
   await readyMediaRoot(root);const directory=assetPath(id),stat=await lstat(directory);
   if(!stat.isDirectory()||stat.isSymbolicLink())throw new Error('Invalid media directory');
   const f=await open(join(directory,variants[variant][0]),constants.O_RDONLY|constants.O_NOFOLLOW);
   try{
    const s=await f.stat();
    if(!s.isFile()||s.size!==metadata.byte_length||s.size>MAX_PHOTO_BYTES)throw new Error('Media unavailable');
    const data=await f.readFile();if(hash(data)!==metadata.sha256)throw new Error('Media unavailable');return data;
   }finally{await f.close();}
  },
  async removeUncommitted(id){await rm(assetPath(id),{recursive:true,force:true});}
 };
}
