import type { ComponentType } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  IoBookOutline,
  IoChatbubblesOutline,
  IoFootstepsOutline,
  IoHeartOutline,
  IoLayersOutline,
  IoLeafOutline,
  IoPeopleOutline,
  IoRepeatOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";
import aboutContent from "./about.md?raw";
import webuddhistLogo from "/img/webuddhist_logo.svg";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SECTION_HEADING = /^(Why|How|What) —|^The Team$/;
const NUMBERED_LIST = /^\d+\./;
const PILLAR_LIST = /^(Learn|Practice|Connect|Sustain) —/;

const parseBlocks = (raw: string): string[] => {
  const lines = raw.trim().split("\n");
  const blocks: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const mergeWithPrevious =
      blocks.length > 0 &&
      /^[a-z]/.test(trimmed) &&
      !SECTION_HEADING.test(trimmed) &&
      !NUMBERED_LIST.test(trimmed) &&
      !PILLAR_LIST.test(trimmed);

    if (mergeWithPrevious) {
      blocks[blocks.length - 1] += ` ${trimmed}`;
    } else {
      blocks.push(trimmed);
    }
  }

  return blocks;
};

type ContentBlock =
  | { type: "paragraphs"; items: string[] }
  | { type: "numbered"; items: string[] }
  | { type: "pillars"; items: string[] }
  | { type: "team"; items: string[] };

type AboutSection = {
  heading: string;
  blocks: ContentBlock[];
};

const buildSectionBlocks = (
  content: string[],
  isTeam: boolean,
): ContentBlock[] => {
  const blocks: ContentBlock[] = [];
  let i = 0;

  while (i < content.length) {
    const block = content[i];

    if (NUMBERED_LIST.test(block)) {
      const items: string[] = [];
      while (i < content.length && NUMBERED_LIST.test(content[i])) {
        items.push(content[i].replace(/^\d+\.\s*/, ""));
        i++;
      }
      blocks.push({ type: "numbered", items });
      continue;
    }

    if (PILLAR_LIST.test(block)) {
      const items: string[] = [];
      while (i < content.length && PILLAR_LIST.test(content[i])) {
        items.push(content[i]);
        i++;
      }
      blocks.push({ type: "pillars", items });
      continue;
    }

    if (isTeam && blocks.some((b) => b.type === "paragraphs")) {
      const items: string[] = [];
      while (i < content.length) {
        items.push(content[i]);
        i++;
      }
      blocks.push({ type: "team", items });
      continue;
    }

    const items: string[] = [];
    while (
      i < content.length &&
      !NUMBERED_LIST.test(content[i]) &&
      !PILLAR_LIST.test(content[i]) &&
      !(isTeam && blocks.some((b) => b.type === "paragraphs"))
    ) {
      items.push(content[i]);
      i++;
    }
    blocks.push({ type: "paragraphs", items });
  }

  return blocks;
};

const parseAboutContent = (raw: string) => {
  const blocks = parseBlocks(raw);
  const title = blocks[0] ?? "";
  const tagline = blocks[1] ?? "";

  const sectionStarts: { heading: string; start: number }[] = [];
  blocks.forEach((block, index) => {
    if (index >= 2 && (SECTION_HEADING.test(block) || block === "The Team")) {
      sectionStarts.push({ heading: block, start: index });
    }
  });

  const sections: AboutSection[] = sectionStarts.map((section, index) => {
    const end = sectionStarts[index + 1]?.start ?? blocks.length;
    const content = blocks.slice(section.start + 1, end);
    const isTeam = section.heading === "The Team";

    return {
      heading: section.heading,
      blocks: buildSectionBlocks(content, isTeam),
    };
  });

  return { title, tagline, sections };
};

const parsePillar = (text: string) => {
  const separatorIndex = text.indexOf(" — ");
  if (separatorIndex === -1) return { title: text, description: "" };
  return {
    title: text.slice(0, separatorIndex),
    description: text.slice(separatorIndex + 3),
  };
};

const sectionMeta: Record<
  string,
  { icon: ComponentType<{ className?: string }>; accent: string; bg: string }
> = {
  "Why — Our Purpose": {
    icon: IoHeartOutline,
    accent: "border-[#802F3E] text-[#802F3E]",
    bg: "bg-[#802F3E]/5",
  },
  "How — The Buddha's Method": {
    icon: IoFootstepsOutline,
    accent: "border-primary text-primary",
    bg: "bg-primary/5",
  },
  "What — Content and Technology": {
    icon: IoLayersOutline,
    accent: "border-blue-button text-blue-button",
    bg: "bg-blue-button/5",
  },
  "The Team": {
    icon: IoPeopleOutline,
    accent: "border-blue-button-light text-blue-button-light",
    bg: "bg-blue-button-light/5",
  },
};

const pillarMeta: Record<
  string,
  { icon: ComponentType<{ className?: string }>; color: string }
> = {
  Learn: { icon: IoBookOutline, color: "text-[#802F3E]" },
  Practice: { icon: IoRepeatOutline, color: "text-primary" },
  Connect: { icon: IoChatbubblesOutline, color: "text-blue-button" },
  Sustain: { icon: IoShieldCheckmarkOutline, color: "text-blue-button-light" },
};

const { title, tagline, sections } = parseAboutContent(aboutContent);

const SectionHeading = ({
  heading,
  className,
}: {
  heading: string;
  className?: string;
}) => {
  const meta = sectionMeta[heading];
  const Icon = meta?.icon ?? IoLeafOutline;

  return (
    <div className={cn("flex items-start gap-4", className)}>
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2",
          meta?.accent ?? "border-primary text-primary",
          meta?.bg ?? "bg-primary/5",
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h2 className="en-serif-text text-2xl sm:text-3xl font-medium text-foreground pt-1.5">
        {heading}
      </h2>
    </div>
  );
};

const TruthCard = ({ index, text }: { index: number; text: string }) => (
  <Card className="border-custom-border bg-white shadow-none transition-shadow hover:shadow-md">
    <CardContent className="pt-6">
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#802F3E]/10 text-sm font-semibold text-[#802F3E]">
        {index}
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
    </CardContent>
  </Card>
);

const PillarCard = ({ text }: { text: string }) => {
  const { title: pillarTitle, description } = parsePillar(text);
  const meta = pillarMeta[pillarTitle];
  const Icon = meta?.icon ?? IoLeafOutline;

  return (
    <Card className="border-custom-border bg-white shadow-none transition-all hover:border-primary/20 hover:shadow-md">
      <CardContent className="pt-6">
        <div className="mb-3 flex items-center gap-2">
          <Icon
            className={cn("h-5 w-5", meta?.color ?? "text-primary")}
            aria-hidden="true"
          />
          <span className="font-semibold text-foreground">{pillarTitle}</span>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground mb-4">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

const parseTeamItem = (text: string) => {
  const match = text.match(/^(.+?)\s+(makes|make|supports|serves|keeps)\s/i);
  if (!match) return { role: "", description: text };
  const [, role] = match;
  return { role, description: text.slice(role.length).trim() };
};

const TeamCard = ({ text }: { text: string }) => {
  const { role, description } = parseTeamItem(text);

  return (
    <div className="flex gap-4 rounded-xl border border-custom-border bg-white px-5 py-4 transition-colors hover:bg-navbar/50">
      <div className="mt-1 h-full w-1 shrink-0 rounded-full bg-blue-button-light/60" />
      <p className="text-sm leading-relaxed text-muted-foreground">
        {role ? (
          <>
            <span className="font-medium text-foreground">{role}</span>{" "}
            {description}
          </>
        ) : (
          description
        )}
      </p>
    </div>
  );
};

const About = () => {
  return (
    <>
      <Helmet>
        <title>About — WeBuddhist</title>
        <meta
          name="description"
          content="We are Buddhists. We learn, practice, and connect — daily."
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-navbar to-background">
        <header className="relative overflow-hidden bg-primary text-primary-foreground">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1)_0%,transparent_55%)]" />
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-24 -left-12 h-48 w-48 rounded-full bg-white/5" />

          <div
            className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20"
            style={{ animation: "fadeInUp 0.6s ease-out" }}
          >
            <h1 className="en-serif-text mt-4 text-4xl sm:text-5xl font-medium leading-tight">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-primary-foreground/80 leading-relaxed">
              {tagline}
            </p>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16 sm:space-y-20">
          {sections.map((section, sectionIndex) => {
            const meta = sectionMeta[section.heading];

            return (
              <section
                key={section.heading}
                className="space-y-6"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${sectionIndex * 0.1}s both`,
                }}
              >
                <SectionHeading heading={section.heading} />

                {section.blocks.map((block) => {
                  if (block.type === "paragraphs") {
                    return (
                      <div
                        key={block.items[0]}
                        className="space-y-4 pl-0 sm:pl-[3.75rem]"
                      >
                        {block.items.map((paragraph) => (
                          <p
                            key={paragraph}
                            className="text-base leading-relaxed text-muted-foreground"
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    );
                  }

                  if (block.type === "numbered") {
                    return (
                      <div
                        key={block.items[0]}
                        className="grid gap-4 sm:grid-cols-3 sm:pl-[3.75rem]"
                      >
                        {block.items.map((item, index) => (
                          <TruthCard key={item} index={index + 1} text={item} />
                        ))}
                      </div>
                    );
                  }

                  if (block.type === "pillars") {
                    return (
                      <div
                        key={block.items[0]}
                        className="grid gap-4 sm:grid-cols-2 sm:pl-[3.75rem]"
                      >
                        {block.items.map((pillar) => (
                          <PillarCard key={pillar} text={pillar} />
                        ))}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={block.items[0]}
                      className={cn(
                        "space-y-3 rounded-2xl border border-custom-border p-4 sm:p-5 sm:ml-[3.75rem]",
                        meta?.bg,
                      )}
                    >
                      {block.items.map((item) => (
                        <TeamCard key={item} text={item} />
                      ))}
                    </div>
                  );
                })}
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default About;
