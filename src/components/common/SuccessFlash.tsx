type Props = {
  show: boolean
}

export function SuccessFlash({ show }: Props) {
  if (!show) return null
  return <div className="success-flash" />
}
