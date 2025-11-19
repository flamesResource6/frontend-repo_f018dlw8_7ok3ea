import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Download, Crop, SlidersHorizontal, RotateCw, ImagePlus, Layers, Share2 } from 'lucide-react'

// A lightweight canvas-based photo editor with live preview
export default function Editor() {
  const fileInputRef = useRef(null)
  const canvasRef = useRef(null)
  const [images, setImages] = useState([]) // {id, img, name}
  const [activeIndex, setActiveIndex] = useState(0)
  const [settings, setSettings] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
    blur: 0,
    grayscale: 0,
    sepia: 0,
    invert: 0,
    exposure: 0,
    rotate: 0,
    scale: 1,
    crop: { x: 0, y: 0, w: 1, h: 1 }, // relative crop
  })

  // Presets
  const presets = [
    { name: 'Original', values: { brightness: 100, contrast: 100, saturation: 100, hue: 0, blur: 0, grayscale: 0, sepia: 0, invert: 0, exposure: 0 } },
    { name: 'Vivid Pop', values: { brightness: 110, contrast: 115, saturation: 135, hue: 0, blur: 0, grayscale: 0, sepia: 0, invert: 0, exposure: 5 } },
    { name: 'Film Warm', values: { brightness: 105, contrast: 95, saturation: 110, hue: 10, blur: 0, grayscale: 0, sepia: 18, invert: 0, exposure: 4 } },
    { name: 'Mono', values: { brightness: 100, contrast: 120, saturation: 0, hue: 0, blur: 0, grayscale: 100, sepia: 0, invert: 0, exposure: 0 } },
    { name: 'Noir', values: { brightness: 95, contrast: 140, saturation: 0, hue: 0, blur: 1, grayscale: 100, sepia: 0, invert: 0, exposure: -5 } },
  ]

  // Draw current image to canvas with settings
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || images.length === 0) return

    const { img } = images[activeIndex] || {}
    if (!img?.complete) return

    const W = img.naturalWidth
    const H = img.naturalHeight

    // apply crop
    const { x, y, w, h } = settings.crop
    const sx = x * W
    const sy = y * H
    const sw = Math.max(1, w * W)
    const sh = Math.max(1, h * H)

    // target size after scale
    const targetW = sw * settings.scale
    const targetH = sh * settings.scale

    // set canvas size to fit target while limiting max size for performance
    const maxCanvas = 1600
    const ratio = Math.min(maxCanvas / targetW, maxCanvas / targetH, 1)
    const cw = Math.round(targetW * ratio)
    const ch = Math.round(targetH * ratio)

    canvas.width = cw
    canvas.height = ch

    // apply filters
    const exposureFactor = settings.exposure / 100
    const brightnessFactor = settings.brightness / 100 + exposureFactor
    const filter = [
      `brightness(${brightnessFactor})`,
      `contrast(${settings.contrast}%)`,
      `saturate(${settings.saturation}%)`,
      `hue-rotate(${settings.hue}deg)`,
      settings.blur ? `blur(${settings.blur}px)` : '',
      settings.grayscale ? `grayscale(${settings.grayscale}%)` : '',
      settings.sepia ? `sepia(${settings.sepia}%)` : '',
      settings.invert ? `invert(${settings.invert}%)` : '',
    ].filter(Boolean).join(' ')

    ctx.filter = filter

    // rotation
    ctx.save()
    ctx.translate(cw / 2, ch / 2)
    ctx.rotate((settings.rotate * Math.PI) / 180)

    const drawW = cw
    const drawH = ch
    ctx.drawImage(
      img,
      sx,
      sy,
      sw,
      sh,
      -drawW / 2,
      -drawH / 2,
      drawW,
      drawH
    )

    ctx.restore()
  }, [images, activeIndex, settings])

  const onFiles = async (files) => {
    const arr = Array.from(files)
    const toLoad = await Promise.all(arr.map(f => new Promise(resolve => {
      const url = URL.createObjectURL(f)
      const img = new Image()
      img.onload = () => resolve({ id: crypto.randomUUID(), img, name: f.name })
      img.src = url
    })))
    setImages(prev => [...prev, ...toLoad])
    if (images.length === 0 && toLoad.length > 0) setActiveIndex(0)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files?.length) onFiles(e.dataTransfer.files)
  }

  const handleDownload = (type = 'image/png') => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `edited-${Date.now()}.${type.includes('png') ? 'png' : type.includes('jpeg') ? 'jpg' : 'webp'}`
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
    }, type, 0.95)
  }

  const shareImage = async () => {
    const canvas = canvasRef.current
    if (!canvas || !navigator.share) {
      alert('Sharing is not supported in this browser. You can download instead.')
      return
    }
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9))
    const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' })
    try {
      await navigator.share({
        files: [file],
        title: 'Edited photo',
        text: 'Shared via Creative Photo Studio',
      })
    } catch (e) {
      // canceled
    }
  }

  const applyPreset = (values) => setSettings(s => ({ ...s, ...values }))

  const update = (key, value) => setSettings(s => ({ ...s, [key]: value }))

  // batch apply current settings to all images and trigger downloads
  const batchProcess = async () => {
    if (images.length === 0) return
    const original = { ...settings }
    for (let i = 0; i < images.length; i++) {
      setActiveIndex(i)
      await new Promise(r => setTimeout(r, 60)) // allow draw
      await new Promise(res => {
        const canvas = canvasRef.current
        canvas.toBlob((blob) => {
          const a = document.createElement('a')
          a.download = `${images[i].name.replace(/\.[^.]+$/, '')}-batch.jpg`
          a.href = URL.createObjectURL(blob)
          a.click()
          setTimeout(() => URL.revokeObjectURL(a.href), 1000)
          res()
        }, 'image/jpeg', 0.9)
      })
    }
    setSettings(original)
  }

  return (
    <section id="editor" className="relative py-12 px-4 sm:px-6 lg:px-8">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed border-white/20 rounded-2xl p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm"
      >
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left: image list and actions */}
          <div className="md:w-64 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">Images</h3>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-500 text-white hover:bg-blue-600"
              >
                <ImagePlus className="w-4 h-4" /> Add
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => onFiles(e.target.files)}
              />
            </div>
            <div className="space-y-2 max-h-[300px] overflow-auto pr-1">
              {images.map((it, idx) => (
                <button
                  key={it.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`w-full text-left px-3 py-2 rounded-lg border ${idx === activeIndex ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:bg-white/5'} text-white/90`}
                >
                  <div className="truncate">{it.name}</div>
                </button>
              ))}
              {images.length === 0 && (
                <div className="text-sm text-white/60">Drag and drop images here or click Add.</div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => handleDownload('image/png')} className="px-3 py-2 rounded-md bg-white/10 text-white hover:bg-white/20 inline-flex items-center gap-2"><Download className="w-4 h-4"/> PNG</button>
              <button onClick={() => handleDownload('image/jpeg')} className="px-3 py-2 rounded-md bg-white/10 text-white hover:bg-white/20 inline-flex items-center gap-2"><Download className="w-4 h-4"/> JPG</button>
              <button onClick={() => handleDownload('image/webp')} className="px-3 py-2 rounded-md bg-white/10 text-white hover:bg-white/20 inline-flex items-center gap-2"><Download className="w-4 h-4"/> WEBP</button>
              <button onClick={shareImage} className="px-3 py-2 rounded-md bg-white/10 text-white hover:bg-white/20 inline-flex items-center gap-2 col-span-2"><Share2 className="w-4 h-4"/> Share</button>
              <button onClick={batchProcess} className="px-3 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 inline-flex items-center gap-2 col-span-2"><Layers className="w-4 h-4"/> Batch process</button>
            </div>
          </div>

          {/* Right: canvas and controls */}
          <div className="flex-1 grid md:grid-cols-5 gap-6">
            <div className="md:col-span-3">
              <div className="aspect-video w-full bg-black/40 rounded-xl overflow-hidden flex items-center justify-center">
                <canvas ref={canvasRef} className="max-h-[70vh] w-full h-full object-contain" />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {presets.map(p => (
                  <button key={p.name} onClick={() => applyPreset(p.values)} className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm">{p.name}</button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2 space-y-4">
              <Panel title="Adjust" icon={<SlidersHorizontal className="w-4 h-4" /> }>
                <Slider label="Brightness" min={0} max={200} value={settings.brightness} onChange={v => update('brightness', v)} />
                <Slider label="Contrast" min={0} max={200} value={settings.contrast} onChange={v => update('contrast', v)} />
                <Slider label="Saturation" min={0} max={300} value={settings.saturation} onChange={v => update('saturation', v)} />
                <Slider label="Hue" min={-180} max={180} value={settings.hue} onChange={v => update('hue', v)} />
                <Slider label="Exposure" min={-50} max={50} value={settings.exposure} onChange={v => update('exposure', v)} />
                <Slider label="Blur" min={0} max={10} value={settings.blur} onChange={v => update('blur', v)} />
                <Slider label="Grayscale" min={0} max={100} value={settings.grayscale} onChange={v => update('grayscale', v)} />
                <Slider label="Sepia" min={0} max={100} value={settings.sepia} onChange={v => update('sepia', v)} />
                <Slider label="Invert" min={0} max={100} value={settings.invert} onChange={v => update('invert', v)} />
              </Panel>
              <Panel title="Transform" icon={<Crop className="w-4 h-4" /> }>
                <Slider label="Rotate" min={-180} max={180} value={settings.rotate} onChange={v => update('rotate', v)} />
                <Slider label="Scale" min={0.1} max={3} step={0.01} value={settings.scale} onChange={v => update('scale', v)} />
                <Cropper settings={settings} setSettings={setSettings} />
              </Panel>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Panel({ title, icon, children }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-center gap-2 text-white mb-3">
        {icon}
        <h4 className="font-semibold">{title}</h4>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Slider({ label, min, max, step=1, value, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between text-white/80 mb-1">
        <span className="text-sm">{label}</span>
        <span className="text-xs tabular-nums">{typeof value === 'number' ? value.toFixed(step<1?2:0) : value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full accent-blue-500" />
    </div>
  )
}

function Cropper({ settings, setSettings }) {
  const [temp, setTemp] = useState(settings.crop)
  useEffect(() => setTemp(settings.crop), [settings.crop])
  const apply = () => setSettings(s => ({ ...s, crop: temp }))

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Number label="X" value={temp.x} onChange={(v) => setTemp(t=>({ ...t, x: clamp01(v) }))} />
        <Number label="Y" value={temp.y} onChange={(v) => setTemp(t=>({ ...t, y: clamp01(v) }))} />
      </div>
      <div className="flex gap-2">
        <Number label="W" value={temp.w} onChange={(v) => setTemp(t=>({ ...t, w: clamp01(v) }))} />
        <Number label="H" value={temp.h} onChange={(v) => setTemp(t=>({ ...t, h: clamp01(v) }))} />
      </div>
      <div className="flex gap-2">
        <button onClick={()=>setTemp({x:0, y:0, w:1, h:1})} className="px-3 py-1.5 rounded-md bg-white/10 text-white hover:bg-white/20">Reset</button>
        <button onClick={apply} className="px-3 py-1.5 rounded-md bg-blue-500 text-white hover:bg-blue-600">Apply</button>
      </div>
      <p className="text-xs text-white/50">Tip: values are relative (0-1). Use them to quickly crop portrait or square.</p>
    </div>
  )
}

function Number({ label, value, onChange }) {
  return (
    <label className="flex items-center gap-2 text-white/80 text-sm bg-white/5 rounded-md px-2 py-1 flex-1">
      <span className="w-4">{label}</span>
      <input type="number" min={0} max={1} step={0.01} value={value} onChange={(e)=> onChange(parseFloat(e.target.value))} className="bg-transparent outline-none flex-1 text-right" />
    </label>
  )
}

function clamp01(v){
  if (Number.isNaN(v)) return 0
  return Math.max(0, Math.min(1, v))
}
