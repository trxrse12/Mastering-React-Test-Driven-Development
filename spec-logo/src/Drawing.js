import React, {useEffect, useState} from 'react';
import { connect } from 'react-redux';
import { StaticLines } from "./StaticLines";
import {Turtle} from "./Turtle";
import {AnimatedLine} from "./AnimatedLine";

const isDrawLineCommand = command =>
  command.drawCommand === 'drawLine';

const mapStateToProps = ({
  script: { drawCommands }
}) => ({ drawCommands });
const mapDispatchToProps = _ => ({});
export const Drawing = connect(
  mapStateToProps,
  mapDispatchToProps
)(({ drawCommands }) => {
  const lineCommands = drawCommands.filter(isDrawLineCommand);

  // I need two validation vars
  const commandToAnimate = drawCommands[0];
  const isDrawingLine =
    commandToAnimate && isDrawLineCommand(commandToAnimate);

  const [turtle, setTurtle] = useState({x:0, y:0, angle: 0});


  useEffect(() => {
    const handleDrawLineframe = time => {
      setTurtle(turtle => {
        return ({
          ...turtle,
          x: commandToAnimate.x1,
          y: commandToAnimate.y1,
        })
      });
    };
    if (isDrawingLine){
      requestAnimationFrame(handleDrawLineframe)
    }
  }, [commandToAnimate, isDrawingLine]);

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
