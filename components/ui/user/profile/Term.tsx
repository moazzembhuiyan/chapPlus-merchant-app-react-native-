import { useGetTermsQuery } from "@/redux/merchantLegalApi";
import LegalPage from "../../LegalPage";

export default function Term() {
  const { data, isLoading, isError, refetch } = useGetTermsQuery({});

  return (
    <LegalPage
      screenTitle="Terms of Service"
      title={data?.data?.title}
      html={data?.data?.content}
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
    />
  );
}
