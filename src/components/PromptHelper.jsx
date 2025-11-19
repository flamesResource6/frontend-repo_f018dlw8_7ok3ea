import React, { useState } from 'react'
import { Sparkles } from 'lucide-react'

export default function PromptHelper(){
  const [text, setText] = useState('')

  const prompt = `You are an expert web developer. Build a complete, responsive website with HTML, CSS, and JavaScript based on the following description. Include semantic HTML, accessible components, and modern styling. Add interactive UI with vanilla JS. Deploy-ready single index.html with inline <style> and external script if needed.

Project Brief:\n${text}\n
Requirements:\n- Landing hero with clear headline\n- Feature grid\n- File upload section (if applicable)\n- Gallery or content section\n- Contact/footer\n- Mobile-first, responsive\n- Clean, modern design\n- Document your JS functions\nOutput: Provide final index.html, styles, and scripts in code blocks ready to copy-paste.`

  const copy = async () => {
    await navigator.clipboard.writeText(prompt)
    alert('Prompt copied. Paste it into any AI tool to generate a full static site!')
  }

  return (
    <section id="how" className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-white text-xl font-semibold mb-2">Need a ready-to-use AI prompt to generate a full HTML/CSS/JS website?</h3>
        <p className="text-white/70 mb-4">Describe the kind of site you want (blog, ecommerce, portfolio, photo editor, etc.). We’ll prepare a polished prompt for any AI tool.</p>
        <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Describe your website idea here..." className="w-full h-32 rounded-lg bg-black/30 border border-white/10 p-3 text-white" />
        <button onClick={copy} className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-fuchsia-500 hover:bg-fuchsia-600 text-white">
          <Sparkles className="w-4 h-4"/> Copy AI Website Prompt
        </button>
        <p className="text-xs text-white/50 mt-2">The prompt includes structure, responsiveness, and interactivity requirements for best results.</p>
      </div>
    </section>
  )
}
