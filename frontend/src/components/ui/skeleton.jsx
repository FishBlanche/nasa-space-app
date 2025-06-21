import { cn } from "@/lib/utils"

// function Skeleton({
//   className,
//   ...props
// }) {
//   return (
//     <div
//       className={cn("animate-pulse rounded-md bg-gray-200 dark:bg-gray-700", className)}
//       {...props} />
//   );
// }

// export { Skeleton }

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gray-200 dark:bg-gray-700 rounded-md",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
    </div>
  )
}
export { Skeleton }


