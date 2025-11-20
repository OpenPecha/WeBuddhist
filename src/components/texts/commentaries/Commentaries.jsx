import React from 'react';
import PropTypes from 'prop-types';
import { useTranslate } from '@tolgee/react';
import { getEarlyReturn, getLanguageClass } from '../../../utils/helperFunctions.jsx';
import PaginationComponent from '../../commons/pagination/PaginationComponent.jsx';
import './Commentaries.scss';

// const mockResponseData = [
//     {
//       "id": "string",
//       "pecha_text_id": "string",
//       "title": "Commentary 1",
//       "language": "string",
//       "group_id": "string",
//       "type": "string",
//       "summary": "",
//       "is_published": true,
//       "created_date": "string",
//       "updated_date": "string",
//       "published_date": "string",
//       "published_by": "string",
//       "categories": [
//         "string"
//       ],
//       "views": 0,
//       "likes": [],
//       "source_link": "string",
//       "ranking": 0,
//       "license": "string"
//     },

//   {
//     "id": "string",
//     "pecha_text_id": "string",
//     "title": "Commentary 2",
//     "language": "string",
//     "group_id": "string",
//     "type": "string",
//     "summary": "",
//     "is_published": true,
//     "created_date": "string",
//     "updated_date": "string",
//     "published_date": "string",
//     "published_by": "string",
//     "categories": [
//       "string"
//     ],
//     "views": 0,
//     "likes": [],
//     "source_link": "string",
//     "ranking": 0,
//     "license": "string"
//   }
//   ]

const Commentaries = ({
  textId: propTextId,
  items = [],
  total,
  isLoading,
  isError,
  pagination,
  setPagination
}) => {
  const { t } = useTranslate();

  const earlyReturn = getEarlyReturn({ isLoading, error: isError, t });
  if (earlyReturn) return earlyReturn;

  if (!items || items.length === 0) {
    return (
      <div className="listtitle">
        <p>{t('global.not_found')}</p>
      </div>
    );
  }

  const languageMap = {
    sa: 'language.sanskrit',
    bo: 'language.tibetan',
    en: 'language.english',
    zh: 'language.chinese',
    it: 'language.italian'
  };

  const totalItems = typeof total === 'number' ? total : items.length;
  const totalPages = Math.ceil(totalItems / pagination.limit);

  const handlePageChange = (pageNumber) => {
    setPagination((prev) => ({ ...prev, currentPage: pageNumber }));
  };

  const renderLanguage = (commentary) => {
    return (
      <div className="commentary-language subtitle border">
        <p>{t(languageMap[commentary.language])}</p>
      </div>
    );
  };

  const renderItem = (commentary) => {
    return (
      <div className="commentary-details" key={commentary.id}>
        <div className="commentary-title-subtitle-container">
          <div className={`${getLanguageClass(commentary.language)}`}>
            {commentary.title}
          </div>
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
      {renderPagination()}
    </div>
  );
};

export default React.memo(Commentaries);

Commentaries.propTypes = {
  textId: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.object),
  total: PropTypes.number,
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


