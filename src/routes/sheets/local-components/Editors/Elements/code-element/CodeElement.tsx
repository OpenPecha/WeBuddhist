const CodeElement = (props: any) => {
  const { attributes, children, element } = props;
  const quoteStyle = {
    margin: "10px",
    padding: "10px 15px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #555",
    color: "#555",
    textAlign: element.align || "left",
  };
  return (
    <pre {...attributes} style={quoteStyle}>
      <code>{children}</code>
    </pre>
  );
};

export default CodeElement;
