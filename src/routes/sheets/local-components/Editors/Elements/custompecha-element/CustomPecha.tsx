type CustomPechaProps = {
  attributes: any;
  element: {
    src?: string;
    url?: string;
    segmentId?: string;
  };
};

const CustomPecha = ({ attributes, element }: CustomPechaProps) => {
  if (!element.src) return null;
  return (
    <div {...attributes} className="my-4">
      <div contentEditable={false} className="max-w-full overflow-hidden">
        <a
          href={element.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block no-underline hover:opacity-90"
        >
          <img
            src={element.src}
            alt={element.segmentId}
            className="mx-auto block h-auto max-w-full"
          />
        </a>
      </div>
    </div>
  );
};

export default CustomPecha;
