"use server";

import { ac } from "@/lib/safe-action";
import { returnValidationErrors } from "next-safe-action";
import { unauthorized } from "next/navigation";
import { loginSchema } from "./login-validation";

export const loginAction = ac
	.inputSchema(loginSchema)
	.action(async ({ parsedInput }) => {
		if (
			parsedInput.username !== "admin" ||
			parsedInput.password !== "password"
		) {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			unauthorized();
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
