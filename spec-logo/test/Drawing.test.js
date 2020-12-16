import React from 'react';
import ReactDOM from 'react-dom';
import { createContainerWithStore } from './domManipulators';
import * as TurtleModule from '../src/Turtle';
import { Drawing } from '../src/Drawing';
import * as StaticLinesModule from '../src/StaticLines';
import {
  horizontalLine,
  verticalLine,
  diagonalLine
} from "./sampleLines";
import {act} from 'react-dom/test-utils';
import * as AnimatedLineModule from '../src/AnimatedLine';

describe('Drawing', () => {
  let container, renderWithStore, turtleSpy;
  let store;

  beforeEach(() => {
    ({ container, renderWithStore } = createContainerWithStore());
    turtleSpy = jest.spyOn(TurtleModule, 'Turtle');
    turtleSpy.mockReturnValue(<div id="turtle" />);

    jest
      .spyOn(StaticLinesModule, 'StaticLines')
      .mockReturnValue(<div id="staticLines"/>);

    jest
      .spyOn(window, 'requestAnimationFrame');

    jest
      .spyOn(AnimatedLineModule, 'AnimatedLine')
      .mockReturnValue(<div id="animatedLine" />);
  });

  afterEach(() => {
    window.requestAnimationFrame.mockReset();

    AnimatedLineModule.AnimatedLine.mockReset();
  });

  const svg = () => container.querySelector('svg');
  const line = () => container.querySelector('line');
  const allLines = () => container.querySelectorAll('line');
  const polygon = () => container.querySelector('polygon');

  const triggerRequestAnimationFrame = time => {
    act(() => {
      const lastCall =
        window.requestAnimationFrame.mock.calls.length - 1;
      const frameFn =
        window.requestAnimationFrame.mock.calls[lastCall][0];
      frameFn(time);
    });
  };

  it('renders an svg inside div#viewport', () => {
    renderWithStore(<Drawing />, { script: { drawCommands: [] } });
    expect(
      container.querySelector('div#viewport > svg')
    ).not.toBeNull();
  });

  it('sets a viewbox of +/- 300 in either axis and preserves aspect ratio', () => {
    renderWithStore(<Drawing />, { script: { drawCommands: [] } });
    expect(svg()).not.toBeNull();
    expect(svg().getAttribute('viewBox')).toEqual(
      '-300 -300 600 600'
    );
    expect(svg().getAttribute('preserveAspectRatio')).toEqual(
      'xMidYMid slice'
    );
  });

  it('does not draw any commands for non-drawLine commands', () => {
    const unknown = { drawCommand: 'unknown' };
    renderWithStore(<Drawing />, {
      script: { drawCommands: [horizontalLine, verticalLine, unknown] }
    });

    // expect(line()).toBeNull();
    expect(StaticLinesModule.StaticLines).toHaveBeenLastCalledWith(
      {lineCommands: [horizontalLine, verticalLine]},
      expect.anything()
    )
  });

  it('renders a Turtle within the svg', () => {
    renderWithStore(<Drawing />);
    expect(
      container.querySelector('svg > div#turtle')
    ).not.toBeNull();
  });

  it('passes the turtle x, y and angle as props to Turtle', () => {
    // const turtle = { x: 10, y: 20, angle: 30 };
    renderWithStore(<Drawing />);
    expect(turtleSpy).toHaveBeenCalledWith(
      { x: 0, y: 0, angle: 0 },
      expect.anything()
    );
  });

  it('renders StaticLines within the svg', () => {
    renderWithStore(<Drawing/>);
    expect(
      container.querySelector('svg > div#staticLines')
    ).not.toBeNull();
  });

  it('does not render AnimatedLine when not moving', () => {
    renderWithStore(<Drawing />, {script: {drawCommands: []}});
    expect(AnimatedLineModule.AnimatedLine).not.toHaveBeenCalled();
  });

  describe('movement animation', () => {
    beforeEach(() => {
      renderWithStore(<Drawing/>, {
        script: {
          drawCommands: [horizontalLine],
          turtle: {x:0, y:0, angle: 0},
        }
      });
    });

    it('invokes requestAnimationFrame', () => {
      expect(window.requestAnimationFrame).toHaveBeenCalled();
    });

    it('renders an AnimatedLine with turtle at the start position when the animation' +
      'has run for 0s', () => {
        triggerRequestAnimationFrame(0);
        expect(AnimatedLineModule.AnimatedLine).toHaveBeenCalledWith(
          {
            commandToAnimate: horizontalLine,
            turtle: { x: 100, y:100, angle:0}
          },
          expect.anything()
        )
    });
  });
});
