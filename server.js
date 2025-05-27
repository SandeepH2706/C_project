const express = require('express');
const session = require('express-session');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const app = express();

// Session configuration
app.use(session({
    secret: 'prescription-system-secret-key-2025',
    resave: false,                                                           //session store
    saveUninitialized: false,                                                //Prevents empty session objects from being stored
    cookie: {                                                                //Only set to false during development when not using HTTPS
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Middleware for API,url,static files
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to get executable name with proper extension
function getExecutableName(name) {
    return os.platform() === 'win32' ? `${name}.exe` : name;
}

// Helper function to execute C programs
function executeC(program, args = [],input = '') { 
    return new Promise((resolve, reject) => {                            //Promise Wrapper for Child Process Execution
        const executableName = getExecutableName(program);
        const executablePath = path.join(__dirname, 'c-bin', executableName);
        
        if (!fs.existsSync(executablePath)) {
            reject(new Error(`Executable not found: ${executablePath}`));
            return;
        }
        
        const child = spawn(executablePath, args);
        
        let output = '';
        let error = '';
        //The parent process can read them via child.stderr.on('data', callback).
        child.stdout.on('data', data => output += data.toString());
        child.stderr.on('data', data => error += data.toString());
        
        if (input) {
            child.stdin.write(input);
            child.stdin.end();
        }
        
        child.on('close', code => {
            if (code === 0) {
                resolve(output);
            } else {
                reject(new Error(error || `Process exited with code ${code}`));
            }
        });
        
        child.on('error', (err) => {
            reject(new Error(`Failed to start process: ${err.message}`));
        });
    });
}

// Routes

// Root route - serve login page
app.get('/', (req, res) => {
    if (req.session.user) {
        if (req.session.isAdmin) {
            return res.redirect('/add');
        } else {
            return res.redirect('/view');
        }
    }
    res.sendFile(path.join(__dirname, 'public/html/login.html'));
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        await executeC('auth-check', [
            path.join(__dirname, 'users.txt'), 
            username, 
            password
        ]);
        
        req.session.user = username;
        req.session.isAdmin = (username.toLowerCase() === 'admin');
        
        res.json({ 
            success: true, 
            isAdmin: req.session.isAdmin,
            message: 'Login successful'
        });
    } catch (error) {
        console.error('Login error:', error.message);
        const isUserNotFound = error.message.includes('not found') || error.message.includes('User');
        
        res.status(401).json({ 
            error: 'Login failed', 
            code: isUserNotFound ? 2 : 1,
            message: isUserNotFound ? 'User not found' : 'Invalid credentials'
        });
    }
});

// Signup endpoint
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        await executeC('auth-signup', [
            path.join(__dirname, 'users.txt'), 
            username, 
            password
        ]);
        
        res.json({ success: true, message: 'Signup successful' });
    } catch (error) {
        console.error('Signup error:', error.message);
        res.status(400).json({ 
            error: 'Signup failed', 
            message: error.message.includes('already exists') ? 
                     'Username already exists' : 'Signup failed'
        });
    }
});

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    next();
};

// Admin-only middleware
const requireAdmin = (req, res, next) => {
    if (!req.session.user || !req.session.isAdmin) {
        return res.status(403).send('Admin access required');
    }
    next();
};

// Protected page routes
app.get('/add', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

app.get('/view', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/view-index.html'));
});

app.get('/delete', requireAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/delete-index.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/signup.html'));
});

// Prescription data endpoint with role-based filtering
app.get('/prescriptions.txt', requireAuth, (req, res) => {
    fs.readFile(path.join(__dirname, 'prescriptions.txt'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error loading prescriptions');
        }
        
        if (!req.session.isAdmin && req.session.user) {
            // Filter prescriptions for current user only
            const lines = data.trim().split('\n').filter(line => 
                line.trim() && line.startsWith(req.session.user + '|')
            );
            res.send(lines.join('\n'));
        } else {
            // Admin sees all prescriptions
            res.send(data);
        }
    });
});

// Add prescription endpoint
app.post('/add-prescription', requireAuth, async (req, res) => {
    const { patient, medicines } = req.body;
    
    if (!patient || !medicines || medicines.length === 0) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    let input = `${patient}\n${medicines.length}\n`;
    medicines.forEach(med => {
        input += `${med.name}\n${med.dosage}\n${med.schedule}\n`;
    });
    
    try {
        await executeC('add-prescription', [], input);
        res.json({ success: true, message: 'Prescription added successfully' });
    } catch (error) {
        console.error('Add prescription error:', error.message);
        res.status(500).json({ error: 'Failed to save prescription' });
    }
});

// Delete prescription endpoint (admin only)
app.post('/delete', requireAdmin, async (req, res) => {
    const { name, date } = req.body;
    
    if (!name || !date) {
        return res.status(400).json({ error: 'Missing patient name or date' });
    }
    
    try {
        await executeC('delete-prescription', [name, date]);
        res.json({ message: 'Prescription deleted successfully' });
    } catch (error) {
        console.error('Delete prescription error:', error.message);
        res.status(500).json({ error: 'Failed to delete prescription' });
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

app.use((req, res) => {
    res.status(404).send('Page not found');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Serving static files from: ${path.join(__dirname, 'public')}`);
    console.log(`💾 Data files: users.txt, prescriptions.txt`);
    console.log(`🔧 C executables: ${path.join(__dirname, 'c-bin')}`);
    
    // Check if executables exist
    const executables = ['auth-check', 'auth-signup', 'add-prescription', 'delete-prescription'];
    executables.forEach(exe => {
        const fullPath = path.join(__dirname, 'c-bin', getExecutableName(exe));
        if (fs.existsSync(fullPath)) {
            console.log(`✅ ${exe} found`);
        } else {
            console.log(`❌ ${exe} NOT found at ${fullPath}`);
        }
    });
});
