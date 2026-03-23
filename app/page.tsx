import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-indigo-600 focus:text-white focus:px-3 focus:py-2 focus:rounded">
        Skip to content
      </a>
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-zinc-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center">
                <span aria-hidden className="text-white font-semibold">F</span>
              </div>
              <span className="text-lg font-semibold">Fieldform</span>
            </div>
            <nav aria-label="Primary" className="hidden md:flex items-center gap-8">
              <Link href="#" className="text-sm font-medium text-zinc-700 hover:text-zinc-900">
                Product
              </Link>
              <Link href="#" className="text-sm font-medium text-zinc-700 hover:text-zinc-900">
                Templates
              </Link>
              <Link href="#" className="text-sm font-medium text-zinc-700 hover:text-zinc-900">
                Pricing
              </Link>
              <Link href="#" className="text-sm font-medium text-zinc-700 hover:text-zinc-900">
                Examples
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-zinc-700 hover:text-zinc-900">
                Login
              </Link>
              <Link href="/register" className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main id="main">
        <section className="bg-zinc-50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                <span>New: Form Automations</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight">
                Build powerful forms in{" "}
                <span className="text-emerald-600">minutes</span>, not{" "}
                <span className="text-emerald-600">hours</span>.
              </h1>
              <p className="text-lg text-zinc-600">
                The intuitive form builder for modern teams. Collect data, automate workflows, integrate with the tools you already use.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link href="/register" className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2">
                  Register as Admin
                </Link>
                <Link href="/login" className="inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2">
                  Login
                </Link>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-600">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">★</span>
                <span>Loved by 12,000+ teams</span>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl bg-orange-200 p-8 shadow-xl">
                <div className="relative mx-auto max-w-sm rounded-xl bg-white shadow-2xl ring-1 ring-black/5">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="h-3 w-24 rounded bg-zinc-200" />
                    <div className="h-3 w-10 rounded bg-zinc-200" />
                  </div>
                  <div className="space-y-4 px-4 pb-6">
                    <div className="h-10 rounded bg-zinc-100" />
                    <div className="h-10 rounded bg-zinc-100" />
                    <div className="h-10 rounded bg-zinc-100" />
                    <div className="h-12 rounded bg-emerald-600" />
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4">
                <div className="rounded-full bg-white shadow ring-1 ring-black/10 px-3 py-2 text-sm font-medium text-emerald-700">
                  New Automation
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-white border-t border-zinc-200">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-wrap items-center justify-center gap-8">
              <span className="text-zinc-500">KLARNA</span>
              <span className="text-zinc-500">COINBASE</span>
              <span className="text-zinc-500">INSTACART</span>
              <span className="text-zinc-500">STRIPE</span>
              <span className="text-zinc-500">SHOPIFY</span>
            </div>
          </div>
        </section>
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-2xl sm:text-3xl font-semibold text-center">Everything you need to collect better data</h2>
            <p className="mt-3 text-center text-zinc-600">Powerful features with simple workflows.</p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-zinc-200 p-6 shadow-sm">
                <div className="h-10 w-10 rounded-lg bg-indigo-600 mb-4" />
                <h3 className="text-lg font-semibold">Drag & Drop Builder</h3>
                <p className="mt-2 text-zinc-600">Compose forms quickly with accessible inputs and validations.</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 p-6 shadow-sm">
                <div className="h-10 w-10 rounded-lg bg-emerald-600 mb-4" />
                <h3 className="text-lg font-semibold">Real-time Analytics</h3>
                <p className="mt-2 text-zinc-600">Track performance and conversion with live dashboards.</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 p-6 shadow-sm">
                <div className="h-10 w-10 rounded-lg bg-pink-600 mb-4" />
                <h3 className="text-lg font-semibold">Seamless Integrations</h3>
                <p className="mt-2 text-zinc-600">Connect with your stack using secure APIs and webhooks.</p>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-[#0f2b35] text-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid gap-8 sm:grid-cols-3 text-center">
              <div>
                <div className="text-4xl font-semibold">12k+</div>
                <div className="mt-2 text-zinc-200">Active Teams</div>
              </div>
              <div>
                <div className="text-4xl font-semibold">5M+</div>
                <div className="mt-2 text-zinc-200">Forms Submitted</div>
              </div>
              <div>
                <div className="text-4xl font-semibold">99.9%</div>
                <div className="mt-2 text-zinc-200">Uptime SLA</div>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-2xl sm:text-3xl font-semibold text-center">Simple, transparent pricing</h2>
            <p className="mt-3 text-center text-zinc-600">Choose the plan that’s right for your growth.</p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-zinc-200 p-6 shadow-sm">
                <div className="text-sm font-medium text-zinc-600">Starter</div>
                <div className="mt-3 text-3xl font-semibold">$0</div>
                <ul className="mt-4 space-y-2 text-zinc-600">
                  <li>Basic features</li>
                  <li>Unlimited forms</li>
                  <li>Core templates</li>
                </ul>
                <Link href="/register" className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                  Get Started
                </Link>
              </div>
              <div className="rounded-2xl border border-zinc-200 p-6 shadow-lg ring-2 ring-emerald-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-zinc-600">Professional</div>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">Popular</span>
                </div>
                <div className="mt-3 text-3xl font-semibold">$49</div>
                <ul className="mt-4 space-y-2 text-zinc-600">
                  <li>Advanced automations</li>
                  <li>Analytics suite</li>
                  <li>Priority support</li>
                </ul>
                <Link href="/register" className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                  Start Free Trial
                </Link>
              </div>
              <div className="rounded-2xl border border-zinc-200 p-6 shadow-sm">
                <div className="text-sm font-medium text-zinc-600">Enterprise</div>
                <div className="mt-3 text-3xl font-semibold">Custom</div>
                <ul className="mt-4 space-y-2 text-zinc-600">
                  <li>Customization and SSO</li>
                  <li>Dedicated manager</li>
                  <li>Security reviews</li>
                </ul>
                <Link href="/login" className="mt-6 inline-flex w-full items-center justify-center rounded-lg ring-1 ring-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50">
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-[#0f2b35] text-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-semibold">Ready to level up your data collection?</h2>
                <p className="mt-3 text-zinc-200">Join thousands of teams who trust Fieldform.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <Link href="/register" className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#0f2b35] hover:bg-zinc-100">
                  Get Started
                </Link>
                <Link href="/login" className="inline-flex items-center justify-center rounded-lg ring-1 ring-white/50 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">
                  Login
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-white border-t border-zinc-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-semibold">F</div>
                <span className="font-semibold">Fieldform</span>
              </div>
              <p className="text-sm text-zinc-600">Build forms faster with modern tooling.</p>
            </div>
            <div>
              <div className="text-sm font-semibold">Product</div>
              <ul className="mt-3 space-y-2 text-sm text-zinc-600">
                <li><Link href="#" className="hover:text-zinc-900">Features</Link></li>
                <li><Link href="#" className="hover:text-zinc-900">Templates</Link></li>
                <li><Link href="#" className="hover:text-zinc-900">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-sm font-semibold">Company</div>
              <ul className="mt-3 space-y-2 text-sm text-zinc-600">
                <li><Link href="#" className="hover:text-zinc-900">About</Link></li>
                <li><Link href="#" className="hover:text-zinc-900">Careers</Link></li>
                <li><Link href="#" className="hover:text-zinc-900">Privacy</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-sm font-semibold">Support</div>
              <ul className="mt-3 space-y-2 text-sm text-zinc-600">
                <li><Link href="#" className="hover:text-zinc-900">Docs</Link></li>
                <li><Link href="#" className="hover:text-zinc-900">Status</Link></li>
                <li><Link href="#" className="hover:text-zinc-900">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-zinc-600">© {new Date().getFullYear()} Fieldform. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <Link href="#" aria-label="Twitter" className="h-9 w-9 rounded-full ring-1 ring-zinc-200 flex items-center justify-center hover:bg-zinc-50">
                <Image src="/globe.svg" alt="" width={16} height={16} />
              </Link>
              <Link href="#" aria-label="GitHub" className="h-9 w-9 rounded-full ring-1 ring-zinc-200 flex items-center justify-center hover:bg-zinc-50">
                <Image src="/file.svg" alt="" width={16} height={16} />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
