import {Pool} from 'pg';
import {createAccountApp} from './app.js';
import {mountLocalAdmin} from './admin.js';
import {createMailer} from './email.js';
import {readConfig} from './config.js';

const config=readConfig();
const pool=new Pool({connectionString:process.env.DATABASE_URL,max:10,connectionTimeoutMillis:5000});
const mailer=createMailer();
try{
  const result=await pool.query('SELECT 1 FROM schema_migrations WHERE name=$1',['001_accounts.sql']);
  if(!result.rowCount)throw new Error('Run npm run migrate before starting');
  const app=createAccountApp({pool,mailer,config});
  mountLocalAdmin(app,{pool});
  const server=app.listen(Number(process.env.PORT||5000),process.env.HOST||'127.0.0.1',
    ()=>process.stdout.write('BalhinBalay account service listening.\n'));
  process.on('SIGTERM',()=>server.close(async()=>{mailer.close();await pool.end();}));
}catch(error){await pool.end();mailer.close();throw error;}
