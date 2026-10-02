import {marketplaceForward} from '../../../../lib/marketplace-proxy.js';
export const dynamic='force-dynamic';
export const GET=(req,context)=>marketplaceForward(req,context,'GET');
export const POST=(req,context)=>marketplaceForward(req,context,'POST');
export const PATCH=(req,context)=>marketplaceForward(req,context,'PATCH');
