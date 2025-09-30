import { Fragment } from 'react'
import { Transition } from '@headlessui/react'

/**
 * MiniLoadingSpinner
 * - Shows a full-screen loading spinner with brand accent
 * - Uses globalLoading for smooth, centralized UX (as provided by _app.js)
 * - No local loading logic, just props
 * - Responsive, high z-index, pointer-events-none
 */

export default function MiniLoadingSpinner({ loading }) {
  return (
    <Transition
      show={!!loading}
      as={Fragment}
      enter="transition-opacity transition-transform duration-400 ease-out"
      enterFrom="opacity-0 scale-90"
      enterTo="opacity-100 scale-100"
      leave="transition-opacity transition-transform duration-300 ease-in"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0 scale-90"
    >
      <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none bg-black/30 backdrop-blur-sm">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-primary border-t-accent animate-spin bg-black/60 shadow-2xl"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 32 32">
                <circle
                  className="opacity-40"
                  cx="16"
                  cy="16"
                  r="12"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  d="M28 16a12 12 0 1 1-12-12"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="text-accent"
                />
              </svg>
            </div>
          </div>
          <span className="mt-5 text-accent font-bold text-lg animate-pulse drop-shadow text-center">
            Loading...
          </span>
        </div>
      </div>
      <style jsx>{`
        .animate-spin {
          animation: spin 1.1s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg);}
        }
      `}</style>
    </Transition>
  )
}
