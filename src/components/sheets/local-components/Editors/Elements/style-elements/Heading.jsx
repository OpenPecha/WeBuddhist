import React from 'react'

const Heading = (prop) => {
  const {as, attributes, children, element} = prop
  
  const renderHeading = () => {
    switch(as) {
      case 'h1':
        return (
          <h1 {...attributes} style={{ textAlign: element.align}}>
            {children}
          </h1>
        )
      case 'h2':
        return (
          <h2 {...attributes} style={{ textAlign: element.align}}>
            {children}
          </h2>
        )
      default:
        return (
          <p {...attributes} style={{textAlign: element.align}}>
            {children}
          </p>
        )
    }
  }

  return renderHeading()
}

export default Heading