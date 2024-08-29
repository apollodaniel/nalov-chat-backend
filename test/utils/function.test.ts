import {describe, expect, test} from "@jest/globals";
import {check_user_credential_valid, create_message, get_messages, login_user, register_user} from "../../src/utils/functions";
import { User } from "../../src/types/user";
import { Auth } from "../../src/types/auth";
import { Message } from "../../src/types/message";
import dotenv from 'dotenv';

dotenv.config();

describe('create user and check messages', ()=> {
	test('test messages', ()=>{

		new Promise(async (r, rj)=>{
			const user = new User({name: "apollo", username: "apollodaniel", password: "apolloTwich123$"});
			const receiver_user = new User({name: "apollo", username: "apollodaniels", password: "apolloTwich12$"});
			await register_user(user);
			await register_user(receiver_user);

			const user_id = await check_user_credential_valid({username: user.username, password: user.password});
			const auth = new Auth({user_id: user_id});
			await login_user(auth);

			const receiver_id = await check_user_credential_valid({username: receiver_user.username, password: receiver_user.password});
			let messages = await get_messages(user_id, receiver_id);
			const initial_length = messages.length;
			const message = new Message({content: "Primeira mensagem tropa", date: Date.now(), sender_id: user_id, receiver_id: receiver_id});
			await create_message(message);

			messages = await get_messages(user_id, receiver_id);
			return [initial_length, messages.length];
		}).then(message_lengths=>{
			expect(message_lengths[0]).toBe(0);
			expect(message_lengths[1]).toBe(1);
		});
	}, 1000000)
});
