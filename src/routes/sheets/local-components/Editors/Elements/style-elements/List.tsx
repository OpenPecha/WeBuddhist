const List = (props: any) => {
  const { attributes, children, element } = props;
  const isOrdered = element.type === "ordered-list";

  const listStyles = {
    paddingLeft: "2em",
    margin: "0.5em 0",
    textAlign: element.align || "left",
    listStyleType: isOrdered ? "decimal" : "disc",
    listStylePosition: "outside",
  };

  if (isOrdered) {
    return (
      <ol {...attributes} style={listStyles}>
        {children}
      </ol>
    );
  }

  return (
    <ul {...attributes} style={listStyles}>
      {children}
    </ul>
  );
};

export default List;
