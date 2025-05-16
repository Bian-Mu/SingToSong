import "./NoteAddBox.css"

import React, { useState } from 'react';
import { Form, InputNumber, Select, Button, message, Input } from 'antd';
import WavCreateButton from "./WavCreateButton/WavCreateButton";


const NoteAddBox: React.FC = () => {
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onFinish = (values: any) => {
        setIsSubmitting(true);
        console.log('Form values:', values);
        // 这里可以添加提交逻辑
        message.success('提交成功！');
        setIsSubmitting(false);
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
                        <Select defaultValue={`4`}>
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
                        <Input defaultValue={`C4`} />
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