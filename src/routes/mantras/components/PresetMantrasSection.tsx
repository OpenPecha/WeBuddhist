import { useQuery } from "react-query";
import { useTranslate } from "@tolgee/react";
import { fetchPresetAccumulators } from "../api/accumulatorApi.ts";
import PresetMantraCard from "./PresetMantraCard.tsx";
import { Skeleton } from "@/components/ui/skeleton";
import type { PlanLanguageCode } from "../../planviewer/utils/seriesUtils.ts";

type PresetMantrasSectionProps = {
  apiLanguage: string;
  language: PlanLanguageCode;
  onOpenApp: () => void;
};

const PresetMantrasSection = ({
  apiLanguage,
  language,
  onOpenApp,
}: PresetMantrasSectionProps) => {
  const { t } = useTranslate();

  const { data, isLoading } = useQuery(
    ["preset-accumulators", apiLanguage],
    () => fetchPresetAccumulators(apiLanguage),
    { refetchOnWindowFocus: false },
  );

  const presets = data?.accumulators ?? [];

  if (isLoading) {
    return (
      <section className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  if (!presets.length) return null;

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold text-gray-900">
          {t("mantras.preset_mantras", "Mantras")}
        </h2>
        <p className="text-sm text-gray-600">
          {t(
            "mantras.preset_mantras_description",
            "Tap a mantra to download the app and start counting.",
          )}
        </p>
      </header>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
        {presets.map((preset) => (
          <PresetMantraCard
            key={preset.id}
            preset={preset}
            language={language}
            onOpenApp={onOpenApp}
          />
        ))}
      </div>
    </section>
  );
};

export default PresetMantrasSection;
