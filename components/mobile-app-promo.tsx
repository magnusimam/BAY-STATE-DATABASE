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
const PILL_SESSION_KEY = 'humaid-app-pill-dismissed'
const SHOW_DELAY_MS = 1800
const PILL_DELAY_MS = 400

export function MobileAppPromo() {
  const [open, setOpen] = useState(false)
  const [showPill, setShowPill] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const popupDismissed = window.localStorage.getItem(STORAGE_KEY) === '1'
    const pillDismissed = window.sessionStorage.getItem(PILL_SESSION_KEY) === '1'

    if (!popupDismissed) {
      const t = setTimeout(() => setOpen(true), SHOW_DELAY_MS)
      return () => clearTimeout(t)
    }
    if (!pillDismissed) {
      const t = setTimeout(() => setShowPill(true), PILL_DELAY_MS)
      return () => clearTimeout(t)
    }
  }, [])

  const dismiss = (persist: boolean) => {
    if (persist && typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, '1')
      // After the main popup is dismissed, always offer the pill unless they've
      // already session-dismissed it.
      if (window.sessionStorage.getItem(PILL_SESSION_KEY) !== '1') {
        setTimeout(() => setShowPill(true), 450)
      }
    }
    setOpen(false)
  }

  const dismissPill = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(PILL_SESSION_KEY, '1')
    }
    setShowPill(false)
  }

  const reopenFromPill = () => {
    setShowPill(false)
    setOpen(true)
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

      {/* Persistent floating pill — shows after popup dismissed so users can
          always get the app later without digging through navigation. */}
      {showPill && !open ? (
        <div className="pointer-events-none fixed bottom-5 right-5 z-40 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
          <div className="pointer-events-auto group flex items-stretch overflow-hidden rounded-full border border-[#f4b942]/40 bg-gradient-to-br from-[#1a1309]/95 to-[#0a0a0f]/95 shadow-[0_8px_30px_-6px_rgba(244,185,66,0.4)] backdrop-blur-sm transition hover:border-[#f4b942]/70 hover:shadow-[0_12px_40px_-6px_rgba(244,185,66,0.6)]">
            <button
              type="button"
              onClick={reopenFromPill}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#f4b942] focus:outline-none focus:ring-2 focus:ring-[#f4b942]/50"
              aria-label="Get the HUMAID Android app"
            >
              <Smartphone className="h-4 w-4" />
              <span>Get App</span>
            </button>
            <button
              type="button"
              onClick={dismissPill}
              className="flex items-center justify-center border-l border-[#f4b942]/20 px-2.5 text-zinc-500 transition hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20"
              aria-label="Hide until next visit"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : null}
    </Dialog.Root>
  )
}
