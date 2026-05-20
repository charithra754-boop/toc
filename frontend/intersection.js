// Demo intersection: check whether strings matching a regex also belong to a simple CFL
import { parse } from './parser.js'

export function intersectDemo(input, regexText){
  const r = parse(input)
  const matches = new RegExp(regexText).test(input)
  return {inCFL: !!r.ast, inRegex: matches, input}
}
