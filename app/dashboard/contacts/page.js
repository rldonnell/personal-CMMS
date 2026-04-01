'use client';

import { useState, useEffect } from 'react';
// Inline icon components (no external dependency)
function PencilIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
    </svg>
  );
}
function TrashIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

const CATEGORY_ICONS = {
  hvac: '🌡️',
  'water-heater': '🔥',
  pool: '🏊',
  plumbing: '🔧',
  electrical: '⚡',
  septic: '🪣',
  'roof-gutters': '🏠',
  appliances: '🧺',
  exterior: '🛡️',
  'garage-door': '🚗',
  irrigation: '💧',
};

function ContactForm({ contact, categories, onSave, onCancel, loading }) {
  const [formData, setFormData] = useState(
    contact || {
      name: '',
      company: '',
      phone: '',
      email: '',
      categoryId: '',
      specialty: '',
      notes: '',
    }
  );

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Name *"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fw-navy"
      />
      <input
        type="text"
        placeholder="Company"
        value={formData.company}
        onChange={(e) => handleChange('company', e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fw-navy"
      />
      <input
        type="tel"
        placeholder="Phone"
        value={formData.phone}
        onChange={(e) => handleChange('phone', e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fw-navy"
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fw-navy"
      />
      <select
        value={formData.categoryId}
        onChange={(e) => handleChange('categoryId', e.target.value ? parseInt(e.target.value) : '')}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fw-navy"
      >
        <option value="">Select a category...</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Specialty (e.g. emergency service, 24/7)"
        value={formData.specialty}
        onChange={(e) => handleChange('specialty', e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fw-navy"
      />
      <textarea
        placeholder="Notes"
        value={formData.notes}
        onChange={(e) => handleChange('notes', e.target.value)}
        rows="3"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fw-navy"
      />
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-fw-navy text-white px-4 py-2 rounded-lg font-medium hover:bg-fw-navy-dark transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : contact ? 'Update' : 'Add'} Contact
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function ContactCard({ contact, categories, onEdit, onDelete, onDeleting }) {
  const categoryName = contact.category_name || 'Uncategorized';
  const icon = contact.category_slug ? CATEGORY_ICONS[contact.category_slug] : '📋';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-2xl">{icon}</span>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">{contact.name}</h3>
            {contact.company && <p className="text-sm text-gray-600">{contact.company}</p>}
            <span className="inline-block text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded mt-2">
              {categoryName}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(contact)}
            className="p-2 text-gray-500 hover:text-fw-navy hover:bg-gray-50 rounded-lg transition"
            title="Edit"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(contact.id)}
            disabled={onDeleting === contact.id}
            className="p-2 text-gray-500 hover:text-fw-red hover:bg-gray-50 rounded-lg transition disabled:opacity-50"
            title="Delete"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {contact.phone && (
          <div>
            <p className="text-gray-500">Phone</p>
            <a href={`tel:${contact.phone}`} className="text-fw-navy hover:underline font-medium">
              {contact.phone}
            </a>
          </div>
        )}
        {contact.email && (
          <div>
            <p className="text-gray-500">Email</p>
            <a href={`mailto:${contact.email}`} className="text-fw-navy hover:underline font-medium">
              {contact.email}
            </a>
          </div>
        )}
        {contact.specialty && (
          <div>
            <p className="text-gray-500">Specialty</p>
            <p className="text-gray-800">{contact.specialty}</p>
          </div>
        )}
        {contact.notes && (
          <div>
            <p className="text-gray-500">Notes</p>
            <p className="text-gray-800">{contact.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchContacts();
    fetchCategories();
  }, []);

  async function fetchContacts() {
    try {
      const res = await fetch('/api/contacts');
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const res = await fetch('/api/settings/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }

  async function handleSave(formData) {
    setFormLoading(true);
    try {
      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId ? `/api/contacts/${editingId}` : '/api/contacts';
      const payload = {
        name: formData.name,
        company: formData.company || null,
        phone: formData.phone || null,
        email: formData.email || null,
        categoryId: formData.categoryId || null,
        specialty: formData.specialty || null,
        notes: formData.notes || null,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchContacts();
        setShowForm(false);
        setEditingId(null);
      } else {
        alert('Failed to save contact');
      }
    } catch (error) {
      console.error('Error saving contact:', error);
      alert('Error saving contact');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchContacts();
      } else {
        alert('Failed to delete contact');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Error deleting contact');
    } finally {
      setDeleting(null);
    }
  }

  const contactsByCategory = categories.map((cat) => ({
    ...cat,
    contacts: contacts.filter((c) => c.category_id === cat.id),
  }));

  const uncategorized = contacts.filter((c) => !c.category_id);

  if (loading) {
    return <div className="animate-pulse text-gray-400 p-8">Loading contacts...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Service Provider Contacts</h1>
        <button
          onClick={() => {
            setEditingId(null);
            setShowForm(!showForm);
          }}
          className="bg-fw-navy text-white px-5 py-2 rounded-lg font-medium hover:bg-fw-navy-dark transition"
        >
          {showForm ? 'Cancel' : '+ Add Contact'}
        </button>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {editingId ? 'Edit Contact' : 'New Contact'}
          </h2>
          <ContactForm
            contact={editingId ? contacts.find((c) => c.id === editingId) : null}
            categories={categories}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingId(null);
            }}
            loading={formLoading}
          />
        </div>
      )}

      {/* Contacts grid by category */}
      {contactsByCategory.length === 0 && uncategorized.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No contacts yet. Add one to get started!</p>
        </div>
      ) : (
        <>
          {contactsByCategory.map((cat) =>
            cat.contacts.length > 0 ? (
              <div key={cat.id} className="mb-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <span>{CATEGORY_ICONS[cat.slug] || '📋'}</span>
                  {cat.name}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cat.contacts.map((contact) => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      categories={categories}
                      onEdit={(c) => {
                        setEditingId(c.id);
                        setShowForm(true);
                      }}
                      onDelete={handleDelete}
                      onDeleting={deleting}
                    />
                  ))}
                </div>
              </div>
            ) : null
          )}

          {uncategorized.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <span>📋</span>
                Uncategorized
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uncategorized.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    categories={categories}
                    onEdit={(c) => {
                      setEditingId(c.id);
                      setShowForm(true);
                    }}
                    onDelete={handleDelete}
                    onDeleting={deleting}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
