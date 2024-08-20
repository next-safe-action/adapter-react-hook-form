"use server";

import { ac } from "@/lib/safe-action";
import { loginSchema } from "./login-validation";
import { returnValidationErrors } from "next-safe-action";

export const loginAction = ac
	.schema(loginSchema)
	.action(async ({ parsedInput }) => {
		if (
			parsedInput.username !== "admin" ||
			parsedInput.password !== "password"
		) {
			returnValidationErrors(loginSchema, {
				_errors: ["Invalid username or password"],
				username: {
					_errors: ["Invalid username"],
				},
				password: {
					_errors: ["Invalid password"],
				},
			});
		}

		return {
			successful: true,
			username: parsedInput.username,
		};
	});
