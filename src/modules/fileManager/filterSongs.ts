export function filterSongs(
  songName: string
): [string] | [string, string] | false {
  const twoParts = /^([^_]+)_([^_]+)\.pptx$/i;
  const onePart = /^([^_]+)\.pptx$/i;

  let match = songName.match(twoParts);
  if (match) {
    const [, part1, part2] = match;
    return [part1, part2];
  }

  match = songName.match(onePart);
  if (match) {
    const [, part1] = match;
    return [part1];
  }

  return false;
}

export function filterSongNames(
  songName: string
): [string] | [string, string] | false {
  const twoParts = /^([^_]+)_([^_]+)$/i;
  const onePart = /^([^_]+)$/i;

  let match = songName.match(twoParts);
  if (match) {
    const [, part1, part2] = match;
    return [part1, part2];
  }

  match = songName.match(onePart);
  if (match) {
    const [, part1] = match;
    return [part1];
  }

  return false;
}
