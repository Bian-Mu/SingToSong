import "./ConfigButton.css"

interface ConfigButtonProps {
    config: Config
}


const ConfigButton: React.FC<ConfigButtonProps> = ({ config }) => {
    return (
        <>
            <div id="config-name">
                {config.name}
            </div>
            <div id="config-other">
                <p> 首调：1={config.keySignature}</p>
                <p> 拍号：{config.timeSignature[0]} / {config.timeSignature[1]}</p>
                <p> 拍速：{config.tempo}</p>
            </div>
        </>
    )
}

export default ConfigButton