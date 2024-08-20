import Link from "next/link";
import { getTodos } from "./add-todo-action";
import { AddTodoForm } from "./add-todo-form";

export default async function TodosPage() {
	const todos = await getTodos();

	return (
		<main className="flex min-h-screen flex-col items-center p-24">
			<div className="flex flex-col space-y-4 w-full max-w-80">
				<Link href="/" className="text-center hover:underline">
					&larr; Go back to home
				</Link>
				<h1 className="text-center font-semibold text-2xl">Todos Form</h1>
				<AddTodoForm todos={todos} />
				<pre>Current todos from server: {JSON.stringify(todos, null, 1)}</pre>
			</div>
		</main>
	);
}
