import { Button } from "@usesend/ui/src/button";
import Spinner from "@usesend/ui/src/spinner";
import { toast } from "@usesend/ui/src/toaster";
import { api } from "~/trpc/react";

export const UpgradeButton = () => {
  const checkoutMutation = api.billing.createCheckoutSession.useMutation();

  const onClick = async () => {
    try {
      const url = await checkoutMutation.mutateAsync();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to start checkout. Check Stripe configuration.",
      );
    }
  };

  return (
    <Button
      onClick={onClick}
      className="mt-4 w-[120px]"
      disabled={checkoutMutation.isPending}
    >
      {checkoutMutation.isPending ? <Spinner className="w-4 h-4" /> : "Upgrade"}
    </Button>
  );
};
