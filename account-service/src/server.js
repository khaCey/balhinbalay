import {Pool} from 'pg';
import {createAccountApp} from './app.js';
import {mountLocalAdmin} from './admin.js';
import {mountSiteAdmin} from './site-admin.js';
import {createMailer} from './email.js';
import {readConfig} from './config.js';
import {mountMarketplace} from './marketplace.js';

const config=readConfig();
const pool=new Pool({connectionString:process.env.DATABASE_URL,max:10,connectionTimeoutMillis:5000});
const mailer=createMailer();
try{
  const result=await pool.query(`SELECT count(*)::int AS count FROM schema_migrations
    WHERE name IN ('001_accounts.sql','002_session_purpose.sql')`);
  if(result.rows[0]?.count!==2)throw new Error('Run npm run migrate before starting');
  if(config.marketplaceEnabled){
    const marketplace=await pool.query("SELECT count(*)::int AS count FROM schema_migrations WHERE name IN ('003_marketplace_identity.sql','004_property_listing_foundation.sql')");
    if(marketplace.rows[0]?.count!==2)throw new Error('Marketplace is enabled but its reviewed migrations are absent');
  }
  if(config.messagingEnabled){
    const messaging=await pool.query("SELECT 1 FROM schema_migrations WHERE name='005_marketplace_messaging.sql'");
    if(!messaging.rowCount)throw new Error('Messaging is enabled but migration005 is absent');
  }
  const app=createAccountApp({pool,mailer,config});
  if(config.marketplaceEnabled)mountMarketplace(app,{pool,config});
  // The public Site admin API is mounted first and owns /api/admin entirely.
  // The loopback admin remains a separate break-glass tool on /admin and /admin/api.
  mountSiteAdmin(app,{pool,config});
  mountLocalAdmin(app,{pool,config});
  const server=app.listen(Number(process.env.PORT||5000),process.env.HOST||'127.0.0.1',
    ()=>process.stdout.write('BalhinBalay account service listening.\n'));
  process.on('SIGTERM',()=>server.close(async()=>{mailer.close();await pool.end();}));
}catch(error){await pool.end();mailer.close();throw error;}
