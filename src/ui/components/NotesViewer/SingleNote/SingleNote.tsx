import "./SingleNote.css"
import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

interface SingleNoteProps {
    pitchunion: PitchUnion
    config: Config
}

//1、根据2^k=cut/standard的值，如果k>0,在pitchunion.noteing底下添加k条横线，
// 如果k<0，在pitchunion.noteing右边添加standard/cut-1条有空格间隙的减号（如果sustain为false,则所有减号变成pitchunion.noteing的重复），
// 如果k=0则什么都不做；
//2、根据m=duration/(standard/cut)，如果m是整数，则将规则1的结果执行m次，
// 如果m小于1,那m一定是2^n(n为负整数)，此时在规则1的结果下添加n条横线，
// 如果m大于1,则一定是1.5、2.5、3.5等数，此时执行整数部分的次数，并在最终结果后加一个加粗的英文句号

const SingleNote: React.FC<SingleNoteProps> = ({ pitchunion, config }) => {
    const standard = config.timeSignature[1]

    const k = Math.log2(pitchunion.cut / standard);
    // 第一步：根据k值处理字符串
    const renderStep1 = () => {
        if (k > 0) {
            // 添加k条横线
            let nums: string = ""
            if (k == 2) {
                nums = "double"
            } else if (k == 3) {
                nums = "line-through overline"
            } else if (k == 4) {
                nums = "line-through overline dotted"
            }
            return (
                <Text>&nbsp;<Text style={{ textDecoration: `underline ${nums}` }}>{pitchunion.note}</Text>&nbsp;</Text>
            );
        } else if (k < 0) {
            // 添加standard/cut-1条有空格间隙的减号
            const dash = pitchunion.sustain
                ? `　─　`.repeat(standard / pitchunion.cut - 1).trim()
                : `${pitchunion.note}　`.repeat(standard / pitchunion.cut - 1).trim();
            return (
                <Text>
                    {pitchunion.note}{dash}
                </Text>
            );
        }
        if (pitchunion.note === "0") {
            return "0";
        }
        return <Text>　{pitchunion.note}　</Text>;
    };

    // 计算m值
    const m = pitchunion.duration / (standard / pitchunion.cut);

    // 第二步：根据m值处理
    const renderFinalResult = () => {
        const step1Result = renderStep1();

        if (Number.isInteger(m)) {
            // 执行m次
            if (pitchunion.sustain) {
                return (
                    <Text>
                        {step1Result}{`　─　`.repeat(m - 1).trim()}
                    </Text>
                )
            }
            if (step1Result === "0") {
                return (
                    <Text>
                        {Array(Math.floor(m)).fill(0).map((_, i) => (
                            <React.Fragment key={i}>{"　"}{step1Result}{i !== Math.floor(m) - 2 && "　"}</React.Fragment>
                        ))}
                    </Text>
                );
            }
            return (
                <div className="unsustain-repeat-note">
                    {Array(Math.floor(m)).fill(0).map((_, i) => (
                        <React.Fragment key={i}>{step1Result}</React.Fragment>
                    ))}
                </div>
            );
        } else if (m < 1) {
            const n = Math.log2(m);
            // 添加n条横线
            let nums: string = ""
            if (n == 2) {
                nums = "double"
            } else if (n == 3) {
                nums = "line-through overline"
            } else if (n == 4) {
                nums = "line-through overline dotted"
            }

            if (step1Result === "0") {
                return (<Text>{"　"}
                    <Text style={{ textDecoration: `underline ${nums}` }}>{step1Result}</Text>
                    {"　"}
                </Text>

                );
            }
            return (
                <Text style={{ textDecoration: `underline ${nums}` }}>{step1Result}</Text>
            );
        } else if (m > 1 && !Number.isInteger(m)) {
            // 处理1.5, 2.5等情况
            const integerPart = Math.floor(m);
            return (
                <Text>
                    {Array(integerPart).fill(0).map((_, i) => (
                        <React.Fragment key={i}>{step1Result}</React.Fragment>
                    ))}
                    <Text strong>.</Text>
                </Text>
            );
        }
        return step1Result;
    };

    return (
        <div className='single-note'>
            {renderFinalResult()}
        </div>
    );
}

export default SingleNote