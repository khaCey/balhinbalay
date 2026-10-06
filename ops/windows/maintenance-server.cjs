// Temporary maintenance response while the ordinary Site is stopped.
const http = require('node:http');
function createMaintenanceServer() {
  return http.createServer((req,res)=>{
    res.writeHead(503,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store','Retry-After':'120','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'"});
    res.end(req.method==='HEAD'?'':'BalhinBalay is undergoing scheduled maintenance. Please try again later.\n');
  });
}
module.exports={createMaintenanceServer};
if(require.main===module){
  const port=Number(process.env.BALHINBALAY_MAINTENANCE_PORT||8787);
  if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Invalid maintenance port');
  const server=createMaintenanceServer();
  server.on('error',()=>{process.stderr.write('Maintenance listener failed; verify the ordinary Site is stopped.\n');process.exitCode=1;});
  server.listen(port,'127.0.0.1',()=>process.stdout.write('Loopback maintenance listener ready.\n'));
  for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close());
}
