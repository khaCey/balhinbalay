// The historical release tool must continue rejecting new migrations. Exercise
// its original exact six-file source without weakening its production gate.
import {mkdtemp,readdir,copyFile,mkdir,symlink,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
export async function reviewedRelease() {
 const root=await mkdtemp(join(tmpdir(),'bb-historical-release-')),directory=join(root,'migrations'),scripts=join(root,'scripts');
 await mkdir(directory);await mkdir(scripts);
 for(const name of await readdir(new URL('../../migrations/',import.meta.url)))if(/^00[1-6]_/.test(name))await copyFile(new URL('../../migrations/'+name,import.meta.url),join(directory,name));
 const cli=join(scripts,'verify-marketplace-release.js');
 await copyFile(new URL('../../scripts/verify-marketplace-release.js',import.meta.url),cli);
 await writeFile(join(root,'package.json'),JSON.stringify({type:'module'}));
 await symlink(fileURLToPath(new URL('../../node_modules/',import.meta.url)),join(root,'node_modules'),'dir');
 const helpers=await import(pathToFileURL(cli).href);await helpers.verifyFiles();
 return {...helpers,directory,cli,cleanup:()=>rm(root,{recursive:true,force:true})};
}
