import React from "react"
import { Link } from "gatsby"

const Logo = props => {
  return (
    <div className="site-logo">
      <Link to="/">
        {props.image && (
          <img
            src={props.image}
            alt={props.title}
            className="site-logo-image"
          />
        )}
        {props.title}
      </Link>
    </div>
  )
}

export default Logo
