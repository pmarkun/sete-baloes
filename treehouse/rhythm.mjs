export const RHYTHM_TICK=.32;
// Two empty beats distinguish groups; a longer rest leaves room to answer.
export function rhythmPattern(groups) {
  return [...groups.flatMap(count=>[...Array(count).fill(true),false,false]),...Array(7).fill(false)];
}
