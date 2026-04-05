/**
 *  ______                _
 * |  ____|              | |
 * | |__   _____   _____| |_
 * |  __| / _ \ \ / / _ \ __|
 * | |___|  __/\ V /  __/ |_
 * |______\___| \_/ \___|\__|
 *
 * Event Utilities - The Event Orchestrators
 *
 * @module EventUtils
 * @internal
 *
 * 🎭 These utilities are like the conductors of your app -
 *    they orchestrate the perfect symphony of events! 🎼
 */
export const EventEmitterDefaultConfigOptions = {
  // set this to `true` to use wildcards
  wildcard: false,
  // the delimiter used to segment namespaces
  delimiter: '.',
  // set this to `true` if you want to emit the newListener event
  newListener: false,
  // set this to `true` if you want to emit the removeListener event
  removeListener: false,
  // the maximum amount of listeners that can be assigned to an event
  maxListeners: 10,
  // show event name in memory leak message when more than maximum amount of listeners is assigned
  verboseMemoryLeak: false,
  // disable throwing uncaughtException if an error event is emitted, and it has no listeners
  ignoreErrors: false,
};
