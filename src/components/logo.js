import React from "react"
import { Link } from "gatsby"

const Logo = props => {
  return (
    <div className="site-logo">
      <Link to="/">{props.title}</Link>
    </div>
  )
}

export default Logo
