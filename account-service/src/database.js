import {Pool,types} from 'pg';

// A PostgreSQL DATE is a calendar value, not an instant. The default pg parser
// creates local-midnight Dates, which shift when immutable JSON is serialised.
// Scope the override to this pool; auth timestamps and other pg users retain
// their existing parsers. Binary formats continue using pg's default parser.
export function createAccountPool(options={}) {
  return new Pool({...options,types:{
    getTypeParser(oid,format) {
      if(oid===1082&&(!format||format==='text'))return value=>value;
      return types.getTypeParser(oid,format);
    },
  }});
}
