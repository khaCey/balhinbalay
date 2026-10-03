const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Keep a transient key for the same text so transport retries cannot double-send.
// This helper is used only by the real public UUID detail, never sample cards.
export function contactRequest(listingId,text,previous) {
 if(!UUID.test(String(listingId||'')))throw new Error('Open a real listing to contact its Lister.');
 if(typeof text!=='string'||!text.trim())throw new Error('Write a message first.');
 if(previous?.listing_id===listingId&&previous.first_message===text)return previous;
 return {listing_id:listingId,first_message:text,client_request_id:crypto.randomUUID()};
}

export async function sendContact(request,api,navigate) {
 const result=await api('conversations',{method:'POST',body:request});
 if(!UUID.test(String(result.conversation?.id||'')))throw new Error('The conversation could not be opened. Try again.');
 navigate('/chat/'+result.conversation.id);
}
