// Per-platform presentation. The canonical `meta.platform` is a lowercase slug
// (e.g. "grabfood", "foodpanda"); unknown platforms fall back to a neutral style.

interface PlatformStyle {
  label: string
  /** Tailwind classes for the platform chip (bg + text). */
  className: string
}

const PLATFORMS: Record<string, PlatformStyle> = {
  grabfood: { label: 'GrabFood', className: 'bg-green-600 text-white' },
  foodpanda: { label: 'Foodpanda', className: 'bg-pink-600 text-white' },
  messenger: { label: 'Messenger', className: 'bg-blue-600 text-white' },
}

export function platformStyle(platform: string): PlatformStyle {
  return (
    PLATFORMS[platform.toLowerCase()] ?? {
      label: platform || 'Unknown',
      className: 'bg-muted text-muted-foreground',
    }
  )
}
