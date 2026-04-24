export default function Home() {
  return (
    <main className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <div className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
          zdfi.me
        </div>

        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-6xl">
            Get paid globally.
            <br />
            <span className="text-primary">From one smart link.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-gray-500">
            ZendFi helps people get paid worldwide with a single link. It can detect where the payer is, then show the right local payment details for that country.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Your main link</div>
            <div className="mt-2 text-sm text-gray-700">zdfi.me/username</div>
            <p className="mt-2 text-sm text-gray-500">Use this when you want a simple pay-me-any-amount page.</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">A fixed request</div>
            <div className="mt-2 text-sm text-gray-700">zdfi.me/username/request_id</div>
            <p className="mt-2 text-sm text-gray-500">Use this when the amount is already set and you want the payer to see the right local payment details.</p>
          </div>
        </div>

        <div className="max-w-2xl rounded-xl border border-gray-200 p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Example</div>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            A merchant creates one link in Nigeria. A payer in the US sees US payment details, a payer in Mexico sees Mexican payment details, and a payer in the UK sees faster payment details, all from the same link.
          </p>
        </div>

        <a
          href="https://dashboard.zendfi.tech/setup"
          className="w-fit rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:brightness-110"
        >
          Sounds cool, right? Get your own link to get paid globally today
        </a>
      </div>
    </main>
  );
}
