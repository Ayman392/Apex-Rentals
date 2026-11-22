import { IOSSpinner } from "@/components/ui/ios-spinner";

export default function Loading() {
  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center gap-3 px-6 pt-24">
      <IOSSpinner size={34} className="text-foreground/80" />
      <p className="text-xs font-medium tracking-wide text-muted-foreground">
        Loading Apex Rentals...
      </p>
    </div>
  );
}