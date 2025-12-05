import './DefaultElement.scss';
import { MdDragIndicator } from "react-icons/md";
import { useSelected } from 'slate-react';
import {getLanguageClass} from "../../../../../../utils/helperFunctions.tsx";

const DefaultElement = props => {
    const { element, attributes, children } = props;
    const selected=useSelected()
    const style = {
      ...(element.align ? { textAlign: element.align } : {}),
      whiteSpace: 'pre-wrap' 
    };
    
    return (
      <p style={style} {...attributes} className={`paragraph-with-indicator ${getLanguageClass("en")}`}>
        {
          selected && (
            <MdDragIndicator className="newline-indicator"/>
          )
        }
        {children}
      </p>
    );
  }

export default DefaultElement