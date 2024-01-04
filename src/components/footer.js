/** @jsx jsx */
import { jsx } from "theme-ui"

import SocialIcons from "./social-icons"

const Footer = () => (
  <footer
    className="site-footer"
    sx={{
      bg: "siteColor",
    }}
  >
    <div className="container">
      <SocialIcons />
    </div>
  </footer>
)

export default Footer
