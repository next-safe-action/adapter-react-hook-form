import Link from "next/link";

export default function HomePage() {
	return (
		<main className="flex min-h-screen flex-col items-center p-24">
			<h1 className="text-center text-3xl font-semibold">Examples</h1>
			<div className="w-full flex flex-col items-center mt-4">
				<ul className="list-disc">
					<li>
						<Link href="/login" className="hover:underline">
							Login Form (<pre className="inline">useHookFormAction</pre>)
						</Link>
					</li>
					<li>
						<Link href="/todos" className="hover:underline">
							Todos Form (
							<pre className="inline">useHookFormOptimisticAction</pre>)
						</Link>
					</li>
				</ul>
			</div>
		</main>
	);
}
