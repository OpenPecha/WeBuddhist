import "./Footer.scss";
import { useTranslate } from "@tolgee/react";

const Footer = () => {
  const { t } = useTranslate();
  const renderAboutColumn = () => {
    return (
      <div className="footer-column">
        <h3 className="footer-column-title">{t("footer.about")}</h3>
        <ul className="footer-links">
          <li><a href="https://dharmaduta.in/team" target="_blank" rel="noopener noreferrer">{t('footer.team')}</a></li>
          <li><a href="https://wiki.openpecha.org/#/" target="_blank" rel="noopener noreferrer">{t('footer.developer_guidelines')}</a></li>
          <li><a href="https://dharmaduta.in/projects" target="_blank" rel="noopener noreferrer">{t('footer.products')}</a></li>
        </ul>
      </div>
    );
  };

  const renderToolsColumn = () => {
    return (
      <div className="footer-column">
        <h3 className="footer-column-title">Tools</h3>
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
        <h3 className="footer-column-title">Developers</h3>
        <ul className="footer-links">
          <li><a href="https://github.com/OpenPecha" target="_blank" rel="noopener noreferrer">{t('fork_us_on_github')}</a></li>
        </ul>
      </div>
    );
  };

  const renderConnectSection = () => {
    return (
      <div className="footer-connect">
        <h3 className="footer-column-title">CONNECT</h3>
        <div className="social-links">
          <a href="https://www.instagram.com/dharmaduta.in/" target="_blank" rel="noopener noreferrer">{t('Instagram')}</a>
          <a href="https://www.facebook.com/profile.php?id=61578322432088" target="_blank" rel="noopener noreferrer">{t('Facebook')}</a>
          <a href="https://www.youtube.com/@DharmadutaServicesLLP" target="_blank" rel="noopener noreferrer">{t('Youtube')}</a>
          <a href="https://www.linkedin.com/company/dharmaduta-services-llp/" target="_blank" rel="noopener noreferrer">{t('Linkedin')}</a>
          <a href="https://discord.com/invite/7GFpPFSTeA" target="_blank" rel="noopener noreferrer">{t('Discord')}</a>
          <a href="mailto:contact@dharmaduta.in" target="_blank" rel="noopener noreferrer">{t('Email')}</a>
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