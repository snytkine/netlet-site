/**
 * Runs before React DOM is loaded.
 *
 * jsdom has no AnimationEvent. Without it React listens for the legacy "webkitAnimationEnd"
 * event instead of "animationend", so `onAnimationEnd` handlers (the page transition) would
 * never see the events that tests, and real browsers, fire.
 */
if (!('AnimationEvent' in window)) {
  Object.defineProperty(window, 'AnimationEvent', { value: class AnimationEvent extends Event {}, writable: true })
}
