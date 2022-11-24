

export type FloatOption = {
  type: "FLOAT_OPTION"
  name: string,
  value: number,
  min: number,
  max: number,
}

export type SelectOption = {
  type: "SELECT_OPTION"
  name: string,
  value: string,
  options: string[],
}

export type IntOption = {
  type: "INT_OPTION"
  name: string,
  value: number,
  min: number,
  max: number,
}

export type BooleanOption = {
  type: "BOOL_OPTION"
  name: string,
  value: boolean,
}

export type Option = FloatOption | SelectOption | IntOption | BooleanOption