import "./Versions.scss"
import {useTranslate} from "@tolgee/react";

const Versions = () =>{
  const { t } = useTranslate();

  const languageMap = {
    "sa":"language.sanskrit",
    "bo":"language.tibetan",
    "en":"language.english"
  }
  const data =  [
      {
        "id": "uuid.v4",
        "title": "शबोधिचर्यावतार[sa]",
        "parent_id": "d19338e",
        "priority": 1,
        "language": "sa",
        "type": "translation",
        "is_published": true,
        "created_date": "2021-09-01T00:00:00.000Z",
        "updated_date": "2021-09-01T00:00:00.000Z",
        "published_date": "2021-09-01T00:00:00.000Z",
        "published_by": "buddhist_tab"
      },
      {
        "id": "uuid.v4",
        "title": "བྱང་ཆུབ་སེམས་དཔའི་སྤྱོད་པ་ལ་འཇུག་པ།",
        "language": "bo",
        "parent_id": "d19338e",
        "priority": 2,
        "type": "translation",
        "is_published": true,
        "created_date": "2021-09-01T00:00:00.000Z",
        "updated_date": "2021-09-01T00:00:00.000Z",
        "published_date": "2021-09-01T00:00:00.000Z",
        "published_by": "buddhist_tab"
      },
      {
        "id": "uuid.v4",
        "title": "The Way of the Bodhisattva Monlam AI Draft",
        "language": "en",
        "parent_id": "d19338e",
        "priority": 3,
        "type": "translation",
        "is_published": true,
        "created_date": "2021-09-01T00:00:00.000Z",
        "updated_date": "2021-09-01T00:00:00.000Z",
        "published_date": "2021-09-01T00:00:00.000Z",
        "published_by": "buddhist_tab"
      }
    ]
  return (
    <div className="versions-container">
      {
        data.map((version,index) => <>
          <div  key={index} className="version">
            <div>
              <div className="version-title listtitle">
                {version.title}
                <br/>
              </div>
              <div className="review-history">
                Revision History
              </div>
            </div>
            <div className="version-language">
              {t(languageMap[version.language])}
            </div>
          </div>
          <hr/>
        </>)
      }
    </div>
  )
}
export default Versions