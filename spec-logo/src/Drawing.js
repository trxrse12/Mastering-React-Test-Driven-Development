import React, {useEffect, useState} from 'react';
import { connect } from 'react-redux';
import { StaticLines } from "./StaticLines";
import {Turtle} from "./Turtle";
import {AnimatedLine} from "./AnimatedLine";

const isDrawLineCommand = command =>
  command.drawCommand === 'drawLine';
const isRotateCommand = command =>
  command.drawCommand === 'rotate';

const distance = ({x1, y1, x2, y2}) => Math.sqrt(
  (x2 - x1)**2 + (y2 - y1)**2
);
const movementSpeed = 5;
const rotateSpeed = 1000 / 180; // (milliseconds / degrees)

const mapStateToProps = ({
  script: { drawCommands }
}) => ({ drawCommands });
const mapDispatchToProps = _ => ({});

export const Drawing = connect(
  mapStateToProps,
  mapDispatchToProps
)(({ drawCommands }) => {
  const [animatingCommandIndex, setAnimatingCommandIndex] = useState(0);
  const [turtle, setTurtle] = useState({x:0, y:0, angle: 0});

  const lineCommands = drawCommands
    .slice(0, animatingCommandIndex)
    .filter(isDrawLineCommand);

  // I need two validation vars
  const commandToAnimate = drawCommands[animatingCommandIndex];
  const isDrawingLine =
    commandToAnimate && isDrawLineCommand(commandToAnimate);
  const isRotating =
    commandToAnimate && isRotateCommand(commandToAnimate);

  useEffect(() => {
    let start, duration, cancelToken;

    // handler for drawings
    const handleDrawLineFrame = time => {
      if (start === undefined) start = time;
      if (time < start + duration){ // animate only for the max duration
        const elapsed = time - start;
        const {x1, x2, y1, y2} = commandToAnimate;
        setTurtle(turtle => ({
          ...turtle,
          x: x1 + ((x2-x1) * (elapsed/duration)),
          y: y1 + (( y2 - y1) * (elapsed/duration)),
        }));
        cancelToken = requestAnimationFrame(handleDrawLineFrame)
      } else {
        setAnimatingCommandIndex(
          animatingCommandIndex => animatingCommandIndex + 1
        )
      }
    };

    // handler for rotations
    const handleRotationFrame = time => {
      if (start === undefined) start = time;
      if (time < start + duration) {
        const elapsed = time - start;
        const {previousAngle, newAngle} = commandToAnimate;
        setTurtle(turtle => ({
          ...turtle,
          angle:
            previousAngle + (newAngle - previousAngle)* (elapsed/duration)
        }));
      } else {
        setTurtle(turtle => ({
          ...turtle,
          angle: commandToAnimate.newAngle
        }));
        setAnimatingCommandIndex(animatingCommandIndex => animatingCommandIndex +1)
      }
    };

    if (isDrawingLine){
      // If it really needs to draw an animated line,
        // then first calculate the duration of the animation
      // console.log('turtle', turtle)
      // console.log('commandToAnimate=', commandToAnimate)
      duration = movementSpeed * distance(commandToAnimate);

      cancelToken = requestAnimationFrame(handleDrawLineFrame);

      // then pass into the requestAnimationFrame a callback (that will be executed
        // next render) and pass into it a time, so that the cb will next time use
        // (together with the the calcuated duration) to set the new turtle position
      requestAnimationFrame(handleDrawLineFrame)
    } else if (isRotating) {
      duration = rotateSpeed * Math.abs(
        commandToAnimate.newAngle - commandToAnimate.previousAngle
      );
      requestAnimationFrame(handleRotationFrame)
    }

    return () => {
      if (cancelToken){
        cancelAnimationFrame(cancelToken);
      }
    }
  }, [commandToAnimate, isDrawingLine, isRotating]);

  return (
    <div id="viewport">
      <svg
        viewBox="-300 -300 600 600"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg">
        <StaticLines lineCommands={lineCommands}/>
        {isDrawingLine ? (
          <AnimatedLine
            commandToAnimate={commandToAnimate}
            turtle={turtle}
          />
        ) : null}
        <Turtle {...turtle} />
      </svg>
    </div>
  );
});
