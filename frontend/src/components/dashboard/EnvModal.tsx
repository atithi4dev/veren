import React from 'react'
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi'
import type { EnvPair } from '../../api/types'

interface EnvModalProps {
  isOpen: boolean
  onClose: () => void
  projectName: string
  envVars: EnvPair[]
  onSave: (envVars: EnvPair[]) => Promise<void>
  isDarkTheme: boolean
  isLoading?: boolean
}

export const EnvModal: React.FC<EnvModalProps> = ({
  isOpen,
  onClose,
  projectName,
  envVars,
  onSave,
  isDarkTheme,
  isLoading = false,
}) => {
  const [variables, setVariables] = React.useState<EnvPair[]>([])
  const [isSaving, setIsSaving] = React.useState(false)

  React.useEffect(() => {
    setVariables(envVars || [])
  }, [envVars, isOpen])

  const handleAddVariable = () => {
    setVariables((prev) => [...prev, { key: '', value: '' }])
  }

  const handleRemoveVariable = (index: number) => {
    setVariables((prev) => prev.filter((_, i) => i !== index))
  }

  const handleKeyChange = (index: number, newKey: string) => {
    setVariables((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], key: newKey }
      return updated
    })
  }

  const handleValueChange = (index: number, newValue: string) => {
    setVariables((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], value: newValue }
      return updated
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(variables)
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-bg-black/50 tw-p-4">
      <div className={isDarkTheme ? 'tw-bg-md-neutral-20 tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-5xl tw-h-[80vh] tw-flex tw-flex-col' : 'tw-bg-md-neutral-99 tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-5xl tw-h-[80vh] tw-flex tw-flex-col'}>
        {/* Header */}
        <div className={isDarkTheme ? 'tw-border-b tw-border-md-neutral-40 tw-px-8 tw-py-5 tw-flex tw-items-center tw-justify-between tw-flex-shrink-0' : 'tw-border-b tw-border-md-neutral-90 tw-px-8 tw-py-5 tw-flex tw-items-center tw-justify-between tw-flex-shrink-0'}>
          <div>
            <h2 className={isDarkTheme ? 'tw-text-2xl tw-font-semibold tw-text-md-neutral-95' : 'tw-text-2xl tw-font-semibold tw-text-md-neutral-10'}>
              Environment Variables
            </h2>
            <p className={isDarkTheme ? 'tw-text-sm tw-text-md-neutral-70 tw-mt-1' : 'tw-text-sm tw-text-md-neutral-40 tw-mt-1'}>
              {projectName}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className={isDarkTheme ? 'tw-p-2 hover:tw-bg-md-neutral-30 tw-rounded-lg tw-transition-colors tw-text-md-neutral-60' : 'tw-p-2 hover:tw-bg-md-neutral-95 tw-rounded-lg tw-transition-colors tw-text-md-neutral-40'}
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="tw-flex-1 tw-overflow-hidden tw-flex tw-flex-col">
          <div className="tw-no-scrollbar tw-overflow-y-auto tw-px-8 tw-py-6 tw-flex-1">
            {isLoading ? (
              <div className={isDarkTheme ? 'tw-text-center tw-text-md-neutral-60 tw-py-16' : 'tw-text-center tw-text-md-neutral-40 tw-py-16'}>
                <div className="tw-inline-block tw-animate-spin tw-h-8 tw-w-8 tw-border-4 tw-border-blue-500 tw-border-t-transparent tw-rounded-full"></div>
                <p className="tw-mt-4">Loading environment variables...</p>
              </div>
            ) : variables.length === 0 ? (
              <div className={isDarkTheme ? 'tw-text-center tw-text-md-neutral-60 tw-py-16' : 'tw-text-center tw-text-md-neutral-40 tw-py-16'}>
                <p className="tw-text-lg">No environment variables set yet</p>
                <p className="tw-text-sm tw-mt-2">Click "Add Variable" to create your first one</p>
              </div>
            ) : (
              <div className="tw-space-y-3">
                {variables.map((variable, index) => (
                  <div key={index} className={isDarkTheme ? 'tw-flex tw-gap-3 tw-items-center tw-p-4 tw-bg-md-neutral-30 tw-rounded-lg tw-border tw-border-md-neutral-40 hover:tw-border-md-neutral-50 tw-transition-colors' : 'tw-flex tw-gap-3 tw-items-center tw-p-4 tw-bg-md-neutral-97 tw-rounded-lg tw-border tw-border-md-neutral-80 hover:tw-border-md-neutral-70 tw-transition-colors'}>
                    <div className="tw-flex-1">
                      <label className={isDarkTheme ? 'tw-text-xs tw-text-md-neutral-60 tw-block tw-mb-1' : 'tw-text-xs tw-text-md-neutral-40 tw-block tw-mb-1'}>Key</label>
                      <input
                        type="text"
                        placeholder="VARIABLE_NAME"
                        value={variable.key}
                        onChange={(e) => handleKeyChange(index, e.target.value)}
                        disabled={isSaving}
                        className={isDarkTheme ? 'tw-w-full tw-px-4 tw-py-2 tw-bg-md-neutral-20 tw-border tw-border-md-neutral-40 tw-rounded-md tw-text-md-neutral-95 placeholder:tw-text-md-neutral-50 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent disabled:tw-opacity-50' : 'tw-w-full tw-px-4 tw-py-2 tw-bg-md-neutral-99 tw-border tw-border-md-neutral-80 tw-rounded-md tw-text-md-neutral-10 placeholder:tw-text-md-neutral-40 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent disabled:tw-opacity-50'}
                      />
                    </div>
                    <div className="tw-flex-1">
                      <label className={isDarkTheme ? 'tw-text-xs tw-text-md-neutral-60 tw-block tw-mb-1' : 'tw-text-xs tw-text-md-neutral-40 tw-block tw-mb-1'}>Value</label>
                      <input
                        type="text"
                        placeholder="your_value_here"
                        value={variable.value}
                        onChange={(e) => handleValueChange(index, e.target.value)}
                        disabled={isSaving}
                        className={isDarkTheme ? 'tw-w-full tw-px-4 tw-py-2 tw-bg-md-neutral-20 tw-border tw-border-md-neutral-40 tw-rounded-md tw-text-md-neutral-95 placeholder:tw-text-md-neutral-50 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent disabled:tw-opacity-50' : 'tw-w-full tw-px-4 tw-py-2 tw-bg-md-neutral-99 tw-border tw-border-md-neutral-80 tw-rounded-md tw-text-md-neutral-10 placeholder:tw-text-md-neutral-40 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent disabled:tw-opacity-50'}
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveVariable(index)}
                      disabled={isSaving}
                      className="tw-p-3 hover:tw-bg-red-500/20 tw-rounded-md tw-transition-colors tw-text-red-500 tw-flex-shrink-0 tw-mt-5"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={isDarkTheme ? 'tw-border-t tw-border-md-neutral-40 tw-px-8 tw-py-5 tw-flex tw-items-center tw-justify-between tw-flex-shrink-0' : 'tw-border-t tw-border-md-neutral-90 tw-px-8 tw-py-5 tw-flex tw-items-center tw-justify-between tw-flex-shrink-0'}>
          <button
            onClick={handleAddVariable}
            disabled={isSaving}
            className={isDarkTheme ? 'tw-inline-flex tw-items-center tw-gap-2 tw-px-4 tw-py-3 tw-rounded-lg tw-border tw-border-md-neutral-40 tw-bg-md-neutral-30 tw-text-md-neutral-90 hover:tw-bg-md-neutral-35 tw-transition-colors disabled:tw-opacity-50 tw-font-medium' : 'tw-inline-flex tw-items-center tw-gap-2 tw-px-4 tw-py-3 tw-rounded-lg tw-border tw-border-md-neutral-80 tw-bg-md-neutral-97 tw-text-md-neutral-10 hover:tw-bg-md-neutral-95 tw-transition-colors disabled:tw-opacity-50 tw-font-medium'}
          >
            <FiPlus size={18} />
            <span>Add Variable</span>
          </button>

          <div className="tw-flex tw-gap-3">
            <button
              onClick={onClose}
              disabled={isSaving}
              className={isDarkTheme ? 'tw-px-6 tw-py-3 tw-rounded-lg tw-border tw-border-md-neutral-40 tw-bg-md-neutral-20 tw-text-md-neutral-90 hover:tw-bg-md-neutral-25 tw-transition-colors disabled:tw-opacity-50 tw-font-medium' : 'tw-px-6 tw-py-3 tw-rounded-lg tw-border tw-border-md-neutral-80 tw-bg-md-neutral-99 tw-text-md-neutral-10 hover:tw-bg-md-neutral-95 tw-transition-colors disabled:tw-opacity-50 tw-font-medium'}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="tw-px-6 tw-py-3 tw-rounded-lg tw-bg-blue-500 tw-text-white hover:tw-bg-blue-600 tw-transition-colors disabled:tw-opacity-50 tw-font-medium"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
