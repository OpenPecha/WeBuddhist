const CodeElement = props => {
    return (
      <pre {...props.attributes} className='codestyle'>
        <code>{props.children}</code>
      </pre>
    )
  }
  
  export default CodeElement