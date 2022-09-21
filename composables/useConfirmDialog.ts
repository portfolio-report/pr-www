import { ConfirmationOptions } from 'primevue/confirmationoptions'
import { useConfirm } from 'primevue/useconfirm'

// Usage:
// const confirm = useConfirmDialog()
//
// const foo = await confirm({
//   message: 'Are you sure you want to proceed?',
//   header: 'Confirmation',
//   icon: 'pi pi-exclamation-triangle',
// })

export function useConfirmDialog() {
  const confirm = useConfirm()

  return (opts: ConfirmationOptions) =>
    new Promise<boolean>((resolve) => {
      confirm.require({
        ...opts,
        accept: () => resolve(true),
        reject: () => resolve(false),
        onHide: () => resolve(false),
      })
    })
}
