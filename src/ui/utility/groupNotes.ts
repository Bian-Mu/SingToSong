export function groupUnionsIntoMeters(pithcunions: PitchUnion[], meters: number): { groupedUnions: PitchUnion[], groupNumbers: number[] } {
    // First, sort the unions by their start time
    const sortedUnions = [...pithcunions].sort((a, b) => a.start_beat - b.start_beat);

    const result: PitchUnion[] = [];
    const groupNumbers: number[] = [];

    let currentPos = 0;
    let unionIndex = 0;

    while (unionIndex < sortedUnions.length || currentPos < getTotalEnd(sortedUnions)) {
        const currentGroupStart = Math.floor(currentPos / meters) * meters;
        const currentGroupEnd = currentGroupStart + meters;

        // Check if we're before the next union
        if (unionIndex < sortedUnions.length && currentPos < sortedUnions[unionIndex].start_beat) {
            const gapStart = currentPos;
            const gapEnd = Math.min(sortedUnions[unionIndex].start_beat, currentGroupEnd);
            const gapDuration = gapEnd - gapStart;

            if (gapDuration > 0) {
                result.push({
                    start_beat: gapStart,
                    duration: gapDuration,
                    note: "0",
                    cut: 4,
                    track: pithcunions[0].track,
                    sustain: false,
                    instrument: 0
                });
                groupNumbers.push(Math.floor(gapStart / meters));
                currentPos = gapEnd;
            }
        }
        // Process the current union
        else if (unionIndex < sortedUnions.length) {
            const union = sortedUnions[unionIndex];
            result.push({ ...union });
            groupNumbers.push(Math.floor(union.start_beat / meters));
            currentPos = union.start_beat + union.duration;
            unionIndex++;
        }
        // Fill any remaining space after the last union
        else {
            const gapStart = currentPos;
            const gapEnd = currentGroupEnd;
            const gapDuration = gapEnd - gapStart;

            if (gapDuration > 0) {
                result.push({
                    start_beat: gapStart,
                    duration: gapDuration,
                    note: "0",
                    cut: 4,
                    track: pithcunions[0].track,
                    sustain: false,
                    instrument: 0

                });
                groupNumbers.push(Math.floor(gapStart / meters));
                currentPos = gapEnd;
            } else {
                currentPos = currentGroupEnd;
            }
        }
    }

    return {
        groupedUnions: result,
        groupNumbers: groupNumbers
    };
}

function getTotalEnd(unions: PitchUnion[]): number {
    if (unions.length === 0) return 0;
    const lastUnion = unions[unions.length - 1];
    return lastUnion.start_beat + lastUnion.duration;
}

