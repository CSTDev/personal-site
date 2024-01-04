/** @jsx jsx */
import { jsx } from "theme-ui"
import {
  RiFacebookBoxFill,
  RiTwitterFill,
  RiLinkedinBoxFill,
  RiYoutubeFill,
  RiInstagramFill,
  RiRssFill,
  RiGithubFill,
  RiTelegramFill,
  RiPinterestFill,
  RiSnapchatFill,
  RiSkypeFill,
  RiDribbbleFill,
  RiMediumFill,
  RiBehanceFill,
} from "react-icons/ri"
import { FaTiktok, FaWordpress, FaVk } from "react-icons/fa"

import Icons from "../util/socialmedia.json"

const SocialIcons = () => {
  return Icons.socialIcons.map((icons, index) => {
    return (
      <div key={"social icons" + index} className="social-icons">
        {icons.icon === "facebook" ? (
          <a
            href={icons.url}
            target="_blank"
            aria-label="link to Facebook"
            rel="noopener noreferrer"
          >
            <RiFacebookBoxFill alt="Facebook icon" />
          </a>
        ) : (
          ""
        )}
        {icons.icon === "twitter" ? (
          <a
            href={icons.url}
            target="_blank"
            aria-label="link to Twitter"
            rel="noopener noreferrer"
          >
            <RiTwitterFill alt="Twitter icon" />
          </a>
        ) : (
          ""
        )}
        {icons.icon === "linkedin" ? (
          <a
            href={icons.url}
            target="_blank"
            aria-label="link to Linkedin"
            rel="noopener noreferrer"
          >
            <RiLinkedinBoxFill alt="Linkedin icon" />
          </a>
        ) : (
          ""
        )}
        {icons.icon === "youtube" ? (
          <a
            href={icons.url}
            target="_blank"
            aria-label="link to Youtube"
            rel="noopener noreferrer"
          >
            <RiYoutubeFill alt="Youtube icon" />
          </a>
        ) : (
          ""
        )}
        {icons.icon === "instagram" ? (
          <a
            href={icons.url}
            target="_blank"
            aria-label="link to Instagram"
            rel="noopener noreferrer"
          >
            <RiInstagramFill alt="Instagram icon" />
          </a>
        ) : (
          ""
        )}
        {icons.icon === "rss" ? (
          <a
            href={icons.url}
            target="_blank"
            aria-label="link to RSS"
            rel="noopener noreferrer"
          >
            <RiRssFill alt="RSS icon" />
          </a>
        ) : (
          ""
        )}
        {icons.icon === "github" ? (
          <a
            href={icons.url}
            target="_blank"
            aria-label="link to Github"
            rel="noopener noreferrer"
          >
            <RiGithubFill alt="Github icon" />
          </a>
        ) : (
          ""
        )}
        {icons.icon === "telegram" ? (
          <a
            href={icons.url}
            target="_blank"
            aria-label="link to Telegram"
            rel="noopener noreferrer"
          >
            <RiTelegramFill alt="Telegram icon" />
          </a>
        ) : (
          ""
        )}
        {icons.icon === "pinterest" ? (
          <a
            href={icons.url}
            target="_blank"
            aria-label="link to Pinterest"
            rel="noopener noreferrer"
          >
            <RiPinterestFill alt="Pinterest icon" />
          </a>
        ) : (
          ""
        )}
        {icons.icon === "snapchat" ? (
          <a
            href={icons.url}
            target="_blank"
            aria-label="link to Snapchat"
            rel="noopener noreferrer"
          >
            <RiSnapchatFill alt="Snapchat icon" />
          </a>
        ) : (
          ""
        )}
        {icons.icon === "skype" ? (
          <a
            href={icons.url}
            target="_blank"
            aria-label="link to Skype"
            rel="noopener noreferrer"
          >
            <RiSkypeFill alt="Skype icon" />
          </a>
        ) : (
          ""
        )}
        {icons.icon === "wordpress" ? (
          <a
            href={icons.url}
            target="_blank"
            aria-label="link to Wordpress"
            rel="noopener noreferrer"
          >
            <FaWordpress alt="Wordpress icon" />
          </a>
        ) : (
          ""
        )}
        {icons.icon === "tiktok" ? (
          <a
            href={icons.url}
            target="_blank"
            aria-label="link to Wordpress"
            rel="noopener noreferrer"
          >
            <FaTiktok alt="tiktok icon" />
          </a>
        ) : (
          ""
        )}
        {icons.icon === "dribbble" ? (
          <a
            href={icons.url}
            target="_blank"
            aria-label="link to Dribbble"
            rel="noopener noreferrer"
          >
            <RiDribbbleFill alt="Dribbble icon" />
          </a>
        ) : (
          ""
        )}
        {icons.icon === "medium" ? (
          <a
            href={icons.url}
            target="_blank"
            aria-label="link to Medium"
            rel="noopener noreferrer"
          >
            <RiMediumFill alt="Medium icon" />
          </a>
        ) : (
          ""
        )}
        {icons.icon === "behance" ? (
          <a
            href={icons.url}
            target="_blank"
            aria-label="link to Behance"
            rel="noopener noreferrer"
          >
            <RiBehanceFill alt="Behance icon" />
          </a>
        ) : (
          ""
        )}
        {icons.icon === "vk" ? (
          <a
            href={icons.url}
            target="_blank"
            aria-label="link to vk"
            rel="noopener noreferrer"
          >
            <FaVk alt="vk icon" />
          </a>
        ) : (
          ""
        )}
      </div>
    )
  })
}

export default SocialIcons
