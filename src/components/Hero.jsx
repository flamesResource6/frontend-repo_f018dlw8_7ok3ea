import React from 'react'
import Spline from '@splinetool/react-spline'

export default function Hero() {
  return (
    <section className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/xzUirwcZB9SOxUWt/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 via-slate-900/40 to-slate-900 pointer-events-none" />
      <div className="relative z-10 max-w-6xl mx-auto h-full px-6 flex items-center">
        <div className="backdrop-blur-sm bg-slate-900/30 rounded-2xl p-6 md:p-8 border border-white/10">
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Creative Photo Studio</h1>
          <p className="mt-3 md:mt-4 text-slate-200 max-w-2xl">Upload your photos, apply gorgeous filters, crop, resize, color-correct, and export in multiple formats. Drag-and-drop, batch process, and share in a click.</p>
          <div className="mt-5 flex gap-3">
            <a href="#editor" className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition">Start Editing</a>
            <a href="#how" className="inline-flex items-center px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition">Learn more</a>
          </div>
        </div>
      </div>
    </section>
  )
}
