import { z } from "zod";

export const addTodoSchema = z.object({
	content: z.string().min(1).max(100),
});
