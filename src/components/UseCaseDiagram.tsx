import type { UseCaseSlug } from '../data/content'
import { EventDiagram, HomeDiagram, OfficeDiagram } from './diagrams'

/**
 * Renders the network diagram that belongs to a use case.
 *
 * @param props.slug - which use case to draw
 */
export default function UseCaseDiagram({ slug }: { slug: UseCaseSlug }) {
  switch (slug) {
    case 'home':
      return <HomeDiagram />
    case 'office':
      return <OfficeDiagram />
    case 'events':
      return <EventDiagram />
  }
}
