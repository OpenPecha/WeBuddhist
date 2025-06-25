//imported from old pecha
export const deserialize = (el) => {
  if (el.nodeType === 3) {
    return el.textContent;
  } else if (el.nodeType !== 1) {
    return null;
  } else if (el.nodeName === "BR") {
    return null;
  }

  const checkForStyles = () => {
    if (el.getAttribute("style")) {
      const elStyles = el.getAttribute("style").split(";");
      let addlAttrs = {};
      for (const elStyle of elStyles) {
        console.log(elStyle);
        const styleArray = elStyle.split(":");
        if (styleArray.length === 2) {
          const styleType = styleArray[0].trim();
          const styleValue = styleArray[1].trim();
          addlAttrs[styleType] = styleValue;
        }
      }
      return addlAttrs;
    }
  };

  const { nodeName } = el;
  let parent = el;

  if (
    el.nodeNode === "PRE" &&
    el.childNodes[0] &&
    el.childNodes[0].nodeName === "CODE"
  ) {
    parent = el.childNodes[0];
  }

  const children = Array.from(parent.childNodes).map(deserialize).flat();

  if (el.nodeName === "BODY") {
    return jsx("fragment", {}, children);
  }

  if (ELEMENT_TAGS[nodeName]) {
    let new_children = children;
    if (!children[0]) {
      new_children = [{ text: "" }];
    }
    const attrs = {
      ...ELEMENT_TAGS[nodeName](el),
      ...checkForStyles(),
    };
    return jsx("element", attrs, new_children);
  }

  if (TEXT_TAGS[nodeName]) {
    const attrs = TEXT_TAGS[nodeName](el);
    return children.map((child) => {
      if (!child) {
        return null;
      }
      return jsx(
        "text",
        attrs,
        typeof child === "string" || Text.isText(child)
          ? child
          : Node.string(child)
      );
    });
  }

  if (el.getAttribute("style")) {
    const elStyles = el.getAttribute("style").split(";");
    for (const elStyle of elStyles) {
      const styleArray = elStyle.split(":");
      if (styleArray.length === 2) {
        const styleType = styleArray[0].trim();
        const styleValue = styleArray[1].trim();
        let attrs = {};
        attrs[styleType] = styleValue;

        return children.map((child) =>
          child
            ? jsx(
                "text",
                attrs,
                typeof child === "string" || Text.isText(child)
                  ? child
                  : Node.string(child)
              )
            : { text: "" }
        );
      }
    }
  }

  return children;
};
