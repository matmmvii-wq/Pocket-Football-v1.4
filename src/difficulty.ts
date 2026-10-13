export const DIFFICULTIES={easy:{label:'Easy',delay:.48,power:14,goalBias:8},normal:{label:'Regular',delay:.18,power:18,goalBias:12},hard:{label:'Hard',delay:.04,power:18.5,goalBias:16}} as const;
export type Difficulty=keyof typeof DIFFICULTIES;
export const DEFAULT_DIFFICULTY:Difficulty='hard';
