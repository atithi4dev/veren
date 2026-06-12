import React from 'react'
import type { LogsLimit } from '../../api/logs.api'

type LogsMode = 'live' | 'static'

type LogsSectionProps = {
  isDarkTheme: boolean
  isLogsStreaming: boolean
  targetLogsDeploymentId?: string
  manualLogsDeploymentId: string
  onChangeManualLogsDeploymentId: (value: string) => void
  logsLimit: LogsLimit | ''
  onChangeLogsLimit: (value: LogsLimit | '') => void
  isLoadingLogs: boolean
  logsLines: string[]
  logsTerminalRef: React.RefObject<HTMLDivElement | null>
  logsMode?: LogsMode
  onChangeLogsMode?: (mode: LogsMode) => void
  projectType?: 'frontend' | 'backend'
}

const LogsSection: React.FC<LogsSectionProps> = ({
  isDarkTheme,
  isLogsStreaming,
  targetLogsDeploymentId,
  manualLogsDeploymentId,
  onChangeManualLogsDeploymentId,
  logsLimit,
  onChangeLogsLimit,
  isLoadingLogs,
  logsLines,
  logsTerminalRef,
  logsMode = 'live',
  onChangeLogsMode,
  projectType,
}) => {
  const handleLogsScroll = React.useCallback(() => {
    const terminal = logsTerminalRef.current

    if (!terminal || isLoadingLogs) {
      return
    }

    // Check if user scrolled near the bottom
    const scrollPercentage = (terminal.scrollTop + terminal.clientHeight) / terminal.scrollHeight

    if (scrollPercentage > 0.8) {
      // User is near the bottom, trigger loading more logs
      if (logsMode === 'static') {
        const nextLimit = (() => {
          if (logsLimit === '' || logsLimit === 500) return 1000
          if (logsLimit === 1000) return 2500
          if (logsLimit === 2500) return 5000
          return 5000
        })()
        
        if (nextLimit !== logsLimit) {
          onChangeLogsLimit(nextLimit as LogsLimit)
        }
      }
    }
  }, [isLoadingLogs, logsTerminalRef, onChangeLogsLimit, logsMode, logsLimit])

  React.useEffect(() => {
    const terminal = logsTerminalRef.current

    if (!terminal) {
      return
    }

    terminal.addEventListener('scroll', handleLogsScroll)

    return () => {
      terminal.removeEventListener('scroll', handleLogsScroll)
    }
  }, [handleLogsScroll, logsTerminalRef])

  return (
    <div>
      <div className="tw-flex tw-flex-col tw-gap-3 md:tw-flex-row md:tw-items-center md:tw-justify-between">
        <div>
          <h3 className="tw-text-base tw-font-semibold">Logs</h3>
          <p className={isDarkTheme ? 'tw-mt-1 tw-text-xs tw-text-slate-300' : 'tw-mt-1 tw-text-xs tw-text-slate-600'}>
            {isLogsStreaming ? 'Live stream mode' : 'Static mode'} {targetLogsDeploymentId ? `• ${targetLogsDeploymentId.slice(0, 8)}...${targetLogsDeploymentId.slice(-4)}` : ''}
          </p>
        </div>

        <div className="tw-flex tw-flex-col tw-gap-2 md:tw-flex-row md:tw-items-center">
          {projectType && onChangeLogsMode && (
            <label className={isDarkTheme ? 'tw-inline-flex tw-items-center tw-gap-2 tw-text-xs tw-text-slate-300' : 'tw-inline-flex tw-items-center tw-gap-2 tw-text-xs tw-text-slate-600'}>
              <span>Mode</span>
              <select
                value={logsMode}
                onChange={(event) => onChangeLogsMode(event.target.value as LogsMode)}
                className={isDarkTheme ? 'tw-rounded-md tw-border tw-border-white/20 tw-bg-black tw-px-2 tw-py-1 tw-text-xs tw-text-white' : 'tw-rounded-md tw-border tw-border-slate-300 tw-bg-white tw-px-2 tw-py-1 tw-text-xs tw-text-slate-900'}
              >
                <option value="live">Live Logs</option>
                <option value="static">Static Logs</option>
              </select>
            </label>
          )}

          <label className={isDarkTheme ? 'tw-inline-flex tw-items-center tw-gap-2 tw-text-xs tw-text-slate-300' : 'tw-inline-flex tw-items-center tw-gap-2 tw-text-xs tw-text-slate-600'}>
            <span>Limit</span>
            <select
              value={logsLimit}
              onChange={(event) => {
                const value = event.target.value
                onChangeLogsLimit(value ? Number(value) as LogsLimit : '')
              }}
              className={isDarkTheme ? 'tw-rounded-md tw-border tw-border-white/20 tw-bg-black tw-px-2 tw-py-1 tw-text-xs tw-text-white' : 'tw-rounded-md tw-border tw-border-slate-300 tw-bg-white tw-px-2 tw-py-1 tw-text-xs tw-text-slate-900'}
            >
              <option value="">Live (default)</option>
              <option value="500">500</option>
              <option value="1000">1000</option>
              <option value="2500">2500</option>
              <option value="5000">5000</option>
            </select>
          </label>
        </div>
      </div>

      <div className="tw-mt-3">
        <label className={isDarkTheme ? 'tw-inline-flex tw-w-full tw-flex-col tw-gap-1 tw-text-xs tw-text-slate-300' : 'tw-inline-flex tw-w-full tw-flex-col tw-gap-1 tw-text-xs tw-text-slate-600'}>
          <span>Deployment ID (manual)</span>
          <input
            value={manualLogsDeploymentId}
            onChange={(event) => onChangeManualLogsDeploymentId(event.target.value)}
            placeholder="Paste deployment ID to stream logs"
            className={isDarkTheme ? 'tw-w-full tw-rounded-md tw-border tw-border-white/20 tw-bg-black tw-px-2 tw-py-1.5 tw-text-xs tw-text-white placeholder:tw-text-slate-500' : 'tw-w-full tw-rounded-md tw-border tw-border-slate-300 tw-bg-white tw-px-2 tw-py-1.5 tw-text-xs tw-text-slate-900 placeholder:tw-text-slate-400'}
          />
        </label>
      </div>

      <div
        ref={logsTerminalRef}
        className={isDarkTheme ? 'tw-mt-4 tw-h-[28rem] tw-overflow-y-auto tw-scrollbar-none tw-rounded-lg tw-border tw-border-white/15 tw-bg-black tw-p-3 tw-font-mono tw-text-xs tw-text-emerald-300' : 'tw-mt-4 tw-h-[28rem] tw-overflow-y-auto tw-scrollbar-none tw-rounded-lg tw-border tw-border-slate-300 tw-bg-slate-950 tw-p-3 tw-font-mono tw-text-xs tw-text-emerald-300'}
      >
        {isLoadingLogs && logsLines.length === 0 ? (
          <p>Loading logs...</p>
        ) : (
          logsLines.map((line, index) => (
            <p key={`${line}-${index}`} className="tw-whitespace-pre-wrap tw-break-words">{line}</p>
          ))
        )}
      </div>
    </div>
  )
}

export default LogsSection
