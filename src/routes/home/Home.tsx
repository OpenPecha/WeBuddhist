import {
  APP_DOWNLOAD_QR_URL,
  APP_STORE_URL,
  PLAY_STORE_URL,
  siteName,
} from "@/utils/constants";
import { useTranslate } from "@tolgee/react";
import { useQuery } from "react-query";
import { FaApple, FaBookOpen, FaHeadphones, FaPlay } from "react-icons/fa";
import { FaGooglePlay } from "react-icons/fa6";
import PlanCard from "./components/PlanCard";
import SectionHeader from "./components/SectionHeader";
import SeriesCard from "./components/SeriesCard";
import {
  fetchPlans,
  fetchSeries,
  getPlannerLanguage,
  HOME_PLANS_LIMIT,
  HOME_SERIES_LIMIT,
} from "./plannerApi";
import ReactPlayer from "react-player";
const appDownloadQrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=12&data=${encodeURIComponent(APP_DOWNLOAD_QR_URL)}`;

const mockTopics = [
  "Love",
  "Compassion",
  "Healing",
  "Anxiety",
  "Hard Times",
  "Anger",
  "Life",
  "Faith",
  "Buddha",
  "Dharma",
  "Sutras",
  "The Four Noble Truths",
  "Enlightenment",
  "Forgiveness",
  "Death",
  "Courage",
  "Marriage",
  "Purpose",
];

const mockVideos = [
  {
    title: "Life of the Buddha",
    duration: "12:30",
    yLink: "https://youtu.be/N5jba2EuIIk",
  },
  {
    title: "The Four Noble Truths",
    duration: "8:45",
    yLink: "https://youtu.be/sHWIQzd8bVw",
  },
  {
    title: "Introduction to Meditation",
    duration: "15:20",
    yLink: "https://youtu.be/inpok4MKVLM",
  },
];

const Home = () => {
  const { t } = useTranslate();
  const plannerLanguage = getPlannerLanguage();

  const {
    data: plansData,
    isLoading: plansLoading,
    isError: plansError,
  } = useQuery(
    ["plans", "preview", HOME_PLANS_LIMIT],
    () => fetchPlans(0, HOME_PLANS_LIMIT),
    { refetchOnWindowFocus: false },
  );

  const {
    data: seriesData,
    isLoading: seriesLoading,
    isError: seriesError,
  } = useQuery(
    ["series", "preview", HOME_SERIES_LIMIT],
    () => fetchSeries(0, HOME_SERIES_LIMIT),
    { refetchOnWindowFocus: false },
  );

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
              <span className="text-red-600">{siteName}</span>. For <br />
              <span className="italic">Everyone.</span> 100% Free.
            </h1>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button className="px-8 py-3 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-colors">
                Start Reading
              </button>
              <button className="px-8 py-3 border-2 border-gray-900 text-gray-900 rounded-full font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <FaPlay size={16} /> Listen
              </button>
            </div>
          </div>
          <div className="hidden md:flex justify-center">
            <div className="w-64 h-80 bg-gradient-to-br from-blue-900 to-black rounded-3xl shadow-2xl flex items-center justify-center relative">
              <img
                src={seriesData?.series[0].image}
                alt="Buddhist Hero"
                className="absolute w-full h-full object-cover rounded-3xl opacity-80"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-gray-100 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-3">
              Read Buddhist Texts Online
            </h3>
            <p className="text-gray-700 mb-6">
              Trusted translations, in your language.
            </p>
            <div className="flex gap-3">
              <button className="px-6 py-2 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-colors text-sm">
                Continue Reading
              </button>
              <button className="px-6 py-2 border-2 border-gray-900 text-gray-900 rounded-full font-semibold hover:bg-gray-50 transition-colors text-sm">
                Listen
              </button>
            </div>
          </div>

          <div className="bg-gray-100 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-3">Today&apos;s Teaching</h3>
            <p className="text-gray-700 mb-6">
              Wisdom from the Dharma. For you.
            </p>
            <button className="px-6 py-2 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-colors text-sm">
              Read Now
            </button>
          </div>
        </div>

        <div className="bg-gray-900 text-white rounded-2xl p-12 mb-16">
          <h2 className="text-3xl font-bold mb-8">Explore About...</h2>
          <div className="flex flex-wrap gap-3">
            {mockTopics.map((topic) => (
              <button
                key={topic}
                className="px-5 py-2 rounded-full border-2 border-white hover:bg-white hover:text-gray-900 transition-all font-semibold text-sm"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <SectionHeader title="Explore the Dharma in a fresh way" />
          <div className="grid md:grid-cols-3 gap-6">
            {mockVideos.map((video) => (
              <div
                key={video.title}
                className="bg-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                  <ReactPlayer
                    src={video.yLink}
                    width="100%"
                    height="100%"
                    config={{
                      youtube: {
                        color: "white",
                      },
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Series preview */}
        <div className="mb-16">
          <SectionHeader title="Start a Journey" seeAllTo="/series" />
          <div className="rounded-2xl p-8 md:p-10">
            {seriesLoading && (
              <p className="text-gray-400 text-center py-8">
                {t("common.loading")}
              </p>
            )}
            {seriesError && !seriesLoading && (
              <p className="text-gray-400 text-center py-8">
                {t("global.not_found")}
              </p>
            )}
            {!seriesLoading &&
              !seriesError &&
              seriesData?.series.length === 0 && (
                <p className="text-gray-400 text-center py-8">
                  No series available yet.
                </p>
              )}
            {!seriesLoading &&
              !seriesError &&
              seriesData &&
              seriesData.series.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-6">
                  {seriesData.series.map((item) => (
                    <SeriesCard
                      key={item.id}
                      item={item}
                      language={plannerLanguage}
                      variant="dark"
                    />
                  ))}
                </div>
              )}
          </div>
        </div>

        {/* Plans preview */}
        <div className="mb-16">
          <SectionHeader title="Dharma Reading Plans" seeAllTo="/plans" />
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-2">Start with a question</h3>
            <p className="text-gray-600 mb-6">
              Find a plan that speaks to your spiritual journey.
            </p>
            {plansLoading && (
              <p className="text-gray-500 text-center py-8">
                {t("common.loading")}
              </p>
            )}
            {plansError && !plansLoading && (
              <p className="text-gray-500 text-center py-8">
                {t("global.not_found")}
              </p>
            )}
            {!plansLoading && !plansError && plansData?.plans.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                No reading plans available yet.
              </p>
            )}
            {!plansLoading &&
              !plansError &&
              plansData &&
              plansData.plans.length > 0 && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {plansData.plans.map((plan) => (
                    <PlanCard key={plan.id} plan={plan} />
                  ))}
                </div>
              )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Dharma Audio</h3>
                <p className="text-gray-700">
                  Listen to teachings throughout your day
                </p>
              </div>
              <FaHeadphones className="text-3xl text-blue-600" />
            </div>
            <button className="px-6 py-2 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-colors">
              Try Audio
            </button>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  Daily Devotionals & Plans
                </h3>
                <p className="text-gray-700">
                  Build a daily reading habit on {siteName}.
                </p>
              </div>
              <FaBookOpen className="text-3xl text-purple-600" />
            </div>
            <button className="px-6 py-2 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-colors">
              Explore
            </button>
          </div>
        </div>

        <div className="bg-gray-100 rounded-2xl p-8 md:p-12 mb-16">
          <div className="max-w-4xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
            <div className="flex flex-col items-center shrink-0">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200/80">
                <img
                  src={appDownloadQrSrc}
                  alt={`QR code to download the ${siteName} app`}
                  width={200}
                  height={200}
                  className="rounded-xl size-[200px]"
                  loading="lazy"
                />
              </div>
              <p className="mt-3 text-sm text-gray-500 font-medium">
                Scan to download
              </p>
            </div>

            <div className="flex-1 text-center lg:text-left">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
                Free Mobile App
              </p>
              <h2 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
                {siteName}. Everywhere you go.
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto lg:mx-0">
                Read Buddhist texts, listen to teachings, and build daily habits
                — on iPhone, iPad, and Android.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <a
                  href={APP_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Download ${siteName} on the App Store`}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-colors text-sm"
                >
                  <FaApple className="size-5 shrink-0" aria-hidden />
                  <span className="text-left leading-tight">
                    <span className="block text-[10px] font-normal opacity-80">
                      Download on the
                    </span>
                    App Store
                  </span>
                </a>
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Get ${siteName} on Google Play`}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-colors text-sm"
                >
                  <FaGooglePlay className="size-5 shrink-0" aria-hidden />
                  <span className="text-left leading-tight">
                    <span className="block text-[10px] font-normal opacity-80">
                      Get it on
                    </span>
                    Google Play
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
