import "./NoteAddBox.css"

import React, { useState } from 'react';
import { Form, InputNumber, Select, Button, message, Input } from 'antd';
import WavCreateButton from "./WavCreateButton/WavCreateButton";

interface NoteAddBoxProps {
    onRefresh: Function
}

const NoteAddBox: React.FC<NoteAddBoxProps> = ({ onRefresh }) => {
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    const onFinish = async (values: any) => {
        setIsSubmitting(true);

        const new_note: PitchUnion = {
            track: values.track,
            instrument: values.instrument,
            cut: values.cut,
            note: values.note,
            start_beat: values.start_beat,
            duration: values.duration,
            sustain: values.sustain === 'True'
        };

        try {
            const result = await window.electronAPI.writeNotes(new_note)

            if (result) {
                messageApi.success('音符添加成功');
                onRefresh()
                form.resetFields();
            } else {
                messageApi.error("出错了")
            }

        } catch (error) {
            console.error('提交出错:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
        message.error('请检查表单填写是否正确');
    };

    // 验证0.125的倍数
    const validateBeatMultiple = (_: any, value: number) => {
        if (value === undefined || value === null) {
            return Promise.reject('请输入数值');
        }
        const remainder = (value * 1000) % 125;
        if (remainder === 0) {
            return Promise.resolve();
        }
        return Promise.reject('必须是0.125的倍数');
    };

    return (
        <div>
            {contextHolder}
            <div id="params-input-box">
                <Form
                    id="params-input"
                    form={form}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                >
                    <Form.Item
                        className="singleparam-input"
                        label="音轨"
                        name="track"
                        rules={[
                            { required: true, message: '请输入track' },
                            { type: 'number', min: 0, max: 15, message: '必须在0-15之间' },
                        ]}
                    >
                        <InputNumber min={0} max={15} />
                    </Form.Item>

                    <Form.Item
                        className="singleparam-input"
                        label="音色"
                        name="instrument"
                        rules={[
                            { required: true, message: '请输入instrument' },
                            { type: 'number', min: 0, max: 127, message: '必须在0-127之间' },
                        ]}
                    >
                        <InputNumber min={0} max={127} />
                    </Form.Item>

                    <Form.Item
                        className="singleparam-input"
                        label="切分"
                        name="cut"
                        rules={[{ required: true, message: '请选择cut' }]}
                    >
                        <Select>
                            {[2, 4, 8, 16, 32].map((value) => (
                                <Select.Option key={value} value={value}>
                                    {value}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        className="singleparam-input"
                        label="音高"
                        name="note"
                        rules={[{ required: true, message: '请输入格式正确的note' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        className="singleparam-input"
                        label="起始节拍"
                        name="start_beat"
                        rules={[
                            { required: true, message: '请输入start beat' },
                            { validator: validateBeatMultiple },
                        ]}
                    >
                        <InputNumber step={0.125} min={0} />
                    </Form.Item>

                    <Form.Item
                        className="singleparam-input"
                        label="持续拍长"
                        name="duration"
                        rules={[
                            { required: true, message: '请输入duration' },
                            { validator: validateBeatMultiple },
                        ]}
                    >
                        <InputNumber step={0.125} min={0.125} />
                    </Form.Item>


                    <Form.Item
                        className="singleparam-input"
                        label="持续性"
                        name="sustain"
                        rules={[{ required: true, message: '请选择是否持续' }]}
                    >
                        <Select>
                            {['True', 'False'].map((value) => (
                                <Select.Option key={value} value={value}>
                                    {value}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                </Form>
                <div id="function-buttons">
                    <div id="wav-create-button">
                        <WavCreateButton />
                    </div>
                    <div id="params-submitbutton">
                        <Button
                            htmlType="submit"
                            loading={isSubmitting}
                            onClick={() => form.submit()}
                        >
                            添加音符
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NoteAddBox;