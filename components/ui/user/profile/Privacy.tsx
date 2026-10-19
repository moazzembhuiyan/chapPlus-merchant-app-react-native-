import { useGetPrivacyPolicyQuery } from "@/redux/merchantLegalApi";
import LegalPage from "../../LegalPage";

export default function Privacy() {
  const { data, isLoading, isError, refetch } = useGetPrivacyPolicyQuery({});

  return (
    <LegalPage
      screenTitle="Privacy Policy"
      title={data?.data?.title}
      html={data?.data?.content}
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
    />
  );
}
