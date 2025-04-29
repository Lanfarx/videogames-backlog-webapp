import type React from "react"

interface SettingsSectionProps {
  title: string
  children: React.ReactNode
}

export default function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <div className="mb-8">
      <h2 className="font-montserrat font-semibold text-xl text-text-primary mb-2">{title}</h2>
      <div className="border-t border-border-color pt-3">{children}</div>
    </div>
  )
}
