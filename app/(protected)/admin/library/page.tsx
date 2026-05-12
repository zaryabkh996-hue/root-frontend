'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Library {
  id: number;
  title: string;
  author: string;
  category: string;
  type: string;
  duration: string;
  created_at: string;
}

const AdminLibraryPage = () => {
  const router = useRouter();
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchLibraries();
  }, []);

  const fetchLibraries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/libraries`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setLibraries(response.data.data);
      }
    } catch (err) {
      setError('Failed to load libraries');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/libraries/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLibraries(libraries.filter(lib => lib.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete library:', err);
    }
  };

  const filteredLibraries = libraries.filter(
    lib =>
      lib.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lib.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      audio: 'bg-yellow-100 text-yellow-800',
      video: 'bg-blue-100 text-blue-800',
      pdf: 'bg-red-100 text-red-800',
      text: 'bg-green-100 text-green-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-forest-deepest">
        <div className="animate-spin inline-block w-12 h-12 border-4 border-brass border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-cream p-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="display text-4xl font-light text-cream">Library Management</h1>
            <p className="text-cream/70 mt-2">Manage all library content</p>
          </div>
          <button
            onClick={() => router.push('/admin/library/create')}
            className="mt-4 md:mt-0 bg-brass hover:bg-brass-light text-forest-deepest font-bold py-3 px-6 rounded-lg transition transform hover:scale-105"
          >
            + Add New Library Item
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="scard-warm p-5 mb-8 border-l-4" style={{borderLeftColor: 'var(--terra)', background: 'rgba(212,116,73,0.10)', color: 'var(--cream)'}}>
            <div className="eyebrow mb-1" style={{color: 'var(--terra)', fontSize: '10px'}}>Error</div>
            <p className="text-cream text-sm">{error}</p>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-brass/40 focus:border-brass focus:outline-none bg-forest-deep text-cream placeholder-cream/50"
          />
        </div>

        {/* Table */}
        <div className="scard-dark rounded-lg overflow-hidden">
          {filteredLibraries.length === 0 ? (
            <div className="p-8 text-center text-cream/60">
              <p className="text-lg">No library items found</p>
              {libraries.length === 0 && (
                <p className="mt-2">Start by creating your first library item</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-brass text-forest-deepest">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Title</th>
                    <th className="px-6 py-4 text-left font-semibold">Author</th>
                    <th className="px-6 py-4 text-left font-semibold">Category</th>
                    <th className="px-6 py-4 text-left font-semibold">Type</th>
                    <th className="px-6 py-4 text-left font-semibold">Duration</th>
                    <th className="px-6 py-4 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLibraries.map((library, index) => (
                    <tr
                      key={library.id}
                      className={`border-t border-forest-deep ${
                        index % 2 === 0 ? 'bg-forest-deepest/50' : 'bg-forest-deep'
                      } hover:bg-brass/10 transition`}
                    >
                      <td className="px-6 py-4 font-semibold text-cream">
                        {library.title}
                      </td>
                      <td className="px-6 py-4 text-cream/70">
                        {library.author || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-cream/70">
                        {library.category || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-brass/20 text-brass-light px-3 py-1 rounded-full text-xs font-bold uppercase">
                          {library.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-cream/70">
                        {library.duration || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <button
                            onClick={() =>
                              router.push(
                                `/admin/library/${library.id}/edit`
                              )
                            }
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-4 rounded transition"
                          >
                            Edit
                          </button>
                          {deleteConfirm === library.id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleDelete(library.id)
                                }
                                className="bg-terra text-white font-bold py-1 px-3 rounded transition"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="bg-forest-deep text-cream font-bold py-1 px-3 rounded transition border border-brass/40"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(library.id)}
                              className="bg-terra hover:bg-terra text-white font-bold py-1 px-4 rounded transition"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="scard-dark p-6 text-center">
            <p className="text-cream/60 mb-2">Total Items</p>
            <p className="display text-3xl font-light text-brass-light">{libraries.length}</p>
          </div>
          <div className="scard-dark p-6 text-center">
            <p className="text-cream/60 mb-2">Audio</p>
            <p className="display text-3xl font-light text-brass-light">
              {libraries.filter(lib => lib.type === 'audio').length}
            </p>
          </div>
          <div className="scard-dark p-6 text-center">
            <p className="text-cream/60 mb-2">Video</p>
            <p className="display text-3xl font-light text-brass-light">
              {libraries.filter(lib => lib.type === 'video').length}
            </p>
          </div>
          <div className="scard-dark p-6 text-center">
            <p className="text-cream/60 mb-2">Documents</p>
            <p className="display text-3xl font-light text-brass-light">
              {libraries.filter(lib => lib.type === 'pdf').length +
                libraries.filter(lib => lib.type === 'text').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLibraryPage;
