import { DOWNLOADS, detectPlatform } from '../config/site'

/**
 * Download buttons for each supported platform. The visitor's platform, when detected,
 * is listed first and highlighted.
 */
export default function DownloadButtons() {
  const detected = detectPlatform(typeof navigator === 'undefined' ? '' : navigator.userAgent)
  const ordered = [...DOWNLOADS].sort((a, b) => Number(b.platform === detected) - Number(a.platform === detected))
  return (
    <ul className="download-list">
      {ordered.map((option) => (
        <li key={option.platform} className="download-card">
          <a
            className={`button${option.platform === detected ? '' : ' button--secondary'}`}
            href={option.url}
            rel="noreferrer"
          >
            {option.label}
          </a>
          <span className="download-card__req">{option.requirement}</span>
        </li>
      ))}
    </ul>
  )
}
