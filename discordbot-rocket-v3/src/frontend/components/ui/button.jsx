import { cn } from "../../lib/utils";

function Button({ className, ...props }) {
  const variants = {
    default: "bg-green-500 text-black hover:bg-green-400",
    secondary: "bg-white/10 text-white hover:bg-white/15",
    ghost: "bg-transparent text-gray-300 hover:bg-white/5",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Button };
