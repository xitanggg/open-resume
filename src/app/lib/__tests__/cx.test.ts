import { cx } from "lib/cx";

test("cx", () => {
  expect(cx("px-1", "mt-2")).toEqual("px-1 mt-2");
  expect(cx("px-1", true && "mt-2")).toEqual("px-1 mt-2");
  expect(cx("px-1", false && "mt-2")).toEqual("px-1");
});
