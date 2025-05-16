import { Button, message } from "antd"

const WavCreateButton: React.FC = () => {
    const [messageApi, contextHolder] = message.useMessage();

    const onClick = async () => {
        const result = await window.electronAPI.processMidi()
        if (result) {
            messageApi.success("创建成功")
        } else {
            messageApi.error("出错了")
        }
    }

    return (
        <>
            {contextHolder}
            <Button onClick={() => onClick()} >
                生成音频
            </Button>
        </>

    )
}

export default WavCreateButton