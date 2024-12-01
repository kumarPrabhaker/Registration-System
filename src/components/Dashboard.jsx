import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ContactForm from './ContactForm'; 

const Dashboard = () => {
    const [contacts, setContacts] = useState([]);
    const [editContact, setEditContact] = useState(null); // Track contact to be edited
    const navigate = useNavigate();

    
    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/contacts', {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                setContacts(res.data);
            } catch (err) {
                console.error('Error fetching contacts:', err);
            }
        };

        fetchContacts();
    }, []);

    
    const handleDelete = async (id) => {
        try {
            console.log('Sending delete request for contact ID:', id);

           
            const response = await axios.delete(`http://localhost:5000/api/contacts/${id}`, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });

            console.log('Delete response:', response);

            
            if (response.status === 200) {
                console.log('Contact successfully deleted');// Remove the deleted contact from the state
                setContacts(contacts.filter(contact => contact._id !== id));
            }
        } catch (err) {
            console.error('Error deleting contact:', err.response ? err.response.data : err.message);
            alert('An error occurred while deleting the contact. Please try again.');
        }
    };

    
    const handleEdit = (contact) => {
        setEditContact(contact); 
    };

  
    const handleLogout = () => {
        localStorage.removeItem('token'); 
        navigate('/login'); 
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-content">
                <h2>Welcome to Your Dashboard</h2>

               
                <button className="logout-button" onClick={handleLogout}>Logout</button>

                <ContactForm contact={editContact} setContacts={setContacts} setEditContact={setEditContact} />

                <h3>Your Contacts</h3>
                <ul className="contacts-list">
                    {contacts.map(contact => (
                        <li key={contact._id} className="contact-item">
                            <span>{contact.name}</span> - <span>{contact.email}</span> - <span>{contact.mobile}</span>

                            <button className="edit-button" onClick={() => handleEdit(contact)}>Edit</button>
                            <button className="delete-button" onClick={() => handleDelete(contact._id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;
