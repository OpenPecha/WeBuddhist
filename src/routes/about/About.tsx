import type { ComponentType } from "react";
import { Helmet } from "react-helmet-async";
import {
  IoBookOutline,
  IoChatbubblesOutline,
  IoEyeOutline,
  IoFlagOutline,
  IoLeafOutline,
  IoRepeatOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";
import aboutContent from "./about.md?raw";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const SECTION_HEADING = /^(Why|How|What) —|^The Team$/;
const FRONT_MATTER_HEADING = /^## (Tagline|Mission|Vision)$/;
const NUMBERED_LIST = /^\d+\./;
const PILLAR_LIST = /^(Learn|Practice|Connect|Sustain) —/;

const stripBold = (text: string) => text.replace(/^\*\*(.+)\*\*$/, "$1");

const isBoldLine = (text: string) => /^\*\*.+\*\*$/.test(text);

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

const TEAM_ITEM_PATTERN = /^(.+?)\s+(makes|make|supports|serves|keeps)\s/i;

const hasParagraphBlock = (blocks: ContentBlock[]) =>
  blocks.some((block) => block.type === "paragraphs");

const collectMatchingItems = (
  content: string[],
  startIndex: number,
  pattern: RegExp,
): { items: string[]; nextIndex: number } => {
  const items: string[] = [];
  let index = startIndex;

  while (index < content.length && pattern.test(content[index])) {
    items.push(content[index]);
    index++;
  }

  return { items, nextIndex: index };
};

const isPlainParagraphLine = (
  content: string[],
  index: number,
  isTeam: boolean,
  collectedParagraphCount: number,
) => {
  const line = content[index];
  return (
    !NUMBERED_LIST.test(line) &&
    !PILLAR_LIST.test(line) &&
    !(isTeam && collectedParagraphCount > 0)
  );
};

const collectParagraphBlock = (
  content: string[],
  startIndex: number,
  isTeam: boolean,
): { block: ContentBlock; nextIndex: number } => {
  const items: string[] = [];
  let index = startIndex;

  while (
    index < content.length &&
    isPlainParagraphLine(content, index, isTeam, items.length)
  ) {
    items.push(content[index]);
    index++;
  }

  return { block: { type: "paragraphs", items }, nextIndex: index };
};

const buildSectionBlocks = (
  content: string[],
  isTeam: boolean,
): ContentBlock[] => {
  const blocks: ContentBlock[] = [];
  let index = 0;

  while (index < content.length) {
    const line = content[index];

    if (NUMBERED_LIST.test(line)) {
      const { items, nextIndex } = collectMatchingItems(
        content,
        index,
        NUMBERED_LIST,
      );
      blocks.push({
        type: "numbered",
        items: items.map((item) => item.replace(/^\d+\.\s*/, "")),
      });
      index = nextIndex;
      continue;
    }

    if (PILLAR_LIST.test(line)) {
      const { items, nextIndex } = collectMatchingItems(
        content,
        index,
        PILLAR_LIST,
      );
      blocks.push({ type: "pillars", items });
      index = nextIndex;
      continue;
    }

    if (isTeam && hasParagraphBlock(blocks)) {
      blocks.push({ type: "team", items: content.slice(index) });
      break;
    }

    const { block, nextIndex } = collectParagraphBlock(content, index, isTeam);
    blocks.push(block);
    index = nextIndex;
  }

  return blocks;
};

type FrontMatter = {
  tagline: string;
  mission: string[];
  vision: string[];
  bodyStart: number;
};

const parseFrontMatter = (blocks: string[]): FrontMatter => {
  const result: FrontMatter = {
    tagline: "",
    mission: [],
    vision: [],
    bodyStart: 0,
  };

  if (!FRONT_MATTER_HEADING.test(blocks[0] ?? "")) {
    return result;
  }

  let currentSection: "tagline" | "mission" | "vision" | null = null;

  for (let index = 0; index < blocks.length; index++) {
    const block = blocks[index];
    const headingMatch = block.match(/^## (Tagline|Mission|Vision)$/);

    if (headingMatch) {
      currentSection = headingMatch[1].toLowerCase() as
        | "tagline"
        | "mission"
        | "vision";
      continue;
    }

    if (!currentSection || !isBoldLine(block)) {
      result.bodyStart = index;
      break;
    }

    const text = stripBold(block);
    if (currentSection === "tagline") {
      result.tagline = text;
    } else {
      result[currentSection].push(text);
    }
  }

  if (result.bodyStart === 0 && currentSection) {
    result.bodyStart = blocks.length;
  }

  return result;
};

const parseAboutContent = (raw: string) => {
  const blocks = parseBlocks(raw);
  const frontMatter = parseFrontMatter(blocks);
  const bodyBlocks = blocks.slice(frontMatter.bodyStart);

  const title = bodyBlocks[0] ?? "";
  const legacyTagline = bodyBlocks[1] ?? "";
  const tagline = frontMatter.tagline || legacyTagline;

  const contentStart =
    frontMatter.tagline && legacyTagline && bodyBlocks[1] !== title ? 2 : 1;

  const sectionStarts: { heading: string; start: number }[] = [];
  bodyBlocks.forEach((block, index) => {
    if (
      index >= contentStart &&
      (SECTION_HEADING.test(block) || block === "The Team")
    ) {
      sectionStarts.push({ heading: block, start: index });
    }
  });

  const sections: AboutSection[] = sectionStarts.map((section, index) => {
    const end = sectionStarts[index + 1]?.start ?? bodyBlocks.length;
    const content = bodyBlocks.slice(section.start + 1, end);
    const isTeam = section.heading === "The Team";

    return {
      heading: section.heading,
      blocks: buildSectionBlocks(content, isTeam),
    };
  });

  return {
    title,
    tagline,
    mission: frontMatter.mission,
    vision: frontMatter.vision,
    sections,
  };
};

const parsePillar = (text: string) => {
  const separatorIndex = text.indexOf(" — ");
  if (separatorIndex === -1) return { title: text, description: "" };
  return {
    title: text.slice(0, separatorIndex),
    description: text.slice(separatorIndex + 3),
  };
};

const sectionMeta: Record<string, { accent: string; bar: string }> = {
  "Why — Our Purpose": {
    accent: "text-[#802F3E]",
    bar: "#802F3E",
  },
  "How — The Buddha's Method": {
    accent: "text-primary",
    bar: "#102544",
  },
  "What — Content and Technology": {
    accent: "text-blue-button",
    bar: "#18345d",
  },
};

const pillarMeta: Record<
  string,
  {
    icon: ComponentType<{ className?: string }>;
    color: string;
    bar: string;
  }
> = {
  Learn: { icon: IoBookOutline, color: "text-[#802F3E]", bar: "#802F3E" },
  Practice: { icon: IoRepeatOutline, color: "text-primary", bar: "#102544" },
  Connect: {
    icon: IoChatbubblesOutline,
    color: "text-blue-button",
    bar: "#18345d",
  },
  Sustain: {
    icon: IoShieldCheckmarkOutline,
    color: "text-blue-button-light",
    bar: "#0f479a",
  },
};

const sectionSlug = (heading: string) =>
  heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const { title, tagline, mission, vision, sections } =
  parseAboutContent(aboutContent);

const SectionHeading = ({
  heading,
  className,
}: {
  heading: string;
  className?: string;
}) => {
  const meta = sectionMeta[heading];
  const headingId = sectionSlug(heading);

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className="h-1 w-16 rounded-full"
        style={{ backgroundColor: meta?.bar ?? "#102544" }}
        aria-hidden="true"
      />
      <h2
        id={headingId}
        className="en-serif-text text-2xl sm:text-3xl font-medium text-foreground"
      >
        {heading}
      </h2>
    </div>
  );
};

const TruthCard = ({ index, text }: { index: number; text: string }) => (
  <Card className="h-full border-custom-border bg-white shadow-none">
    <div className="h-1 w-full bg-[#802F3E]" aria-hidden="true" />
    <CardContent className="space-y-3 py-5">
      <span
        className="overalltext inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#802F3E]/8 text-sm font-semibold text-[#802F3E]"
        aria-hidden="true"
      >
        {index}
      </span>
      <p className="overalltext text-sm leading-relaxed text-muted-foreground">
        {text}
      </p>
    </CardContent>
  </Card>
);

const PillarCard = ({ text }: { text: string }) => {
  const { title: pillarTitle, description } = parsePillar(text);
  const meta = pillarMeta[pillarTitle];
  const Icon = meta?.icon ?? IoLeafOutline;

  return (
    <Card className="h-full border-custom-border bg-white shadow-none">
      <div
        className="h-1 w-full"
        style={{ backgroundColor: meta?.bar ?? "#102544" }}
        aria-hidden="true"
      />
      <CardContent className="space-y-3 py-5">
        <div className="flex items-center gap-2.5">
          <Icon
            className={cn("h-4 w-4 shrink-0", meta?.color ?? "text-primary")}
            aria-hidden="true"
          />
          <span className="overalltext font-semibold text-foreground">
            {pillarTitle}
          </span>
        </div>
        <p className="overalltext text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

const parseTeamItem = (text: string) => {
  const match = TEAM_ITEM_PATTERN.exec(text);
  if (!match) return { role: "", description: text };
  const role = match[1];
  return { role, description: text.slice(role.length).trim() };
};

const IntroCard = ({
  heading,
  items,
  icon: Icon,
  accent,
  bar,
}: {
  heading: string;
  items: string[];
  icon: ComponentType<{ className?: string }>;
  accent: string;
  bar: string;
}) => (
  <Card className="h-full border-custom-border bg-white shadow-none">
    <div
      className="h-1 w-full"
      style={{ backgroundColor: bar }}
      aria-hidden="true"
    />
    <div className="border-b border-custom-border py-4 px-6">
      <div className="flex items-center gap-2.5">
        <Icon className={cn("h-4 w-4 shrink-0", accent)} aria-hidden="true" />
        <CardTitle className="en-serif-text text-xl font-medium text-foreground">
          {heading}
        </CardTitle>
      </div>
    </div>
    <CardContent className="space-y-3 py-5">
      {items.map((item) => (
        <p
          key={item}
          className="overalltext text-sm sm:text-base leading-relaxed text-muted-foreground"
        >
          {item}
        </p>
      ))}
    </CardContent>
  </Card>
);

const TeamCard = ({ text }: { text: string }) => {
  const { role, description } = parseTeamItem(text);

  return (
    <p className="overalltext px-5 py-4 text-sm leading-relaxed text-muted-foreground sm:px-6">
      {role ? (
        <>
          <span className="font-medium text-foreground">{role}</span>{" "}
          {description}
        </>
      ) : (
        description
      )}
    </p>
  );
};

const About = () => {
  return (
    <>
      <Helmet>
        <title>About — WeBuddhist</title>
        <meta name="description" content={tagline} />
      </Helmet>

      <div className="min-h-screen bg-white">
        <header className="border-b border-custom-border bg-navbar">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <div aria-hidden="true" />
            <h1 className="en-serif-text text-3xl font-medium leading-tight text-foreground sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="overalltext mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {tagline}
            </p>
          </div>
        </header>

        {(mission.length > 0 || vision.length > 0) && (
          <div className="border-b border-custom-border bg-white">
            <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
              <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
                {mission.length > 0 && (
                  <IntroCard
                    heading="Mission"
                    items={mission}
                    icon={IoFlagOutline}
                    accent="text-primary"
                    bar="#102544"
                  />
                )}
                {vision.length > 0 && (
                  <IntroCard
                    heading="Vision"
                    items={vision}
                    icon={IoEyeOutline}
                    accent="text-[#802F3E]"
                    bar="#802F3E"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {sections.map((section, sectionIndex) => {
            const headingId = sectionSlug(section.heading);

            return (
              <section
                key={section.heading}
                aria-labelledby={headingId}
                className={cn(
                  "py-12 sm:py-14",
                  sectionIndex > 0 && "border-t border-custom-border",
                )}
              >
                <SectionHeading heading={section.heading} className="mb-8" />

                <div className="space-y-8">
                  {section.blocks.map((block) => {
                    if (block.type === "paragraphs") {
                      return (
                        <div
                          key={block.items[0]}
                          className="max-w-prose space-y-4"
                        >
                          {block.items.map((paragraph) => (
                            <p
                              key={paragraph}
                              className="overalltext text-base leading-relaxed text-muted-foreground"
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
                          className="grid gap-4 sm:grid-cols-3"
                        >
                          {block.items.map((item, index) => (
                            <TruthCard
                              key={item}
                              index={index + 1}
                              text={item}
                            />
                          ))}
                        </div>
                      );
                    }

                    if (block.type === "pillars") {
                      return (
                        <div
                          key={block.items[0]}
                          className="grid gap-4 sm:grid-cols-2"
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
                        className="overflow-hidden rounded-xl border border-custom-border bg-white"
                      >
                        {block.items.map((item, index) => (
                          <div key={item}>
                            <TeamCard text={item} />
                            {index < block.items.length - 1 && (
                              <Separator className="bg-custom-border" />
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default About;
