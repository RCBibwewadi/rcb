"use client";
import React, { useState } from "react";

interface Contact {
  email: string;
  phone: string;
  address: string;
}

interface ContactEditorProps {
  initialData: Contact;
  onSave: (contact: Contact) => void;
}

const ContactEditor: React.FC<ContactEditorProps> = ({ initialData, onSave }) => {
  const [contact, setContact] = useState<Contact>(initialData || { email: "", phone: "", address: "" });

  return (
    <div className="glass-effect rounded-xl p-6 luxury-shadow fade-in">
      <h3 className="text-2xl font-bold text-mauve-wine mb-6">Contact Information</h3>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-mauve-wine-dark mb-2">Email Address</label>
          <input
            type="email"
            value={contact.email}
            onChange={(e) => setContact({ ...contact, email: e.target.value })}
            className="w-full px-4 py-3 border border-rose-tan-light rounded-lg focus:ring-2 focus:ring-rose-tan focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-mauve-wine-dark mb-2">Phone Number</label>
          <input
            type="text"
            value={contact.phone}
            onChange={(e) => setContact({ ...contact, phone: e.target.value })}
            className="w-full px-4 py-3 border border-rose-tan-light rounded-lg focus:ring-2 focus:ring-rose-tan focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-mauve-wine-dark mb-2">Address</label>
          <input
            type="text"
            value={contact.address}
            onChange={(e) => setContact({ ...contact, address: e.target.value })}
            className="w-full px-4 py-3 border border-rose-tan-light rounded-lg focus:ring-2 focus:ring-rose-tan focus:border-transparent"
          />
        </div>
        <button
          onClick={() => onSave(contact)}
          className="luxury-gradient text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ContactEditor;
