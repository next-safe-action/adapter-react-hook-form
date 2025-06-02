"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { loginAction } from "./login-action";
import { loginSchema } from "./login-validation";

export function LoginForm() {
	const { form, action, handleSubmitWithAction, resetFormAndAction } =
		useHookFormAction(loginAction, zodResolver(loginSchema), {
			formProps: {
				mode: "onChange",
			},
			actionProps: {
				onSuccess: (args) => {
					console.log("onSuccess called:", args);
					window.alert("Logged in successfully!");
					resetFormAndAction();
				},
				onNavigation: (args) => {
					console.log("onNavigation called:", args);
				},
				onSettled: (args) => {
					console.log("onSettled called:", args);
				},
			},
		});

	return (
		<form onSubmit={handleSubmitWithAction} className="flex flex-col space-y-4">
			<input
				defaultValue=""
				placeholder="Username"
				className="border px-2 py-1 rounded-lg"
				{...form.register("username")}
			/>
			{form.formState.errors.username ? (
				<p>{form.formState.errors.username.message}</p>
			) : null}

			<input
				defaultValue=""
				placeholder="Password"
				className="border px-2 py-1 rounded-lg"
				{...form.register("password")}
			/>
			{form.formState.errors.password ? (
				<p>{form.formState.errors.password.message}</p>
			) : null}

			<button
				type="submit"
				className="bg-black text-white rounded-lg px-3 py-2">
				Login
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
	);
}
