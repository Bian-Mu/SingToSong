interface ConfigButtonProps {
    config: Config
}


const ConfigButton: React.FC<ConfigButtonProps> = ({ config }) => {
    return (
        <div>
            {config.name}
            {config.tempo}
            {config.timeSignature}
            {config.keySignature}
        </div>
    )
}

export default ConfigButton