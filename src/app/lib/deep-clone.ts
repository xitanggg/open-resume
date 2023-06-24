/**
 * Server side deep clone util.
 * Client side can simply use structuredClone.
 */
export const deepClone = (object: { [key: string]: any }) =>
  JSON.parse(JSON.stringify(object));
