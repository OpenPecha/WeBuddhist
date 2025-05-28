const DefaultElement = props => {
    const { element, attributes, children } = props;
    const style = {
      ...(element.align ? { textAlign: element.align } : {}),
      whiteSpace: 'pre-wrap' // This preserves line breaks and whitespace
    };
    return <p style={style} {...attributes}>{children}</p>
  }

  export default DefaultElement
