import { Pen } from '@topology/core';
import { interfaceClass } from './interfaceClass';
import { simpleClass } from './simpleClass';

export function classPens(): Record<
  string,
  (pen: Pen, ctx?: CanvasRenderingContext2D) => Path2D
> {
  return {
    interfaceClass,
    simpleClass,
  };
}
