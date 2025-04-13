const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

// Temporary directory for code files
const TEMP_DIR = path.join(__dirname, '../temp');

router.post('/compile', async (req, res) => {
    const { code, language } = req.body;
    const timestamp = Date.now();
    const filename = `code_${timestamp}`;

    try {
        // Create temp directory if it doesn't exist
        await fs.mkdir(TEMP_DIR, { recursive: true });

        let command;
        let sourceFile;
        let outputFile;

        switch (language) {
            case 'python':
                sourceFile = path.join(TEMP_DIR, `${filename}.py`);
                await fs.writeFile(sourceFile, code);
                command = `python "${sourceFile}"`;
                break;

            case 'javascript':
                sourceFile = path.join(TEMP_DIR, `${filename}.js`);
                await fs.writeFile(sourceFile, code);
                command = `node "${sourceFile}"`;
                break;

            case 'java':
                sourceFile = path.join(TEMP_DIR, `Main.java`);
                await fs.writeFile(sourceFile, code);
                command = `javac "${sourceFile}" && java -cp "${TEMP_DIR}" Main`;
                break;

            case 'cpp':
                sourceFile = path.join(TEMP_DIR, `${filename}.cpp`);
                outputFile = path.join(TEMP_DIR, `${filename}.exe`);
                await fs.writeFile(sourceFile, code);
                command = `g++ "${sourceFile}" -o "${outputFile}" && "${outputFile}"`;
                break;

            default:
                return res.status(400).json({ success: false, error: 'Unsupported language' });
        }

        exec(command, { timeout: 5000 }, async (error, stdout, stderr) => {
            // Cleanup temporary files
            try {
                await fs.unlink(sourceFile);
                if (outputFile) await fs.unlink(outputFile);
            } catch (cleanupError) {
                console.error('Cleanup error:', cleanupError);
            }

            if (error) {
                return res.json({
                    success: false,
                    error: stderr || error.message
                });
            }

            res.json({
                success: true,
                output: stdout
            });
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error: ' + error.message
        });
    }
});

module.exports = router;