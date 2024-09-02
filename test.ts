import { get_chats } from "./src/utils/functions/messages";


(async ()=>{
	const chats = await get_chats("f697bcc5-5e8e-48c9-8078-ff0b3d49cc81");
	console.log(chats);
})();
