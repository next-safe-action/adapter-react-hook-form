import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
	return (
		<main className="flex min-h-screen flex-col items-center p-24">
			<div className="flex flex-col space-y-4 w-full max-w-80">
				<Link href="/" className="text-center hover:underline">
					&larr; Go back to home
				</Link>
				<h1 className="text-center font-semibold text-2xl">Login Form</h1>
				<LoginForm />
			</div>
		</main>
	);
}
