import "./footer.scss";

const Footer = () => {
  const renderAboutColumn = () => {
    return (
      <div className="footer-column">
        <h3 className="footer-column-title">About</h3>
        <ul className="footer-links">
          <li><a href="#">What is WeBuddhist?</a></li>
          <li><a href="https://dharmaduta.in/team" target="_blank" rel="noopener noreferrer">Teams</a></li>
          <li><a href="https://wiki.openpecha.org/#/">Developer Guidelines</a></li>
        </ul>
      </div>
    );
  };

  const renderToolsColumn = () => {
    return (
      <div className="footer-column">
        <h3 className="footer-column-title">Tools</h3>
        <ul className="footer-links">
          <li><a href="https://buddhistai.tools/" target="_blank" rel="noopener noreferrer">Buddhist AI tools</a></li>
          <li><a href="https://webuddhist.com/" target="_blank" rel="noopener noreferrer">WeBuddhist Study Platform</a></li>
          <li><a href="https://sherab.org/" target="_blank" rel="noopener noreferrer">Sherab</a></li>
        </ul>
      </div>
    );
  };

  const renderDevelopersColumn = () => {
    return (
      <div className="footer-column">
        <h3 className="footer-column-title">Developers</h3>
        <ul className="footer-links">
          <li><a href="https://github.com/OpenPecha" target="_blank" rel="noopener noreferrer">Fork us on GitHub</a></li>
        </ul>
      </div>
    );
  };

  const renderConnectSection = () => {
    return (
      <div className="footer-connect">
        <h3 className="footer-column-title">CONNECT</h3>
        <div className="social-links">
          <a href="https://www.instagram.com/dharmaduta.in/" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://www.facebook.com/profile.php?id=61578322432088" target="_blank" rel="noopener noreferrer">Facebook</a>
          <a href="https://www.youtube.com/@DharmadutaServicesLLP" target="_blank" rel="noopener noreferrer">YouTube</a>
          <a href="https://www.linkedin.com/company/dharmaduta-services-llp/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="mailto:contact@dharmaduta.in" target="_blank" rel="noopener noreferrer">Email</a>
        </div>
      </div>
    );
  };

  return (
    <footer className="footer-main">
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

