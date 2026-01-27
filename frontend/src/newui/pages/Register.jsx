import Navbar from "../components/Navbar";
import PageShell from "../components/PageShell";

export default function Register() {
  return (
    <PageShell>
      <Navbar />
      <main className="mx-auto max-w-md px-4 py-16">
        <h2 className="text-2xl font-semibold">Create account</h2>
        <form className="mt-6 space-y-4">
          <input className="input input-bordered bg-gray-800 w-full" placeholder="Name" />
          <input className="input input-bordered bg-gray-800 w-full" placeholder="Email" />
          <input className="input input-bordered bg-gray-800 w-full" placeholder="Password" type="password" />
          <button className="btn btn-primary w-full">Create account</button>
        </form>
      </main>
    </PageShell>
  );
}
