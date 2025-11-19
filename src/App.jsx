import React from 'react'
import Hero from './components/Hero'
import Editor from './components/Editor'
import PromptHelper from './components/PromptHelper'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <Hero />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="py-10">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Editor />
            </div>
            <div className="md:col-span-1">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-6">
                <h3 className="text-white text-xl font-semibold">How it works</h3>
                <ol className="list-decimal list-inside mt-3 text-white/80 space-y-1">
                  <li>Drop multiple images or click Add.</li>
                  <li>Use Adjust and Transform panels to tweak.</li>
                  <li>Pick a preset for instant looks.</li>
                  <li>Export PNG/JPG/WEBP, or share directly.</li>
                  <li>Run batch processing to export all.</li>
                </ol>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PromptHelper />

      <footer className="py-10 text-center text-white/60">
        Built for creators. No sign-up required.
      </footer>
    </div>
  )
}

export default App
