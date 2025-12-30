const AudioElement = (props: any) => {
  const { attributes, children, element } = props;
  const { src, url } = element;

  if (!src) {
    return (
      <div {...attributes}>
        {children}
        <p contentEditable={false}>
          Audio link:{" "}
          <a href={url} target="_blank" rel="noopener noreferrer">
            {url || "Pasted audio link"}
          </a>
          {element.error && (
            <span style={{ color: "red" }}> (Error: {element.error})</span>
          )}
        </p>
      </div>
    );
  }

  return (
    <div {...attributes}>
      <div contentEditable={false} className="py-2">
        <iframe
          width="100%"
          height="166"
          allow="autoplay"
          src={src}
          title="Audio Player"
          className="w-full h-[166px] border-none overflow-hidden"
        ></iframe>
      </div>
    </div>
  );
};

export default AudioElement;
