import { useGetAboutUsQuery } from "@/redux/merchantLegalApi";
import LegalPage from "../../LegalPage";

export default function About() {
  const { data, isLoading, isError, refetch } = useGetAboutUsQuery({});

  return (
    <LegalPage
      screenTitle="About Us"
      title={data?.data?.title}
      html={data?.data?.content}
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
    />
  );
}
