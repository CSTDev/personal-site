import React from "react"
import { Link } from "gatsby"
// Utilities
import kebabCase from "lodash/kebabCase"

const TagList = props => {
  return (
    <div>
      {props.tags.map(t => (
        <div className="tag-chip">
          <Link to={`/tags/${kebabCase(t)}/`}>{t}</Link>
        </div>
      ))}
    </div>
  )
}

export default TagList
