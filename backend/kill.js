const { execSync } = require('child_process');
try {
    const output = execSync('netstat -ano | findstr :5000').toString();
    const lines = output.split('\n').filter(line => line.includes('LISTENING'));
    for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0') {
            console.log(`Killing PID ${pid}`);
            execSync(`taskkill /F /PID ${pid}`);
        }
    }
} catch (e) {
    console.log('No process found or error', e.message);
}
