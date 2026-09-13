import { PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

const EmptyState = ({
  icon: Icon = PackageSearch,
  title = "Nothing here yet",
  description = "No data found.",
  action,
  actionLabel,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && actionLabel && (
        <Button onClick={action} className="mt-6">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
