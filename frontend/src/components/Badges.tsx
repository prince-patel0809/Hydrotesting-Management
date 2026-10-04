import React from 'react'
import { CheckCircle2, AlertTriangle, XCircle, Clock, ShieldCheck } from 'lucide-react'
import { TestResultType, ValidityCategory } from '../types'

interface ResultBadgeProps {
  result?: TestResultType | string | null
}

export const ResultBadge: React.FC<ResultBadgeProps> = ({ result }) => {
  if (!result) {
    return <span className="text-xs text-slate-400 font-mono">No Tests</span>
  }

  switch (result) {
    case 'Pass':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Pass
        </span>
      )
    case 'Fail':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          Fail
        </span>
      )
    case 'Pending':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          Pending
        </span>
      )
    default:
      return (
        <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
          {result}
        </span>
      )
  }
}

interface ValidityBadgeProps {
  category: ValidityCategory
  daysUntilDue?: number
}

export const ValidityBadge: React.FC<ValidityBadgeProps> = ({ category, daysUntilDue }) => {
  switch (category) {
    case 'Valid':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
          <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
          Valid
          {typeof daysUntilDue === 'number' && daysUntilDue > 0 && (
            <span className="text-orange-500 font-normal">({daysUntilDue}d)</span>
          )}
        </span>
      )
    case 'Due Soon':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          Due Soon
          {typeof daysUntilDue === 'number' && (
            <span className="text-amber-700 font-bold">({daysUntilDue}d left)</span>
          )}
        </span>
      )
    case 'Overdue':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
          <XCircle className="w-3.5 h-3.5 text-red-600" />
          Overdue
          {typeof daysUntilDue === 'number' && (
            <span className="text-red-700 font-bold">({Math.abs(daysUntilDue)}d ago)</span>
          )}
        </span>
      )
    default:
      return null
  }
}

interface StatusBadgeProps {
  status: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200'
  if (status === 'Active') {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200'
  } else if (status === 'Maintenance') {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200'
  } else if (status === 'Inactive' || status === 'Decommissioned') {
    colorClasses = 'bg-slate-100 text-slate-500 border-slate-300'
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${colorClasses}`}>
      {status}
    </span>
  )
}
