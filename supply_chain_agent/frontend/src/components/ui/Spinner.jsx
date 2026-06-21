import clsx from "clsx"

const SIZE_CLASSES = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-[3px]",
  lg: "h-10 w-10 border-4"
}

export default function Spinner({ size = "md", className }) {
  return (
    <span
      className={clsx(
        "inline-block animate-spin rounded-full border-primary/20 border-t-primary",
        SIZE_CLASSES[size],
        className
      )}
    />
  )
}
