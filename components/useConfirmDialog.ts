import { InjectionKey, inject } from '@nuxtjs/composition-api'

export interface ShowConfirmDialogOptions {
  title?: string
  width?: number
  color?: string
}

export type ShowConfirmDialog = (
  message: string,
  options: ShowConfirmDialogOptions
) => Promise<boolean>

export const ShowConfirmDialogKey: InjectionKey<ShowConfirmDialog> = Symbol(
  'ShowConfirmDialogKey'
)

export function useConfirmDialog() {
  const dialog = inject(ShowConfirmDialogKey)

  if (!dialog) {
    throw new Error('Could not resolve provider')
  }

  return dialog
}
