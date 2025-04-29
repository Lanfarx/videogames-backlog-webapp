"use client"

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
}

export default function ToggleSwitch({ checked, onChange, label }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary/30 ${
        checked ? "bg-accent-success" : "bg-tertiaryBg"
      }`}
      onClick={() => onChange(!checked)}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-8" : "translate-x-1"
        }`}
      />
    </button>
  )
}
