import { expect, it } from "@jest/globals";
import { get_chats } from "../../../src/utils/functions/messages";
import dotenv from 'dotenv';
dotenv.config();

it('testing get chats', () => {
	expect.assertions(1)
    return get_chats("f697bcc5-5e8e-48c9-8078-ff0b3d49cc81").then((chats) => {
        console.log(chats);
		expect(chats).toHaveLength(1);
    });
});
