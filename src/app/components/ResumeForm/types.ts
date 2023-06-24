export type CreateHandleChangeArgsWithDescriptions<T> =
  | [field: Exclude<keyof T, "descriptions">, value: string]
  | [field: "descriptions", value: string[]];
