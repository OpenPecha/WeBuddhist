import "./Footer.scss";
import { useTranslate } from "@tolgee/react";

const Footer = () => {
  const { t } = useTranslate();
  const renderAboutColumn = () => {
    return (
      <div className="footer-column">
        <h3 className="footer-column-title">{t("footer.about")}</h3>
        <ul className="footer-links">
          <li><a href="https://dharmaduta.in/about" target="_blank" rel="noopener noreferrer">{t('footer.about_us')}</a></li>
          <li><a href="https://dharmaduta.in/team" target="_blank" rel="noopener noreferrer">{t('footer.team')}</a></li>
          <li><a href="https://dharmaduta.in/projects" target="_blank" rel="noopener noreferrer">{t('footer.products')}</a></li>
        </ul>
      </div>
    );v
  };

  const renderToolsColumn = () => {
    return (
      <div className="footer-column">
        <h3 className="footer-column-title">{t("footer.tools")}</h3>
        <ul className="footer-links">
          <li><a href="https://buddhistai.tools/" target="_blank" rel="noopener noreferrer">{t('footer.buddhist_ai_tools')}</a></li>
          <li><a href="https://sherab.org/" target="_blank" rel="noopener noreferrer">{t('footer.sherab')}</a></li>
        </ul>
      </div>
    );
  };

  const renderDevelopersColumn = () => {
    return (
      <div className="footer-column">
        <h3 className="footer-column-title">{t("footer.developers")}</h3>
        <ul className="footer-links">
          <li><a href="https://github.com/OpenPecha" target="_blank" rel="noopener noreferrer">{t('footer.fork_us_on_github')}</a></li>
        </ul>
      </div>
    );
  };

  const renderConnectSection = () => {
    return (
      <div className="footer-connect">
        <h3 className="footer-column-title">Connect</h3>
        <div className="social-links">
          <a href="https://www.instagram.com/dharmaduta.in/" target="_blank" rel="noopener noreferrer">{t('footer.instagram')}</a>
          <a href="https://www.facebook.com/profile.php?id=61578322432088" target="_blank" rel="noopener noreferrer">{t('footer.facebook')}</a>
          <a href="https://www.youtube.com/@DharmadutaServicesLLP" target="_blank" rel="noopener noreferrer">{t('footer.youtube')}</a>
          <a href="https://www.linkedin.com/company/dharmaduta-services-llp/" target="_blank" rel="noopener noreferrer">{t('footer.linkedin')}</a>
          <a href="https://discord.com/invite/7GFpPFSTeA" target="_blank" rel="noopener noreferrer">{t('footer.discord')}</a>
          <a href="mailto:contact@dharmaduta.in" target="_blank" rel="noopener noreferrer">{t('footer.email')}</a>
        </div>
      </div>
    );
  };

  return (
    <footer className="footer-main navbaritems">
      <div className="footer-content">
        {renderAboutColumn()}
        {renderToolsColumn()}
        {renderDevelopersColumn()}
        {renderConnectSection()}
      </div>
    </footer>
  );
};

export default Footer;