export function filterSongs(songName: string): [string, string] | false {
  const regex = /^([^_]+)_([^_]+)\.pptx$/i;
  const match = songName.match(regex);

  if (match) {
    const [, part1, part2] = match;
    return [part1, part2];
  }

  return false;
}

export function filterSongNames(songName: string): [string, string] | false {
  const regex = /^([^_]+)_([^_]+)$/i;
  const match = songName.match(regex);

  if (match) {
    const [, part1, part2] = match;
    return [part1, part2];
  }

  return false;
}
