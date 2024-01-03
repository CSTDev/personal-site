/** @jsx jsx */
import { jsx } from "theme-ui"
import { Link } from "gatsby"
import { RiArrowRightSLine } from "react-icons/ri"

import PostCard from "./post-card"

export default function FeaturedBlogs(props) {
  const data = props.data
  const posts = data.edges
    .filter(edge => !!edge.node.frontmatter.date)
    .map(edge => <PostCard key={edge.node.id} data={edge.node} />)
  return <PostMaker data={posts} />
}

const PostMaker = ({ data }) => (
  <section className="home-posts">
    <h2>
      Featured <strong>Blogs</strong>{" "}
    </h2>
    <div className="grids col-1 sm-2 lg-3">{data}</div>
    <Link
      className="button"
      to="/blog"
      sx={{
        variant: "variants.button",
      }}
    >
      See more
      <span className="icon -right">
        <RiArrowRightSLine />
      </span>
    </Link>
  </section>
)
