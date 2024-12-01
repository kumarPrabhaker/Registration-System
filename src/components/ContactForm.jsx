import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ContactForm = ({ contact, setContacts, setEditContact }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: ''
    });

    // Set form data if editing an existing contact
    useEffect(() => {
        if (contact) {
            setFormData({
                name: contact.name,
                email: contact.email,
                mobile: contact.mobile
            });
        }
    }, [contact]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, email, mobile } = formData;

        try {
            let response;
            if (contact) {
                // Update existing contact
                response = await axios.put(`http://localhost:5000/api/contacts/${contact._id}`, 
                { name, email, mobile }, 
                {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
            } else {
                // Add new contact
                response = await axios.post('http://localhost:5000/api/contacts', 
                { name, email, mobile }, 
                {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
            }

            // Update the contacts list after successful operation
            setContacts(prevContacts => {
                if (contact) {
                    return prevContacts.map(c => c._id === response.data._id ? response.data : c);
                } else {
                    return [...prevContacts, response.data];
                }
            });

            // Clear form after submission and reset edit mode
            setEditContact(null);
            setFormData({ name: '', email: '', mobile: '' });

        } catch (err) {
            console.error('Error saving contact:', err);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>{contact ? 'Edit Contact' : 'Add New Contact'}</h3>
            <div>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Name"
                    required
                />
            </div>
            <div>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    required
                />
            </div>
            <div>
                <input
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="Mobile"
                    required
                />
            </div>
            <button type="submit">{contact ? 'Update Contact' : 'Add Contact'}</button>
        </form>
    );
};

export default ContactForm;
