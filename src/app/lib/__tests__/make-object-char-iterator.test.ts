import { makeObjectCharIterator } from "lib/make-object-char-iterator";

test("Simple object", () => {
  const start = { a: "" };
  const end = { a: "abc" };
  const iterator = makeObjectCharIterator(start, end);
  expect(iterator.next().value).toEqual({ a: "a" });
  expect(iterator.next().value).toEqual({ a: "ab" });
  expect(iterator.next().value).toEqual({ a: "abc" });
  expect(iterator.next().value).toEqual(undefined);
});

test("Nested object", () => {
  const start = { a: { b: "" } };
  const end = { a: { b: "abc" } };
  const iterator = makeObjectCharIterator(start, end);
  expect(iterator.next().value).toEqual({ a: { b: "a" } });
  expect(iterator.next().value).toEqual({ a: { b: "ab" } });
  expect(iterator.next().value).toEqual({ a: { b: "abc" } });
  expect(iterator.next().value).toEqual(undefined);
});
