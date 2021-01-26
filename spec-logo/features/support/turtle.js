
// test helper needed to calculate the turtle center of gravity
// An input to this function I have an SVG polygon:
//  <polygon
//    points="-5,5,0,-7,5,5"
//    fill="green"
//    stroke-width="2"
//    stroke="black"
//    transform="rotate(90,0,0) />
export const calculateTurtleXYFromPoints = points => {
  const firstComma = points.indexOf(',');
  const secondComma = points.indexOf(',', firstComma +1);
  return {
    x: parseFloat(points.substring(0, firstComma)) + 5,
    y: parseFloat(points.substring(firstComma + 1, secondComma)) - 5,
  }
};

// test helper to get the turtle true 0 (horizontal axis)
export const calculateTurtleAngleFromTransform = transform => {
  const firstParen = transform.indexOf('(');
  const firstComma = transform.indexOf(',');
  return (
    parseFloat(transform.substring(firstParen + 1, firstComma)) - 90
  )
};