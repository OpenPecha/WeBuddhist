import { Link } from 'react-router-dom';
import { IoChevronForwardSharp } from 'react-icons/io5';
import './Breadcrumbs.scss';

const Breadcrumbs = ({ items }: { items: any[] }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav className="breadcrumbs-container mt-2 navbaritems" aria-label="Breadcrumb">
      <ol className="breadcrumbs-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.path || index} className="breadcrumbs-item">
              {!isLast ? (
                <>
                  <Link to={item.path} className="breadcrumbs-link">{item.label}</Link>
                  <IoChevronForwardSharp className="breadcrumbs-separator" />
                </>
              ) : (
                <span className="breadcrumbs-current">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
export default Breadcrumbs;
