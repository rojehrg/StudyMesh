import { PageLoader } from "@/components/loading-states";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <PageLoader />
    </div>
  );
}

