const DefaultElement = props => {
    const { element, attributes, children } = props;
    const style = element.align ? { textAlign: element.align } : {};
    return <p style={style} {...attributes}>{children}</p>
  }

  export default DefaultElement
