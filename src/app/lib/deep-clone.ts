/**
 * Server side object deep clone util using JSON serialization.
 * Not efficient for large objects but good enough for most use cases.
 *
 * Client side can simply use structuredClone.
 */
export const deepClone = <T extends { [key: string]: any }>(object: T) =>
  JSON.parse(JSON.stringify(object)) as T;
