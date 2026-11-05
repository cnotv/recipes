export type IconName =
  | 'arrow-left'
  | 'check'
  | 'chevron-down'
  | 'clock'
  | 'close'
  | 'heart'
  | 'info'
  | 'alert'
  | 'menu'
  | 'moon'
  | 'plus'
  | 'search'
  | 'share'
  | 'star'
  | 'sun'
  | 'trash'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ControlSize = 'md' | 'sm'
/** Pins a hover or focus look so the kit page can show states without interaction. */
export type ForcedState = 'hover' | 'focus'

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'highlight' | 'danger'
export type ToastTone = 'info' | 'success' | 'danger'
export type AvatarSize = 'sm' | 'md' | 'lg'

export type SelectOption = { value: string; label: string }
export type TabItem = { value: string; label: string }

export type RecipeCardData = {
  title: string
  cuisine: string
  minutes: number
  imageUrl?: string
}
