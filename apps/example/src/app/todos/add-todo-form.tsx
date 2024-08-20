"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  useHookFormOptimisticAction
} from "@next-safe-action/adapter-react-hook-form/hooks";
import { addTodoAction } from "./add-todo-action";
import { addTodoSchema } from "./add-todo-validation";

type Props = {
	todos: string[];
};

export function AddTodoForm({ todos }: Props) {
	const { form, action, handleSubmitWithAction, resetFormAndAction } =
		useHookFormOptimisticAction(addTodoAction, zodResolver(addTodoSchema), {
			actionProps: {
				currentState: { todos },
				updateFn: (state, input) => {
					return {
						todos: [...state.todos, input.content],
					};
				},
			},
			formProps: {
				mode: "onChange",
			},
		});

	return (
		<div className="flex flex-col space-y-6">
			<form
				onSubmit={handleSubmitWithAction}
				className="flex flex-col space-y-4">
				<input
					defaultValue=""
					placeholder="Todo content"
					className="border px-2 py-1 rounded-lg"
					{...form.register("content")}
				/>
				{form.formState.errors.content ? (
					<p>{form.formState.errors.content.message}</p>
				) : null}

				<button
					type="submit"
					className="bg-black text-white rounded-lg px-3 py-2">
					Add todo
				</button>
				<button
					onClick={resetFormAndAction}
					type="button"
					className="bg-black text-white rounded-lg px-3 py-2">
					Reset form and action state
				</button>
				{form.formState.errors.root ? (
					<p>{form.formState.errors.root.message}</p>
				) : null}
			</form>
			<div>
				<pre>
					Optimistic state todos:{" "}
					{JSON.stringify(action.optimisticState.todos, null, 1)}
				</pre>
			</div>
		</div>
	);
}
