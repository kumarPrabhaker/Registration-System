const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(express.json());
app.use(cors()); 

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);


const ContactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});
const Contact = mongoose.model('Contact', ContactSchema);


const authMiddleware = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// Register User Route
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body; // Ensure name is here
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ msg: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: newUser._id, name: newUser.name, email: newUser.email } });
    } catch (err) {
        console.error('Registration error:', err.message);
        res.status(500).send('Server Error');
    }
});


app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    

    console.log('Login request received:', { email, password });

    if (!email || !password) {
        return res.status(400).json({ msg: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found for email:', email);
            return res.status(400).json({ msg: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password does not match for user:', email);
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
    
        console.error('Login error:', err.message);
        res.status(500).send('Server Error');
    }
});


// Add Contact Route
app.post('/api/contacts', authMiddleware, async (req, res) => {
    const { name, email, mobile } = req.body;
    try {
        const newContact = new Contact({
            name,
            email,
            mobile,
            user: req.user.id
        });
        await newContact.save();
        res.json(newContact);
    } catch (err) {
        console.error('Error adding contact:', err.message);
        res.status(500).send('Server Error');
    }
});

// Get Contacts Route
app.get('/api/contacts', authMiddleware, async (req, res) => {
    try {
        const contacts = await Contact.find({ user: req.user.id });
        res.json(contacts);
    } catch (err) {
        console.error('Error fetching contacts:', err.message);
        res.status(500).send('Server Error');
    }
});


// Edit Contact Route
app.put('/api/contacts/:id', authMiddleware, async (req, res) => {
    const { name, email, mobile } = req.body;
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) return res.status(404).json({ msg: 'Contact not found' });

        if (contact.user.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'You are not authorized to edit this contact' });
        }

        contact.name = name || contact.name;
        contact.email = email || contact.email;
        contact.mobile = mobile || contact.mobile;

        await contact.save();
        res.json(contact);
    } catch (err) {
        console.error('Error editing contact:', err.message);
        res.status(500).send('Server Error');
    }
});



app.delete('/api/contacts/:id', authMiddleware, async (req, res) => {
    const contactId = req.params.id;
    console.log('Attempting to delete contact with ID:', contactId);

    try {
        
        if (!mongoose.Types.ObjectId.isValid(contactId)) {
            console.log('Invalid contact ID format');
            return res.status(400).json({ msg: 'Invalid contact ID format' });
        }

       
        const contact = await Contact.findById(contactId);
        console.log('Found contact:', contact);

        if (!contact) {
            console.log('Contact not found');
            return res.status(404).json({ msg: 'Contact not found' });
        }

        
        if (contact.user.toString() !== req.user.id) {
            console.log('Unauthorized attempt to delete contact');
            return res.status(403).json({ msg: 'You are not authorized to delete this contact' });
        }

        
        await Contact.deleteOne({ _id: contactId });
        console.log('Contact successfully removed');
        res.json({ msg: 'Contact removed' });
    } catch (err) {
        console.error('Error deleting contact:', err.message); // Log the full error message
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
