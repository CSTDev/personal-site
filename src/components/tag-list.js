/** @jsx jsx */
import { jsx } from "theme-ui"
import { Link } from "gatsby"
import { RiArrowRightSLine } from "react-icons/ri"
// Utilities
import kebabCase from "lodash/kebabCase"

const TagList = props => {
  return (
    <div>
      {props.title && <p className="sub-heading">{props.title}</p>}
      {props.tags.map(t => (
        <div
          className="tag-chip"
          sx={{
            variant: "variants.button",
            backgroundColor:
              props.currentTag === t
                ? "var(--theme-ui-colors-secondary)"
                : "var(--theme-ui-colors-siteColor)",
          }}
          key={t}
        >
          <Link to={`/tags/${kebabCase(t)}`}>
            {t[0].toUpperCase() + t.slice(1)}
          </Link>
        </div>
      ))}
      {props.currentTag && (
        <div
          className="tag-chip"
          sx={{
            variant: "variants.button",
          }}
        >
          <Link to={`/blog/`}>
            Show All <RiArrowRightSLine />
          </Link>
        </div>
      )}
    </div>
  )
}

export default TagList
