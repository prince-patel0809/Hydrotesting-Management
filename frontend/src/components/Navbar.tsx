import React from 'react'
import { Layers, ClipboardCheck, LayoutDashboard, RefreshCw } from 'lucide-react'

interface NavbarProps {
  activeTab: 'dashboard' | 'assets' | 'records'
  setActiveTab: (tab: 'dashboard' | 'assets' | 'records') => void
  onRefresh: () => void
  isRefreshing: boolean
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 py-2 md:h-16 md:flex-nowrap md:py-0">
          {/* Brand */}
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 md:flex-none">
            <img
              src="/mini-logo.jpeg"
              alt="FuelFlux logo"
              className="h-10 w-10 rounded-full object-cover shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
                  Fuel<span className="text-orange-600">Flux</span>
                </span>
                <span className="hidden sm:inline text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-200">
                  Hydrotesting
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Equipment Compliance & Inspection Workflow
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Main navigation" className="order-3 flex w-full items-center justify-between gap-1 border-t border-slate-100 pt-2 md:order-none md:w-auto md:justify-start md:space-x-2 md:border-0 md:pt-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              aria-label="Dashboard"
              className={`flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium transition-colors md:min-w-0 ${
                activeTab === 'dashboard'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('assets')}
              aria-label="Asset Register"
              className={`flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium transition-colors md:min-w-0 ${
                activeTab === 'assets'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Asset Register</span>
            </button>

            <button
              onClick={() => setActiveTab('records')}
              aria-label="Hydrotest Records"
              className={`flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium transition-colors md:min-w-0 ${
                activeTab === 'records'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Records</span>
            </button>
          </nav>

          {/* Actions & Live Status */}
          <div className="order-2 flex shrink-0 items-center gap-2 md:order-none md:gap-3">
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live DB Ready
            </div>

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh Data"
              className="min-h-11 min-w-11 rounded-lg p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors disabled:opacity-50"
              aria-label="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-orange-600' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
