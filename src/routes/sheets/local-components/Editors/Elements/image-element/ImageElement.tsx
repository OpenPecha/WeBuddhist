const ImageElement = (props: any) => {
  const { attributes, children, element } = props;
  const { src, url } = element;
  const noImageUrl =
    "https://icrier.org/wp-content/uploads/2022/12/media-Event-Image-Not-Found.jpg";

  if (!src) {
    return (
      <div {...attributes}>
        {children}
        <p contentEditable={false}>
          Image link:{" "}
          <a href={url} target="_blank" rel="noopener noreferrer">
            {url || "Pasted image link"}
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
      <div
        contentEditable={false}
        style={{ paddingTop: "10px", paddingBottom: "10px" }}
      >
        <img
          className="w-full h-[250px] object-cover rounded-md block my-2"
          src={src}
          alt={element.alt || "Sheet image"}
          onError={(e) => {
            (e.target as HTMLImageElement).onerror = null;
            (e.target as HTMLImageElement).src = noImageUrl;
          }}
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </div>
    </div>
  );
};

export default ImageElement;
