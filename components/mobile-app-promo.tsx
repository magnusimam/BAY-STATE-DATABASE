'use client'

import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { QRCodeSVG } from 'qrcode.react'
import { X, Smartphone, Download, Sparkles } from 'lucide-react'

// Direct APK download URL (EAS preview build).
// To replace with a new build, grab the "Application Archive URL" from
// `npx eas-cli build:view <build-id>`.
const APK_URL =
  process.env.NEXT_PUBLIC_APK_URL ??
  'https://expo.dev/artifacts/eas/mwk61SJNnN79Fzp8UsELE.apk'

const STORAGE_KEY = 'humaid-app-promo-dismissed'
const SHOW_DELAY_MS = 1800

export function MobileAppPromo() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.localStorage.getItem(STORAGE_KEY) === '1') return
    const t = setTimeout(() => setOpen(true), SHOW_DELAY_MS)
    return () => clearTimeout(t)
  }, [])

  const dismiss = (persist: boolean) => {
    if (persist && typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, '1')
    }
    setOpen(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && dismiss(true)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />

        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#16161e] to-[#0a0a0f] p-0 shadow-[0_0_80px_-15px_rgba(244,185,66,0.35)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:slide-in-from-bottom-4"
        >
          {/* Amber glow accent */}
          <div
            aria-hidden
            className="absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[#f4b942] opacity-20 blur-3xl"
          />

          <Dialog.Close
            aria-label="Close"
            onClick={() => dismiss(true)}
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-zinc-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#f4b942]/50"
          >
            <X className="h-4 w-4" />
          </Dialog.Close>

          <div className="relative px-7 pb-7 pt-9">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#f4b942]/30 bg-[#f4b942]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#f4b942]">
                <Sparkles className="h-3 w-3" />
                New
              </div>
              <span className="text-[11px] text-zinc-500">Android Preview</span>
            </div>

            <Dialog.Title className="mt-4 text-[26px] font-bold leading-tight text-white">
              Take HUMAID
              <br />
              <span className="bg-gradient-to-r from-[#f4b942] to-[#ffd86b] bg-clip-text text-transparent">
                with you.
              </span>
            </Dialog.Title>

            <Dialog.Description className="mt-2 text-sm leading-relaxed text-zinc-400">
              Real-time humanitarian data for Borno, Adamawa &amp; Yobe — now on
              your phone. Built for the field.
            </Dialog.Description>

            {/* QR code card */}
            <div className="mt-6 flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
              <div className="shrink-0 rounded-xl bg-white p-2.5">
                <QRCodeSVG
                  value={APK_URL}
                  size={96}
                  bgColor="#ffffff"
                  fgColor="#0a0a0f"
                  level="M"
                />
              </div>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#f4b942]">
                  <Smartphone className="h-3.5 w-3.5" />
                  Scan to install
                </p>
                <p className="mt-1.5 text-[13px] leading-snug text-zinc-300">
                  Point your phone camera at the code to download the APK
                  directly.
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex flex-col gap-2.5">
              <a
                href={APK_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => dismiss(true)}
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#f4b942] to-[#ffd86b] px-5 py-3 text-sm font-semibold text-[#1a1205] shadow-[0_8px_30px_-6px_rgba(244,185,66,0.6)] transition hover:shadow-[0_12px_40px_-6px_rgba(244,185,66,0.8)] focus:outline-none focus:ring-2 focus:ring-[#f4b942]/50 focus:ring-offset-2 focus:ring-offset-[#0a0a0f]"
              >
                <Download className="h-4 w-4" />
                Download the Android App
              </a>
              <button
                type="button"
                onClick={() => dismiss(true)}
                className="inline-flex items-center justify-center rounded-xl bg-transparent px-5 py-2.5 text-sm font-medium text-zinc-400 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                Maybe later
              </button>
            </div>

            <p className="mt-4 text-center text-[11px] text-zinc-600">
              Requires Android 7.0+ · iOS version coming soon
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
