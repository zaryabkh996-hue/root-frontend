'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/app/lib/authService';
import { useNotification } from '@/app/lib/NotificationContext';
import { log } from 'console';

const COUNTRY_DATA: Record<string, string[]> = {
  'Ghana': ['Accra', 'Cape Coast', 'Kumasi', 'Elmina', 'Tamale', 'Takoradi'],
  'Nigeria': ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Benin City'],
  'Senegal': ['Dakar', 'Saint-Louis', 'Touba', 'Thiès'],
  'Kenya': ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'],
  'South Africa': ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria'],
  'Ethiopia': ['Addis Ababa', 'Gondar', 'Lalibela', 'Axum'],
  'Egypt': ['Cairo', 'Alexandria', 'Luxor', 'Aswan'],
  'Morocco': ['Casablanca', 'Marrakech', 'Fes', 'Rabat'],
  'Tanzania': ['Dar es Salaam', 'Zanzibar City', 'Arusha', 'Dodoma'],
  'Benin': ['Cotonou', 'Porto-Novo', 'Ouidah'],
  'Gambia': ['Banjul', 'Serekunda', 'Bakau'],
};

const COMMON_LANGUAGES = [
  'English', 'French', 'Portuguese', 'Arabic', 'Swahili', 'Yoruba', 'Igbo',
  'Hausa', 'Zulu', 'Xhosa', 'Shona', 'Amharic', 'Oromo', 'Somali',
  'Twi', 'Ga', 'Ewe', 'Fante', 'Wolof', 'Bambara', 'Lingala', 'Kinyarwanda'
];

interface Custodian {
  id: number;
  initials: string;
  name: string;
  location: string;
  specialty: string;
  status: string;
  availability: string;
  certification: string;
  cocStatus: string;
  sessions: string;
  certBadgeType: 'ok' | 'blue' | 'gray';
  cocBadgeType: 'ok' | 'warn' | 'gray';
  highlight?: boolean;
  disabled?: boolean;
}

interface PaginationData {
  custodians: Custodian[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export default function AdminCustodians() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [custodians, setCustodians] = useState<Custodian[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustodian, setEditingCustodian] = useState<Custodian | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    country: '',
    years_experience: 0,
    specialty: '',
    description: '',
    availability: 'Available',
    status: 'active',
    certification: '',
    coc_status: '',
    sessions_count: 0,
    about: '',
    short_bio: '',
    whatsapp: '',
    instagram: '',
    linkedin: '',
    languages: [] as string[],
    services: [
      { name: 'Free 15-min introduction', price: 0, description: 'Video call · meet, ask anything, no commitment' },
      { name: 'Pre-trip preparation call', price: 80, description: '60 min · video · personalised plan for your visit' },
      { name: 'Cape Coast accompaniment', price: 280, description: 'Full day in-person · castle visit + integration walk' },
      { name: 'Post-trip integration', price: 60, description: '45 min · video · once you\'re home in the diaspora' },
    ],
  });
  const [submitting, setSubmitting] = useState(false);
  const itemsPerPage = 10;

  // Fetch custodians from backend
  const fetchCustodians = async (page: number = 1, search: string = '') => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

      if (!token) {
        console.error('No auth token found');
        setCustodians([]);
        setTotal(0);
        setTotalPages(1);
        setLoading(false);
        return;
      }

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        search: search,
      });

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ' ';
      const response = await fetch(`${backendUrl}/admin/custodians?${queryParams}`, {
        method: 'GET',
        headers: AuthService.getAuthHeaders(),
      });

      console.log('Response status:', response);
      if (!response.ok) {
        throw new Error(`Failed to fetch custodians: ${response.statusText}`);
      }

      const data: PaginationData = await response.json();
      setCustodians(data.custodians);
      setTotal(data.total);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching custodians:', error);
      setCustodians([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCustodians(1);
  }, []);

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(1);
    fetchCustodians(1, query);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchCustodians(page, searchQuery);
    }
  };

  // Handle edit custodian
  const handleEditCustodian = async (custodian: Custodian) => {
    setEditingCustodian(custodian);

    // Fetch full custodian data from backend
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ' ';
      const response = await fetch(`${backendUrl}/admin/custodians/${custodian.id}`, {
        method: 'GET',
        headers: AuthService.getAuthHeaders(),
      });

      if (response.ok) {
        const result = await response.json();
        const fullData = result.data || result; // Handle both wrapped and unwrapped responses

        setFormData({
          name: fullData.name || '',
          email: fullData.email || '',
          location: fullData.location || '',
          country: fullData.country || '',
          years_experience: fullData.years_experience || 0,
          specialty: fullData.specialty || '',
          description: fullData.description || '',
          availability: fullData.availability || 'Available',
          status: fullData.status || 'active',
          certification: fullData.certification || '',
          coc_status: fullData.coc_status || '',
          sessions_count: fullData.sessions_count || 0,
          about: fullData.about || '',
          short_bio: fullData.short_bio || '',
          whatsapp: fullData.whatsapp || '',
          instagram: fullData.instagram || '',
          linkedin: fullData.linkedin || '',
          languages: fullData.languages && Array.isArray(fullData.languages) ? fullData.languages : [],
          services: (fullData.services && Array.isArray(fullData.services) && fullData.services.length > 0) ? fullData.services : [
            { name: 'Free 15-min introduction', price: 0, description: 'Video call · meet, ask anything, no commitment' },
            { name: 'Pre-trip preparation call', price: 80, description: '60 min · video · personalised plan for your visit' },
            { name: 'Cape Coast accompaniment', price: 280, description: 'Full day in-person · castle visit + integration walk' },
            { name: 'Post-trip integration', price: 60, description: '45 min · video · once you\'re home in the diaspora' },
          ],
        });
      } else {
        throw new Error(`Failed to fetch custodian details: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching custodian details:', error);
      // Fallback: populate with available data from list
      setFormData({
        name: custodian.name || '',
        email: '',
        location: custodian.location || '',
        country: '',
        years_experience: 0,
        specialty: '',
        description: '',
        availability: 'Available',
        status: 'active',
        certification: custodian.certification || '',
        coc_status: custodian.cocStatus || '',
        sessions_count: parseInt(custodian.sessions) || 0,
        about: '',
        short_bio: '',
        whatsapp: '',
        instagram: '',
        linkedin: '',
        languages: [],
        services: [
          { name: 'Free 15-min introduction', price: 0, description: 'Video call · meet, ask anything, no commitment' },
          { name: 'Pre-trip preparation call', price: 80, description: '60 min · video · personalised plan for your visit' },
          { name: 'Cape Coast accompaniment', price: 280, description: 'Full day in-person · castle visit + integration walk' },
          { name: 'Post-trip integration', price: 60, description: '45 min · video · once you\'re home in the diaspora' },
        ],
      });
    }

    setShowModal(true);
  };

  // Handle view custodian
  const handleViewCustodian = (custodian: Custodian) => {
    // Redirect to custodian detail page or open read-only modal
    router.push(`/admin/custodians/${custodian.id}`);
  };

  // Handle delete custodian
  const handleDeleteCustodian = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this custodian? This action cannot be undone.')) {
      return;
    }

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ' ';
      const response = await fetch(`${backendUrl}/admin/custodians/${id}`, {
        method: 'DELETE',
        headers: AuthService.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete custodian: ${response.statusText}`);
      }

      showNotification('Custodian deleted successfully');

      // If we're on a page that now has no items, go back a page
      if (custodians.length === 1 && currentPage > 1) {
        fetchCustodians(currentPage - 1, searchQuery);
      } else {
        fetchCustodians(currentPage, searchQuery);
      }
    } catch (error) {
      console.error('Error deleting custodian:', error);
      showNotification(`Failed to delete custodian: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  // Handle add custodian
  const handleAddCustodian = async () => {
    setSubmitting(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ' ';
      const url = editingCustodian
        ? `${backendUrl}/admin/custodians/${editingCustodian.id}`
        : `${backendUrl}/admin/custodians`;

      const method = editingCustodian ? 'PUT' : 'POST';

      // Clean form data
      const cleanFormData = {
        name: formData.name,
        email: formData.email,
        location: formData.location,
        country: formData.country,
        years_experience: formData.years_experience,
        specialty: formData.specialty,
        description: formData.description,
        availability: formData.availability,
        status: formData.status,
        certification: formData.certification,
        coc_status: formData.coc_status,
        sessions_count: formData.sessions_count,
        about: formData.about,
        short_bio: formData.short_bio,
        whatsapp: formData.whatsapp,
        instagram: formData.instagram,
        linkedin: formData.linkedin,
        languages: formData.languages,
        services: formData.services,
      };

      console.log('Sending to backend:', cleanFormData);

      const response = await fetch(url, {
        method: method,
        headers: AuthService.getAuthHeaders(),
        body: JSON.stringify(cleanFormData),
      });

      console.log(`${method} ${url} - Status:`, response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend error:', errorData);
        throw new Error(errorData.details || errorData.error || errorData.message || `Failed to ${editingCustodian ? 'update' : 'create'} custodian: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Success response:', result);

      // Reset form and close modal
      setFormData({
        name: '',
        email: '',
        location: '',
        country: '',
        years_experience: 0,
        specialty: '',
        description: '',
        availability: 'Available',
        status: 'active',
        certification: '',
        coc_status: '',
        sessions_count: 0,
        about: '',
        short_bio: '',
        whatsapp: '',
        instagram: '',
        linkedin: '',
        languages: [],
        services: [
          { name: 'Free 15-min introduction', price: 0, description: 'Video call · meet, ask anything, no commitment' },
          { name: 'Pre-trip preparation call', price: 80, description: '60 min · video · personalised plan for your visit' },
          { name: 'Cape Coast accompaniment', price: 280, description: 'Full day in-person · castle visit + integration walk' },
          { name: 'Post-trip integration', price: 60, description: '45 min · video · once you\'re home in the diaspora' },
        ],
      });
      setShowModal(false);
      setEditingCustodian(null);

      // Show success message
      showNotification(`Custodian ${editingCustodian ? 'updated' : 'created'} successfully`);

      // Refresh custodians list
      fetchCustodians(1);
    } catch (error) {
      console.error(`Error ${editingCustodian ? 'updating' : 'adding'} custodian:`, error);
      showNotification(`Failed to ${editingCustodian ? 'update' : 'add'} custodian: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-main">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div className="admin-eyebrow">Custodian Management</div>
          <h1 className="admin-page-title">{total} Custodians</h1>
        </div>
        <button
          className="a-btn-primary"
          onClick={() => {
            setEditingCustodian(null);
            setFormData({
              name: '',
              email: '',
              location: '',
              country: '',
              years_experience: 0,
              specialty: '',
              description: '',
              availability: 'Available',
              status: 'active',
              certification: '',
              coc_status: '',
              sessions_count: 0,
              about: '',
              short_bio: '',
              whatsapp: '',
              instagram: '',
              linkedin: '',
              languages: [],
              services: [
                { name: 'Free 15-min introduction', price: 0, description: 'Video call · meet, ask anything, no commitment' },
                { name: 'Pre-trip preparation call', price: 80, description: '60 min · video · personalised plan for your visit' },
                { name: 'Cape Coast accompaniment', price: 280, description: 'Full day in-person · castle visit + integration walk' },
                { name: 'Post-trip integration', price: 60, description: '45 min · video · once you\'re home in the diaspora' },
              ],
            });
            setShowModal(true);
          }}
          style={{ padding: '10px 16px', fontSize: '13px' }}
        >
          + Add Custodian
        </button>
      </div>

      {/* Search */}
      <div className="a-search-bar">
        <input
          type="text"
          placeholder="Search by name or location…"
          className="a-search-input"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      {/* Table with Loader */}
      <div className="a-table">
        {/* Table Header */}
        <div className="a-table-head" style={{ gridTemplateColumns: '2fr 1.3fr 1fr 1.2fr 80px 140px' }}>
          <span>Custodian</span>
          <span>Specialty</span>
          <span>Status</span>
          <span>Availability</span>
          <span>Sessions</span>
          <span>Actions</span>
        </div>

        {/* Loader or Table Rows */}
        {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '40px 20px',
              minHeight: '300px',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid #e5e7eb',
                  borderTop: '3px solid #111827',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  margin: '0 auto 12px',
                }}
              />
              <p style={{ fontSize: '13px', color: '#6b7280' }}>Loading custodians...</p>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          </div>
        ) : custodians.length === 0 ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '40px 20px',
              minHeight: '300px',
            }}
          >
            <p style={{ fontSize: '13px', color: '#9ca3af' }}>No custodians found</p>
          </div>
        ) : (
          custodians.map((custodian) => (
            <div
              key={custodian.id}
              className={`a-table-row ${custodian.highlight ? 'a-table-row-highlight' : ''} ${custodian.disabled ? 'a-table-row-disabled' : ''}`}
              style={{ gridTemplateColumns: '2fr 1.3fr 1fr 1.2fr 80px 140px' }}
            >
              {/* Custodian Cell */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="avatar">{custodian.initials}</div>
                <div>
                  <div className="a-table-cell-name">{custodian.name}</div>
                  <div className="a-table-cell-sub">{custodian.location}</div>
                </div>
              </div>

              {/* Specialty Cell */}
              <div>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>
                  {custodian.specialty || '—'}
                </span>
              </div>

              {/* Status Cell */}
              <div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    background:
                      custodian.status === 'active' ? '#dcfce7' :
                        custodian.status === 'inactive' ? '#fee2e2' :
                          custodian.status === 'suspended' ? '#fef3c7' :
                            custodian.status === 'pending' ? '#dbeafe' : '#f3f4f6',
                    color:
                      custodian.status === 'active' ? '#166534' :
                        custodian.status === 'inactive' ? '#991b1b' :
                          custodian.status === 'suspended' ? '#92400e' :
                            custodian.status === 'pending' ? '#1e40af' : '#374151',
                  }}
                >
                  {custodian.status || 'active'}
                </span>
              </div>

              {/* Availability Cell */}
              <div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: custodian.availability === 'Available' ? '#dcfce7' : '#fee2e2',
                    color: custodian.availability === 'Available' ? '#166534' : '#991b1b',
                  }}
                >
                  {custodian.availability || 'Available'}
                </span>
              </div>

              {/* Sessions Cell */}
              <div>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>
                  {custodian.sessions || 0}
                </span>
              </div>

              {/* Actions Cell */}
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => handleEditCustodian(custodian)}
                  className="a-btn-ghost"
                  style={{ padding: '4px 8px', fontSize: '11px', color: '#d97706', borderColor: '#fcd34d' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCustodian(custodian.id)}
                  className="a-btn-ghost"
                  style={{ padding: '4px 8px', fontSize: '11px', color: '#dc2626', borderColor: '#fca5a5' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            marginTop: '24px',
            padding: '16px 0',
          }}
        >
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="a-btn-ghost"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              opacity: currentPage === 1 ? 0.5 : 1,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            ← Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              style={{
                padding: '6px 10px',
                fontSize: '12px',
                border: page === currentPage ? '1px solid #111827' : '1px solid #e5e7eb',
                background: page === currentPage ? '#111827' : '#ffffff',
                color: page === currentPage ? '#ffffff' : '#111827',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: page === currentPage ? 600 : 400,
              }}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="a-btn-ghost"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              opacity: currentPage === totalPages ? 0.5 : 1,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            Next →
          </button>

          <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '12px' }}>
            Page {currentPage} of {totalPages}
          </span>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => {
            setShowModal(false);
            setEditingCustodian(null);
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '8px',
              padding: '28px',
              maxWidth: '700px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px', color: '#111' }}>
              {editingCustodian ? 'Edit Custodian' : 'Add New Custodian'}
            </h2>

            {/* Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Name & Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="E.g., Akosua O."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="E.g., akosua@example.com"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              </div>

              {/* Country & Location */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>
                    Country *
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => {
                      const newCountry = e.target.value;
                      setFormData({
                        ...formData,
                        country: newCountry,
                        location: '' // Reset location when country changes
                      });
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                    }}
                  >
                    <option value="">Select country</option>
                    {Object.keys(COUNTRY_DATA).sort().map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>
                    Location (City) *
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    disabled={!formData.country}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      backgroundColor: !formData.country ? '#f9fafb' : '#ffffff',
                      cursor: !formData.country ? 'not-allowed' : 'default',
                    }}
                  >
                    <option value="">{formData.country ? 'Select city' : 'Select country first'}</option>
                    {formData.country && COUNTRY_DATA[formData.country]?.sort().map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Years Experience & Specialty */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>
                    Years Experience *
                  </label>
                  <input
                    type="number"
                    value={formData.years_experience}
                    onChange={(e) => setFormData({ ...formData, years_experience: parseInt(e.target.value) })}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                {/* Specialty */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>
                    Specialty *
                  </label>
                  <select
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                    }}
                  >
                    <option value="">Select specialty</option>
                    <option value="Heritage sites">Heritage sites</option>
                    <option value="Naming ceremony">Naming ceremony</option>
                    <option value="Genealogy">Genealogy</option>
                    <option value="Language">Language</option>
                  </select>
                </div>
              </div>

              {/* Availability & Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>
                    Availability
                  </label>
                  <select
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                    }}
                  >
                    <option value="Available">Available</option>
                    <option value="Booked">Booked</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add custodian description..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    resize: 'none',
                  }}
                />
              </div>

              {/* Social Media Links */}
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', margin: '8px 0 4px' }}>
                Social Media Links
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="Phone/Link"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="@username"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>
                    LinkedIn
                  </label>
                  <input
                    type="text"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="username/link"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* ─── PROFILE PAGE FIELDS ─── */}
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginTop: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Profile Information
                </div>

                {/* Short Bio / Quote */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>
                    Short Bio (Quote) *
                  </label>
                  <textarea
                    value={formData.short_bio}
                    onChange={(e) => setFormData({ ...formData, short_bio: e.target.value })}
                    placeholder="E.g., 'I have walked relatives through the Door of No Return more than two hundred times...'"
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      resize: 'none',
                    }}
                  />
                </div>

                {/* About */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#374151', marginTop: '12px' }}>
                    About Section *
                  </label>
                  <textarea
                    value={formData.about}
                    onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                    placeholder="Detailed about section including education, training, and specializations..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      resize: 'none',
                    }}
                  />
                </div>

                {/* Languages - Multiple Select */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#374151', marginTop: '12px' }}>
                    Languages *
                  </label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <select
                      value=""
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val && !formData.languages.includes(val)) {
                          setFormData({
                            ...formData,
                            languages: [...formData.languages, val],
                          });
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontFamily: 'inherit',
                      }}
                    >
                      <option value="">Add a language...</option>
                      {COMMON_LANGUAGES.sort().map(lang => (
                        <option key={lang} value={lang} disabled={formData.languages.includes(lang)}>
                          {lang}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {formData.languages.map((lang, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: '#111827',
                          color: '#ffffff',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        {lang}
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, languages: formData.languages.filter((_, i) => i !== idx) })}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ffffff',
                            cursor: 'pointer',
                            padding: 0,
                            fontSize: '16px',
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* ─── SERVICES ─── */}
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginTop: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Services & Pricing
                </div>

                {formData.services.map((service, idx) => (
                  <div key={idx} style={{ marginBottom: '16px', padding: '12px', background: '#f9fafb', borderRadius: '6px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '12px', marginBottom: '8px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px', color: '#6b7280' }}>
                          Service Name
                        </label>
                        <input
                          type="text"
                          value={service.name}
                          onChange={(e) => {
                            const updated = [...formData.services];
                            updated[idx].name = e.target.value;
                            setFormData({ ...formData, services: updated });
                          }}
                          placeholder="Service name"
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontFamily: 'inherit',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px', color: '#6b7280' }}>
                          Price ($)
                        </label>
                        <input
                          type="number"
                          value={service.price}
                          onChange={(e) => {
                            const updated = [...formData.services];
                            updated[idx].price = parseFloat(e.target.value);
                            setFormData({ ...formData, services: updated });
                          }}
                          placeholder="0"
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontFamily: 'inherit',
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px', color: '#6b7280' }}>
                        Description
                      </label>
                      <input
                        type="text"
                        value={service.description}
                        onChange={(e) => {
                          const updated = [...formData.services];
                          updated[idx].description = e.target.value;
                          setFormData({ ...formData, services: updated });
                        }}
                        placeholder="Service description"
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontFamily: 'inherit',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingCustodian(null);
                  }}
                  className="a-btn-ghost"
                  style={{
                    flex: 1,
                    padding: '10px',
                    fontSize: '13px',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCustodian}
                  disabled={submitting}
                  className="a-btn-primary"
                  style={{
                    flex: 1,
                    padding: '10px',
                    fontSize: '13px',
                    opacity: submitting ? 0.7 : 1,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submitting ? (editingCustodian ? 'Updating...' : 'Adding...') : (editingCustodian ? 'Update Custodian' : 'Add Custodian')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
