/**
 * @typedef {Object} ResourceDef
 * @property {string} label
 * @property {number} start
 * @property {number} min
 * @property {number} max
 * @property {string} color
 */

/**
 * @typedef {Object} CrewMember
 * @property {string} id
 * @property {string} name
 * @property {string} role
 * @property {string} trait
 * @property {string} sprite
 */

/**
 * @typedef {Object} Choice
 * @property {string} id
 * @property {string} label
 * @property {string} outcome
 * @property {Object.<string, number>} effects
 * @property {string|null} next_event
 */

/**
 * @typedef {Object} GameEvent
 * @property {string} id
 * @property {string} title
 * @property {string} flavor
 * @property {string[]} crew_involved
 * @property {Choice[]} choices
 */

/**
 * @typedef {Object} Sector
 * @property {string} id
 * @property {string} label
 * @property {string} description
 * @property {string} icon
 * @property {string[]} events
 * @property {boolean} boss
 */

/**
 * @typedef {Object} WinCondition
 * @property {string} description
 * @property {Object.<string, number>} resource_thresholds
 * @property {string} win_message
 * @property {string} loss_message
 */

/**
 * @typedef {Object} GameManifest
 * @property {{ company: string, team: string, industry: string, tone: string, generated_at: string }} meta
 * @property {Object.<string, ResourceDef>} resources
 * @property {CrewMember[]} crew
 * @property {Sector[]} sectors
 * @property {GameEvent[]} events
 * @property {WinCondition} win_condition
 */
