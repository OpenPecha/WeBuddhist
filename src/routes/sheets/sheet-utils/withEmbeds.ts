const withEmbeds = (editor) => {
  const { isVoid } = editor;
  editor.isVoid = (element) =>
    element.type === "youtube" ? true : isVoid(element);
  return editor;
};

export default withEmbeds;
