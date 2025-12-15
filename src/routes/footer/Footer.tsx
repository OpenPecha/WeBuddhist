import { useTranslate } from "@tolgee/react";
import {
  FaEnvelope,
  FaFacebook,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";

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
    title: "footer.about",
    links: [
      { href: "https://dharmaduta.in/about", labelKey: "footer.about_us" },
      { href: "https://dharmaduta.in/team", labelKey: "footer.team" },
      { href: "https://dharmaduta.in/projects", labelKey: "footer.products" },
    ],
  },
];

const connectLinks = [
  {
    href: "https://www.instagram.com/we.buddhist/",
    icon: <FaInstagram className="size-5" />,
  },
  {
    href: "https://www.facebook.com/profile.php?id=61578322432088",
    icon: <FaFacebook className="size-5" />,
  },
  {
    href: "mailto:contact@dharmaduta.in",
    icon: <FaEnvelope className="size-5" />,
  },
  {
    href: "https://www.linkedin.com/company/webuddhist/",
    icon: <FaLinkedinIn className="size-5" />,
  },
  {
    href: "https://www.youtube.com/@WeBuddhistmedia",
    icon: <FaYoutube className="size-5" />,
  },
];

const Footer = () => {
  const { t } = useTranslate();
  return (
    <footer className="flex max-sm:space-y-8 max-sm:flex-col border-t border-[#F4F4F4] px-3 py-4 sm:p-6 md:py-12 lg:px-8">
      <div className="flex-1 items-center justify-center">
        <div className="flex w-full flex-col text-start">
          <div className=" flex  items-center">
            <img
              src="/img/webuddhist_logo.svg"
              alt="logo"
              width={150}
              height={150}
            />
          </div>
          <div className="flex  w-full max-w-xl">
            <p className="text-base text-muted-foreground">
              Buddhism in your own words
            </p>
          </div>
          <div className="flex mt-4 w-full items-center space-x-4">
            {connectLinks.map(({ href, icon }) => (
              <span className="p-2 bg-[#781818] rounded-full" key={href}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white"
                >
                  {icon}
                </a>
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 md:flex md:justify-around grid grid-cols-2 md:grid-cols-4 gap-4">
        {columns.map(({ title, links, useTranslation = true }) => (
          <div key={title} className="text-left">
            <h3 className=" text-[#313131] uppercase font-semibold  mb-2 text-base">
              {useTranslation ? t(title) : title}
            </h3>
            <ul className="list-none p-0 m-0 flex flex-col gap-2">
              {links.map(({ href, labelKey }) => (
                <li key={labelKey}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#666666] text-base hover:text-black transition-colors"
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
