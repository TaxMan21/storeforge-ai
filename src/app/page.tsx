import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">StoreForge AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Sign in</Link>
            <Link href="/signup" className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
            AI-Powered Store Builder
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight">
            Build Your Dream Ecommerce Store
            <span className="text-indigo-600"> with AI</span>
          </h1>
          <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto">
            StoreForge AI creates complete dropshipping stores in minutes — from product research to branding, SEO, ads, and launch readiness.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
              Start Building for Free
            </Link>
            <Link href="#features" className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-8 py-4 text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Everything You Need to Launch</h2>
            <p className="mt-3 text-lg text-gray-500">One AI platform handles the entire store creation process.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "AI Questionnaire", desc: "Answer simple questions about your niche, audience, and goals. AI builds everything based on your answers.", icon: "🎯" },
              { title: "Smart Blueprint", desc: "Get a complete store blueprint with branding, colors, fonts, and layout before anything is built.", icon: "📐" },
              { title: "Product Research", desc: "AI finds trending, high-margin products with supplier links, ad hooks, and opportunity scores.", icon: "🔍" },
              { title: "Content Generation", desc: "AI creates product descriptions, SEO content, email flows, ad copy, and social media scripts.", icon: "✍️" },
              { title: "Integration Hub", desc: "Connect payments, analytics, marketing tools, fulfillment, and support with one click.", icon: "🔗" },
              { title: "Optimization Dashboard", desc: "Track store readiness, SEO, conversion, trust, and marketing scores with actionable tips.", icon: "📊" },
            ].map((f, i) => (
              <div key={i} className="rounded-xl bg-white p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Build Your Store?</h2>
          <p className="text-lg text-gray-500 mb-8">Start free. No credit card required. Upgrade when you're ready to scale.</p>
          <Link href="/signup" className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
            Get Started Free
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-gray-500">
          <p>StoreForge AI. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-900">Privacy</a>
            <a href="#" className="hover:text-gray-900">Terms</a>
            <a href="#" className="hover:text-gray-900">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
