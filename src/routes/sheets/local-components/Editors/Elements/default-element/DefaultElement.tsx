import { MdDragIndicator } from "react-icons/md";
import { useSelected } from "slate-react";
import { getLanguageClass } from "../../../../../../utils/helperFunctions.tsx";

const DefaultElement = (props: any) => {
  const { element, attributes, children } = props;
  const selected = useSelected();
  const style = {
    ...(element.align ? { textAlign: element.align } : {}),
    whiteSpace: "pre-wrap",
  };

  return (
    <p
      style={style}
      {...attributes}
      className={` relative pl-1.2 ${getLanguageClass("en")}`}
    >
      {selected && (
        <MdDragIndicator className="absolute mt-0.3 left-0 w-4 h-4 inline-block text-gray-500" />
      )}
      {children}
    </p>
  );
};

export default DefaultElement;
