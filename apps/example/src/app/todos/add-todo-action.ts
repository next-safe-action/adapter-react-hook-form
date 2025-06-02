"use server";

import { ac } from "@/lib/safe-action";
import { returnValidationErrors } from "next-safe-action";
import { revalidatePath } from "next/cache";
import { addTodoSchema } from "./add-todo-validation";

const todos = ["first todo"];

export async function getTodos() {
	return todos;
}

async function addTodo(newTodoContent: string) {
	todos.push(newTodoContent);
	return todos;
}

export const addTodoAction = ac
	.inputSchema(addTodoSchema)
	.action(async ({ parsedInput }) => {
		// Simulate a slow server
		await new Promise((resolve) => setTimeout(resolve, 1000));

		if (parsedInput.content === "bad word") {
			returnValidationErrors(addTodoSchema, {
				content: {
					_errors: ["The bad word is not allowed, please remove it"],
				},
			});
		}

		await addTodo(parsedInput.content);

		revalidatePath("/todos");

		return {
			successful: true,
			content: parsedInput.content,
		};
	});
