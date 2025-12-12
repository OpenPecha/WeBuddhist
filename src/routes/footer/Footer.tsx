import { useTranslate } from "@tolgee/react";

type LinkItem = {
  href: string;
  labelKey: string;
};

type FooterColumn = {
  title: string;
  links: LinkItem[];
  useTranslation?: boolean;
};

const columns: FooterColumn[] = [
  {
    title: "footer.about",
    links: [
      { href: "https://dharmaduta.in/about", labelKey: "footer.about_us" },
      { href: "https://dharmaduta.in/team", labelKey: "footer.team" },
      { href: "https://dharmaduta.in/projects", labelKey: "footer.products" },
    ],
  },
  {
    title: "footer.tools",
    links: [
      {
        href: "https://buddhistai.tools/",
        labelKey: "footer.buddhist_ai_tools",
      },
      { href: "https://sherab.org/", labelKey: "footer.sherab" },
    ],
  },
  {
    title: "footer.developers",
    links: [
      {
        href: "https://github.com/OpenPecha",
        labelKey: "footer.fork_us_on_github",
      },
      {
        href: "https://discord.com/invite/7GFpPFSTeA",
        labelKey: "footer.discord",
      },
    ],
  },
  {
    title: "Connect",
    useTranslation: false,
    links: [
      {
        href: "https://www.instagram.com/we.buddhist/",
        labelKey: "footer.instagram",
      },
      {
        href: "https://www.facebook.com/profile.php?id=61578322432088",
        labelKey: "footer.facebook",
      },
      {
        href: "https://www.youtube.com/@WeBuddhistmedia",
        labelKey: "footer.youtube",
      },
      {
        href: "https://www.linkedin.com/company/webuddhist/",
        labelKey: "footer.linkedin",
      },
      {
        href: "mailto:contact@dharmaduta.in",
        labelKey: "footer.email",
      },
    ],
  },
];
const Footer = () => {
  const { t } = useTranslate();
  return (
    <footer
      className="bg-white border-t border-[#E5E5E5] px-6 py-8"
      aria-label="Site footer"
    >
      <div className=" mx-auto grid grid-cols-2  md:grid-cols-4 gap-2 md:gap-4">
        {columns.map(({ title, links, useTranslation = true }) => (
          <div key={title} className="text-left">
            <h3 className="font-bold text-[#676767] mb-4 text-base">
              {useTranslation ? t(title) : title}
            </h3>
            <ul className="list-none p-0 m-0 flex flex-col gap-2">
              {links.map(({ href, labelKey }) => (
                <li key={labelKey}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#666666] text-base transition-colors hover:text-[#AB1A20] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#AB1A20]"
                    aria-label={t(labelKey)}
                  >
                    {t(labelKey)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
};

export default Footer;
