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
      className={` relative pl-5 ${getLanguageClass("en")}`}
    >
      {selected && (
        <MdDragIndicator className="absolute mt-1.5  left-0 size-5 inline-block text-gray-300" />
      )}
      {children}
    </p>
  );
};

export default DefaultElement;
