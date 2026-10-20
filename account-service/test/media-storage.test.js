import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {mkdtemp,readFile,writeFile,rm,symlink,stat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {v7 as uuidv7} from 'uuid';
import {processPhoto,mediaStorage,validMediaRoot,MAX_PHOTO_BYTES} from '../src/media-storage.js';
const source=()=>sharp({create:{width:80,height:40,channels:3,background:'#4488aa'}});
test('photos decode, orient and strip embedded metadata; gallery and sharing have separate crops',async()=>{
 const bytes=await source().withMetadata({orientation:6,exif:{IFD0:{Artist:'PRIVATE-EXIF'}}}).jpeg().toBuffer();
 const result=await processPhoto(bytes,'image/jpeg');
 assert.equal(result.gallery.width,40);assert.equal(result.gallery.height,80);
 assert.deepEqual([result.share.width,result.share.height],[1200,630]);
 for(const value of Object.values(result)){const m=await sharp(value.data).metadata();assert.equal(m.exif,undefined);assert.equal(m.icc,undefined);assert.equal(m.orientation,undefined);assert.equal(value.byte_length,value.data.length);assert.match(value.sha256,/^[a-f0-9]{64}$/);}
});
test('malformed, spoofed, oversized and excessive-dimension input fails before storage',async()=>{
 for(const [bytes,type] of [[Buffer.from('<svg/>'),'image/jpeg'],[await source().jpeg().toBuffer(),'image/png'],[Buffer.from('bad'),'image/svg+xml']])await assert.rejects(processPhoto(bytes,type),e=>e.status===415);
 await assert.rejects(processPhoto(Buffer.alloc(MAX_PHOTO_BYTES+1),'image/jpeg'),e=>e.status===413);
 const broken=Buffer.from([255,216,255,0,1]);await assert.rejects(processPhoto(broken,'image/jpeg'),e=>e.code==='INVALID_IMAGE');
 const large=await sharp({create:{width:7000,height:6000,channels:3,background:'white'}}).png().toBuffer();await assert.rejects(processPhoto(large,'image/png'),e=>e.code==='INVALID_IMAGE');
});
test('PNG transparency and WebP inputs become only approved safe raster variants',async()=>{
 for(const type of ['png','webp']){const result=await processPhoto(await source()[type]().toBuffer(),'image/'+type);assert.equal((await sharp(result.gallery.data).metadata()).format,'webp');assert.equal((await sharp(result.share.data).metadata()).format,'jpeg');}
});
test('private persistent storage reopens after restart and refuses tampering/collisions',async()=>{
 const root=await mkdtemp(join(tmpdir(),'bb-media-')),asset=uuidv7(),result=await processPhoto(await source().jpeg().toBuffer(),'image/jpeg');
 try{
  await mediaStorage(root).write(asset,result);
  assert.deepEqual(await mediaStorage(root).read(asset,'share',result.share),result.share.data);
  assert.equal((await stat(join(root,asset,'share.jpg'))).mode&0o777,0o600);
  await assert.rejects(mediaStorage(root).write(asset,result));
  assert.deepEqual(await readFile(join(root,asset,'share.jpg')),result.share.data);
  await writeFile(join(root,asset,'share.jpg'),Buffer.alloc(result.share.byte_length));await assert.rejects(mediaStorage(root).read(asset,'share',result.share));
 }finally{await rm(root,{recursive:true,force:true});}
});
test('storage rejects source/public roots, traversal and symlinked assets or variants',async()=>{
 for(const path of ['relative','/',new URL('../../public/',import.meta.url).pathname])assert.throws(()=>validMediaRoot(path));
 const root=await mkdtemp(join(tmpdir(),'bb-media-path-')),outside=await mkdtemp(join(tmpdir(),'bb-media-outside-')),asset=uuidv7(),s=mediaStorage(root);
 try{await symlink(outside,join(root,asset));await assert.rejects(s.read(asset,'share',{byte_length:1,sha256:'a'.repeat(64)}));await assert.rejects(s.read('../elsewhere','share',{}));await assert.rejects(s.read(asset,'constructor',{}));}
 finally{await rm(root,{recursive:true,force:true});await rm(outside,{recursive:true,force:true});}
});
