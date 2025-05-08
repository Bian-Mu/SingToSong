import { spawn } from 'child_process';
import path from 'path';

let pythonProcess: any = null;

export function startPythonServer() {
    if (pythonProcess) return;

    const pythonScriptPath = path.join('wavToPitch/api.py');
    console.log(pythonScriptPath)

    pythonProcess = spawn('python', [pythonScriptPath]);

    pythonProcess.stdout.on('data', (data: Buffer) => {
        console.log(`Python stdout: ${data.toString()}`);
    });

    pythonProcess.stderr.on('data', (data: Buffer) => {
        console.error(`Python stderr: ${data.toString()}`);
    });

    pythonProcess.on('close', (code: number) => {
        console.log(`Python process exited with code ${code}`);
        pythonProcess = null;
    });
}

export function stopPythonServer() {
    if (pythonProcess) {
        pythonProcess.kill();
        pythonProcess = null;
    }
}