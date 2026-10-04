import React, { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  maxWidth?: string
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-xl',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex min-h-full items-start justify-center p-2 text-center sm:items-center sm:p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className={`relative my-2 flex max-h-[calc(100dvh-1rem)] w-full flex-col overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 ${maxWidth} border border-slate-200`}
        >
          {/* Header */}
          <div className="bg-slate-50 px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 id="modal-title" className="break-words text-base sm:text-lg font-semibold text-slate-900">
                {title}
              </h3>
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="min-h-11 min-w-11 shrink-0 rounded-lg p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="min-h-0 overflow-y-auto p-4 sm:p-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
