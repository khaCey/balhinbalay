import {v7 as uuidv7} from 'uuid';

export async function transaction(pool, operation) {
  const client=await pool.connect();
  try {
    await client.query('BEGIN');
    try { const result=await operation(client); await client.query('COMMIT'); return result; }
    catch(error) { await client.query('ROLLBACK'); throw error; }
  } finally { client.release(); }
}

// Called inside the same transaction as account creation. Auth-only schemas
// remain supported; installing 003 adds the subject map, never a second login.
export async function ensureUserPrincipal(client,userId) {
  const schema=await client.query("SELECT to_regclass('public.principals') AS present");
  if(!schema.rows[0]?.present)return null;
  const result=await client.query(`INSERT INTO principals(id,kind,user_id) VALUES($1,'USER',$2)
    ON CONFLICT(user_id) DO UPDATE SET user_id=excluded.user_id RETURNING id`,[uuidv7(),userId]);
  return result.rows[0].id;
}

export async function createAccountWithPrincipal(pool,sql,params) {
  return transaction(pool,async client=>{
    const result=await client.query(sql,params);
    if(result.rowCount)await ensureUserPrincipal(client,result.rows[0].id);
    return result;
  });
}

export async function guardedDeleteAccount(pool,id) {
  try {
    return await transaction(pool,async client=>{
      const user=await client.query('SELECT id FROM users WHERE id=$1 FOR UPDATE',[id]);
      if(!user.rowCount)return {rowCount:0,rows:[]};
      const schema=await client.query("SELECT to_regclass('public.principals') AS present");
      // Incoming RESTRICT FKs are the guard, including history/audit attribution.
      // A disposable mapping with no independent references may be removed.
      if(schema.rows[0]?.present)await client.query("DELETE FROM principals WHERE kind='USER' AND user_id=$1",[id]);
      return client.query('DELETE FROM users WHERE id=$1 RETURNING id,email',[id]);
    });
  } catch(error) {
    if(error.code==='23503')return {history:true,rowCount:0,rows:[]};
    throw error;
  }
}
