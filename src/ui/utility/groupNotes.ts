export function groupUnionsIntoMeters(unions: PitchUnion[], meters: number): { groupedUnions: PitchUnion[], groupNumbers: number[] } {
    if (meters <= 0) throw new Error("meters must be positive");

    // 1. 按 start 排序所有区间
    const sortedUnions = [...unions].sort((a, b) => a.start_beat - b.start_beat);

    const result: PitchUnion[] = [];
    const groupNumbers: number[] = [];

    let currentPos = 0;
    let unionIndex = 0;
    const totalEnd = getTotalEnd(sortedUnions);

    // 2. 计算需要覆盖的总长度（向上取整到 meters 的倍数）
    const totalGroups = Math.ceil(Math.max(totalEnd, currentPos) / meters);
    const totalCoverage = totalGroups * meters;

    while (currentPos < totalCoverage) {
        const groupStart = Math.floor(currentPos / meters) * meters;
        const groupEnd = groupStart + meters;

        // 情况1：当前位置在当前 union 之前 → 填充空白
        if (unionIndex < sortedUnions.length && currentPos < sortedUnions[unionIndex].start_beat) {
            const fillEnd = Math.min(sortedUnions[unionIndex].start_beat, groupEnd);
            const fillDuration = fillEnd - currentPos;

            if (fillDuration > 0) {
                result.push({
                    start_beat: currentPos,
                    duration: fillDuration,
                    note: "0",
                    cut: 4,
                    track: unions[0].track,
                    sustain: false,
                    instrument: 0
                });
                groupNumbers.push(Math.floor(currentPos / meters));
            }
            currentPos = fillEnd;
        }
        // 情况2：处理当前 union
        else if (unionIndex < sortedUnions.length) {
            const union = sortedUnions[unionIndex];
            result.push({ ...union });
            groupNumbers.push(Math.floor(union.start_beat / meters));
            currentPos = union.start_beat + union.duration;
            unionIndex++;
        }
        // 情况3：所有 union 处理完毕 → 填充剩余空白
        else {
            const fillEnd = groupEnd;
            const fillDuration = fillEnd - currentPos;

            if (fillDuration > 0) {
                result.push({
                    start_beat: currentPos,
                    duration: fillDuration,
                    note: "0",
                    cut: 4,
                    track: unions[0].track,
                    sustain: false,
                    instrument: 0
                });
                groupNumbers.push(Math.floor(currentPos / meters));
            }
            currentPos = fillEnd;
        }
    }

    return { groupedUnions: result, groupNumbers };
}

function getTotalEnd(unions: PitchUnion[]): number {
    return unions.length === 0 ? 0 : unions[unions.length - 1].start_beat + unions[unions.length - 1].duration;
}