'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

interface FormData {
  title: string;
  description: string;
  author: string;
  category: string;
  type: 'audio' | 'video' | 'pdf' | 'text';
  duration: string;
  image_url: string;
  file_url: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

const CreateLibraryPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    author: '',
    category: '',
    type: 'audio',
    duration: '',
    image_url: '',
    file_url: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.post<ApiResponse<FormData>>(
        `${process.env.NEXT_PUBLIC_API_URL}/libraries`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data as ApiResponse<FormData>;
      if (data.success) {
        router.push('/admin/library');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Failed to create library item. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-cream p-8">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/library"
            className="inline-flex items-center text-brass-light hover:text-brass font-semibold mb-4 transition"
          >
            ← Back to Library
          </Link>
          <h1 className="display text-4xl font-light text-cream">Add New Library Item</h1>
          <p className="text-cream/70 mt-2">Create a new library content item</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="scard-warm p-5 mb-8 border-l-4" style={{borderLeftColor: 'var(--terra)', background: 'rgba(212,116,73,0.10)', color: 'var(--cream)'}}>
            <div className="eyebrow mb-1" style={{color: 'var(--terra)', fontSize: '10px'}}>Error</div>
            <p className="text-cream text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="scard-dark p-8">
          {/* Title */}
          <div className="mb-6">
            <label className="block text-cream font-semibold mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Enter the title of the library item"
              className="w-full px-4 py-3 rounded-lg border border-brass/40 focus:border-brass focus:outline-none bg-forest-deep text-cream placeholder-cream/50"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-cream font-semibold mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter a detailed description of the content"
              rows={5}
              className="w-full px-4 py-3 rounded-lg border border-brass/40 focus:border-brass focus:outline-none bg-forest-deep text-cream placeholder-cream/50"
            />
          </div>

          {/* Author */}
          <div className="mb-6">
            <label className="block text-cream font-semibold mb-2">
              Author
            </label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              placeholder="Enter the author name"
              className="w-full px-4 py-3 rounded-lg border border-brass/40 focus:border-brass focus:outline-none bg-forest-deep text-cream placeholder-cream/50"
            />
          </div>

          {/* Category */}
          <div className="mb-6">
            <label className="block text-cream font-semibold mb-2">
              Category
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              placeholder="e.g., History, Language, Culture"
              className="w-full px-4 py-3 rounded-lg border border-brass/40 focus:border-brass focus:outline-none bg-forest-deep text-cream placeholder-cream/50"
            />
          </div>

          {/* Type */}
          <div className="mb-6">
            <label className="block text-cream font-semibold mb-2">
              Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-brass/40 focus:border-brass focus:outline-none bg-forest-deep text-cream"
            >
              <option value="audio">🎵 Audio Guide</option>
              <option value="video">🎬 Video</option>
              <option value="pdf">📄 PDF Document</option>
              <option value="text">📝 Text Content</option>
            </select>
          </div>

          {/* Duration */}
          <div className="mb-6">
            <label className="block text-cream font-semibold mb-2">
              Duration
            </label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              placeholder="e.g., 10 min, 1 hour"
              className="w-full px-4 py-3 rounded-lg border border-brass/40 focus:border-brass focus:outline-none bg-forest-deep text-cream placeholder-cream/50"
            />
          </div>

          {/* Image URL */}
          <div className="mb-6">
            <label className="block text-cream font-semibold mb-2">
              Image URL
            </label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 rounded-lg border border-brass/40 focus:border-brass focus:outline-none bg-forest-deep text-cream placeholder-cream/50"
            />
          </div>

          {/* File URL */}
          <div className="mb-6">
            <label className="block text-cream font-semibold mb-2">
              File URL *
            </label>
            <input
              type="url"
              name="file_url"
              value={formData.file_url}
              onChange={handleInputChange}
              required
              placeholder="https://example.com/file.mp3"
              className="w-full px-4 py-3 rounded-lg border border-brass/40 focus:border-brass focus:outline-none bg-forest-deep text-cream placeholder-cream/50"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-brass hover:bg-brass-light disabled:bg-forest-deep text-forest-deepest disabled:text-cream/50 font-bold py-3 px-6 rounded-lg transition transform hover:scale-105"
            >
              {loading ? 'Creating...' : 'Create Library Item'}
            </button>
            <Link
              href="/admin/library"
              className="flex-1 bg-forest-deep border border-brass/40 text-cream hover:bg-brass/10 font-bold py-3 px-6 rounded-lg text-center transition"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLibraryPage;
