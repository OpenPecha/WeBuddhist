import React from 'react';
import PropTypes from 'prop-types';
import { useTranslate } from '@tolgee/react';
import { getEarlyReturn, getLanguageClass, mapLanguageCode } from '../../../utils/helperFunctions.jsx';
import { LANGUAGE } from '../../../utils/constants.js';
import PaginationComponent from '../../commons/pagination/PaginationComponent.jsx';
import { Link } from 'react-router-dom';
import './Commentaries.scss';

const LANGUAGE_MAP = {
  sa: 'language.sanskrit',
  bo: 'language.tibetan',
  en: 'language.english',
  zh: 'language.chinese',
  it: 'language.italian'
};

const Commentaries = ({
  textId,
  items = [],
  isLoading,
  isError,
  pagination,
  setPagination,
  requiredInfo,
  addChapter,
  currentChapter
}) => {
  const { t } = useTranslate();

  const earlyReturn = getEarlyReturn({ isLoading, error: isError, t });
  if (earlyReturn) return earlyReturn;

  if (!items || items.length === 0) {
    return (
      <div className="content">
        <p className='mt-4 text-gray-400'>{t('global.not_found')}</p>
      </div>
    );
  }

  const totalPages = Math.ceil((items?.length || 0) / pagination.limit);

  const handlePageChange = (pageNumber) => {
    setPagination((prev) => ({ ...prev, currentPage: pageNumber }));
  };

  const renderLanguage = (commentary) => {
    return (
      <div className="commentary-language subtitle border">
        <p>{t(LANGUAGE_MAP[commentary.language])}</p>
      </div>
    );
  };

  const renderItem = (commentary) => {
    const renderMetadata = (item) => {
      const source = item.source_link || "";
      const license = item.license || "";
      if (!source && !license) return null;
      return (
        <div className="commentary-metadata en-text">
          {source && (
            <div className="metadata-row">
              <span>Source:</span>
              <span>{source}</span>
            </div>
          )}
          {license && (
            <div className="metadata-row">
              <span>License:</span>
              <span>{license}</span>
            </div>
          )}
        </div>
      );
    };

    const renderTitle = () => {
      if (addChapter) {
        return (
          <button
            className="commentary-title-button"
            onClick={() => {
              addChapter({
                textId: commentary.id
              }, currentChapter);
            }}
          >
            <div className={`${getLanguageClass(commentary.language)} commentary-title`}>
              {commentary.title}
            </div>
          </button>
        );
      }
      return (
        <Link
          to={`/chapter?text_id=${commentary.id}`}
          className="commentary-title"
        >
          <div className={`${getLanguageClass(commentary.language)} commentary-title`}>
            {commentary.title}
          </div>  
        </Link>
      );
    };

    return (
      <div className="commentary-details" key={commentary.id}>
        <div className="commentary-title-subtitle-container">
          {renderTitle()}
          {renderMetadata(commentary)}
        </div>
        {renderLanguage(commentary)}
      </div>
    );
  };

  const renderPagination = () => {
    return items?.length > 0 ? (
      <PaginationComponent
        pagination={pagination}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
        setPagination={setPagination}
      />
    ) : (
      <></>
    );
  };

  return (
    <div className="commentaries-container">
      {items.map((commentary) => renderItem(commentary))}
      {/* {renderPagination()} */}
    </div>
  );
};

export default React.memo(Commentaries);

Commentaries.propTypes = {
  textId: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.object),
  isLoading: PropTypes.bool,
  isError: PropTypes.object,
  pagination: PropTypes.shape({
    currentPage: PropTypes.number.isRequired,
    limit: PropTypes.number.isRequired
  }),
  setPagination: PropTypes.func,
  requiredInfo: PropTypes.shape({
    from: PropTypes.string
  }),
  addChapter: PropTypes.func,
  currentChapter: PropTypes.object
};


