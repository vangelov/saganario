
export default function collectPaths(scenario, collectedPaths, path = [], index = 0) {
  let i = 0;
  let nextIndex = index;

  for (; i < scenario.length; i += 1, nextIndex += 1) {
    const { givenValue } = scenario[i];

    if (givenValue !== undefined) {
      break;
    }

    path[nextIndex] = scenario[i];
  }

  if (i === scenario.length && nextIndex > 0) {
    const newPath = path.slice(0, nextIndex);
    collectedPaths.push(newPath);
  }

  nextIndex -= 1;

  for (; i < scenario.length; i += 2) {
    path[nextIndex] = {
      ...path[nextIndex],
      givenValue: scenario[i].givenValue,
    };

    collectPaths(scenario[i + 1], collectedPaths, path, nextIndex + 1);
  }
}
