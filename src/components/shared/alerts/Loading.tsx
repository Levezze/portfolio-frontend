import { AlertContainer } from "@/components/shared/alerts/AlertContainer";
import { Spinner } from "@/components/shared/ui/spinner";

export const Loading = () => {
  return (
    <AlertContainer>
      <Spinner className="size-6" />
      Loading...
    </AlertContainer>
  );
};
