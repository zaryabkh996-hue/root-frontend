'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/app/lib/authService';

interface User {
  id: number;
  initials: string;
  name: string;
  location: string;
  tier: string;
  phase: string;
  stage: string;
  score: string;
}

interface PaginationData {
  users: User[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;

  // Fetch users from backend
  const fetchUsers = async (page: number = 1, search: string = '') => {
    setLoading(true);
    try {
      // Get token from localStorage (set during Auth0 callback in oauth-success)
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

      if (!token) {
        console.error('No auth token found in localStorage');
        setUsers([]);
        setTotal(0);
        setTotalPages(1);
        setLoading(false);
        return;
      }

      const queryParams = new URLSearchParams({
        role: 'customer',
        page: page.toString(),
        limit: itemsPerPage.toString(),
        search: search,
      });

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ' ';
      const headers = AuthService.getAuthHeaders();

      const response = await fetch(`${backendUrl}/api/admin/users?${queryParams}`, {
        method: 'GET',
        headers,
      });

      console.log('Fetch users response:', response.status, response.statusText);

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized - token may be invalid or expired');
        }
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      const data: PaginationData = await response.json();
      setUsers(data.users);
      setTotal(data.total);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback to empty state
      setUsers([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchUsers(1);
  }, []);

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(1);
    fetchUsers(1, query);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchUsers(page, searchQuery);
    }
  };

  return (
    <div className="admin-main">
      <div className="admin-eyebrow">User Management</div>
      <h1 className="admin-page-title">{total} active clients</h1>

      {/* Search and Filters */}
      <div className="a-search-bar">
        <input
          type="text"
          placeholder="Search by name, email, or cohort…"
          className="a-search-input"
          value={searchQuery}
          onChange={handleSearch}
        />
        <button className="a-btn-ghost">Tier ▾</button>
        <button className="a-btn-ghost">Phase ▾</button>
        <button className="a-btn-ghost">Stage ▾</button>
      </div>

      {/* Table with Loader */}
      <div className="a-table">
        {/* Table Header */}
        <div className="a-table-head" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 80px 100px' }}>
          <span>Client</span>
          <span>Tier</span>
          <span>Phase</span>
          <span>Stage</span>
          <span>Score</span>
          {/* <span>Actions</span> */}
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
              <p style={{ fontSize: '13px', color: '#6b7280' }}>Loading users...</p>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '40px 20px',
              minHeight: '300px',
            }}
          >
            <p style={{ fontSize: '13px', color: '#9ca3af' }}>No users found</p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="a-table-row"
              style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 80px 100px' }}
            >
              {/* Client Cell */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="avatar">{user.initials}</div>
                <div>
                  <div className="a-table-cell-name">{user.name}</div>
                  <div className="a-table-cell-sub">{user.location}</div>
                </div>
              </div>

              {/* Tier Cell */}
              <div>
                <span className="a-badge-gray" style={{ fontSize: '9px' }}>
                  {user.tier}
                </span>
              </div>

              {/* Phase Cell */}
              <div className="a-table-cell-text">{user.phase}</div>

              {/* Stage Cell */}
              <div className="a-table-cell-text">{user.stage}</div>

              {/* Score Cell */}
              <div className="a-table-cell-score">{user.score}</div>

              {/* Actions Cell */}
              {/* <div style={{ display: 'flex', gap: '4px' }}>
                <button className="a-btn-ghost" style={{ padding: '4px 8px', fontSize: '11px' }}>
                  View
                </button>
                <button
                  className="a-btn-ghost"
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    color: '#d97706',
                    borderColor: '#fcd34d',
                  }}
                >
                  Flag
                </button>
              </div> */}
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

          {/* Page Numbers */}
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
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
                  transition: 'all 0.15s',
                }}
              >
                {page}
              </button>
            ))}
          </div>

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
    </div>
  );
}
