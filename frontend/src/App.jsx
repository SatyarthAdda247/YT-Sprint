import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [showAuth, setShowAuth] = useState(true)
  const [authMode, setAuthMode] = useState('login')
  
  // Auth form
  const [authForm, setAuthForm] = useState({ name: '', password: '' })
  
  // Options
  const [options, setOptions] = useState({ verticals: [], categories_by_vertical: {}, subcategories_by_category: {} })
  
  // Filters
  const [vertical, setVertical] = useState('')
  const [category, setCategory] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [userOnly, setUserOnly] = useState(false)
  
  // Items
  const [items, setItems] = useState([])
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  
  // Form
  const [itemForm, setItemForm] = useState({
    title: '', vertical: '', category: '', subcategory: '',
    notes: '', links: '', tags: '', files: []
  })

  useEffect(() => {
    const userName = localStorage.getItem('userName')
    if (userName) {
      axios.defaults.headers.common['X-User-Name'] = userName
      setUser({ name: userName })
      setIsLoggedIn(true)
      setShowAuth(false)
      loadOptions()
      loadItems()
    }
  }, [])

  useEffect(() => {
    if (isLoggedIn) {
      loadItems()
    }
  }, [vertical, category, subcategory, userOnly, isLoggedIn])

  const handleAuth = async (e) => {
    e.preventDefault()
    try {
      const endpoint = authMode === 'login' ? '/login' : '/signup'
      const { data } = await axios.post(`${API_BASE}${endpoint}`, authForm)
      
      localStorage.setItem('userName', data.user.name)
      axios.defaults.headers.common['X-User-Name'] = data.user.name
      
      setUser(data.user)
      setIsLoggedIn(true)
      setShowAuth(false)
      
      loadOptions()
      loadItems()
    } catch (err) {
      alert(err.response?.data?.error || 'Authentication failed')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('userName')
    delete axios.defaults.headers.common['X-User-Name']
    setIsLoggedIn(false)
    setShowAuth(true)
    setUser(null)
    setItems([])
  }

  const loadOptions = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/options`)
      setOptions(data)
    } catch (err) {
      console.error('Failed to load options:', err)
    }
  }

  const loadItems = async () => {
    try {
      const params = { vertical, category, subcategory, user_only: userOnly }
      const { data } = await axios.get(`${API_BASE}/metadata`, { params })
      setItems(data.items)
    } catch (err) {
      console.error('Failed to load items:', err)
    }
  }

  const handleAddItem = async (e) => {
    e.preventDefault()
    
    const formData = new FormData()
    formData.append('title', itemForm.title)
    formData.append('vertical', itemForm.vertical)
    formData.append('category', itemForm.category)
    formData.append('subcategory', itemForm.subcategory)
    formData.append('notes', itemForm.notes)
    formData.append('links', itemForm.links)
    formData.append('tags', itemForm.tags)
    
    Array.from(itemForm.files).forEach(file => {
      formData.append('files', file)
    })
    
    try {
      if (editingItem) {
        await axios.put(`${API_BASE}/item/${editingItem.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        await axios.post(`${API_BASE}/item`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }
      
      setShowAddModal(false)
      setEditingItem(null)
      setItemForm({ title: '', vertical: '', category: '', subcategory: '', notes: '', links: '', tags: '', files: [] })
      
      loadOptions()
      loadItems()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save item')
    }
  }

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Delete this item?')) return
    
    try {
      await axios.delete(`${API_BASE}/item/${itemId}`)
      loadItems()
      loadOptions()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete item')
    }
  }

  const handleEditItem = (item) => {
    setEditingItem(item)
    setItemForm({
      title: item.title,
      vertical: item.vertical,
      category: item.category,
      subcategory: item.subcategory,
      notes: item.notes || '',
      links: item.links?.join(', ') || '',
      tags: item.tags?.join(', ') || '',
      files: []
    })
    setShowAddModal(true)
  }

  const handleExport = async () => {
    try {
      const params = { vertical, category, subcategory }
      const { data } = await axios.get(`${API_BASE}/export`, { params })
      
      const blob = new Blob([data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'export.csv'
      a.click()
    } catch (err) {
      alert('Failed to export')
    }
  }

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      await axios.post(`${API_BASE}/bulk-upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      loadOptions()
      loadItems()
      alert('Bulk upload successful')
    } catch (err) {
      alert(err.response?.data?.error || 'Bulk upload failed')
    }
    
    e.target.value = ''
  }

  const getFileDownloadUrl = async (itemId, fileKey) => {
    try {
      const { data } = await axios.get(`${API_BASE}/item/${itemId}/download/${fileKey}`)
      window.open(data.url, '_blank')
    } catch (err) {
      alert('Failed to download file')
    }
  }

  if (showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Content Dashboard</h1>
          
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 rounded-lg font-medium ${authMode === 'login' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              Login
            </button>
            <button
              onClick={() => setAuthMode('signup')}
              className={`flex-1 py-2 rounded-lg font-medium ${authMode === 'signup' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              Sign Up
            </button>
          </div>
          
          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              value={authForm.name}
              onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
            
            <input
              type="password"
              placeholder="Password"
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
              minLength={6}
            />
            
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              {authMode === 'login' ? 'Login' : 'Sign Up'}
            </button>
            
            {authMode === 'login' && (
              <p className="text-xs text-gray-500 text-center">
                First time? Your account will be loaded with your previous uploads.
              </p>
            )}
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Content Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Filter Content</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vertical</label>
              <select
                value={vertical}
                onChange={(e) => { setVertical(e.target.value); setCategory(''); setSubcategory('') }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Verticals</option>
                {options.verticals.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Exam</label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setSubcategory('') }}
                disabled={!vertical}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">All Exams</option>
                {vertical && options.categories_by_vertical[vertical]?.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                disabled={!vertical}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">All Subjects</option>
                {vertical && options.subcategories_by_vertical?.[vertical]?.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="userOnly"
              checked={userOnly}
              onChange={(e) => setUserOnly(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="userOnly" className="text-sm text-gray-700">Show only my uploads</label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => { setEditingItem(null); setShowAddModal(true) }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Add Item
          </button>
          
          <label className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition cursor-pointer">
            Bulk Upload CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleBulkUpload}
              className="hidden"
            />
          </label>
          
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Export CSV
          </button>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow hover:shadow-md transition p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800 text-lg">{item.title || 'Untitled'}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditItem(item)}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="space-y-1 text-sm mb-3">
                <p className="text-gray-600"><span className="font-medium">Vertical:</span> {item.vertical}</p>
                {item.category && <p className="text-gray-600"><span className="font-medium">Exam:</span> {item.category}</p>}
                {item.subcategory && <p className="text-gray-600"><span className="font-medium">Subject:</span> {item.subcategory}</p>}
              </div>
              
              {item.notes && (
                <p className="text-sm text-gray-700 mb-3 line-clamp-2">{item.notes}</p>
              )}
              
              {item.links && item.links.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">Links:</p>
                  {item.links.map((link, i) => (
                    <a
                      key={i}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:text-indigo-700 block truncate"
                    >
                      {link}
                    </a>
                  ))}
                </div>
              )}
              
              {item.files && item.files.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">Files:</p>
                  {item.files.map((file, i) => (
                    <button
                      key={i}
                      onClick={() => getFileDownloadUrl(item.id, file)}
                      className="text-xs text-green-600 hover:text-green-700 block truncate"
                    >
                      {file.split('/').pop()}
                    </button>
                  ))}
                </div>
              )}
              
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">Uploaded by: {item.created_by || 'Unknown'}</p>
                {item.created_at && (
                  <p className="text-xs text-gray-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {items.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No items found. Add your first item to get started.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingItem ? 'Edit Item' : 'Add New Item'}
                </h2>
                <button
                  onClick={() => { setShowAddModal(false); setEditingItem(null) }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={itemForm.title}
                    onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vertical *</label>
                    <input
                      type="text"
                      value={itemForm.vertical}
                      onChange={(e) => setItemForm({ ...itemForm, vertical: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      list="verticals-list"
                      required
                    />
                    <datalist id="verticals-list">
                      {options.verticals.map(v => <option key={v} value={v} />)}
                    </datalist>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Exam</label>
                    <input
                      type="text"
                      value={itemForm.category}
                      onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      list="exams-list"
                    />
                    <datalist id="exams-list">
                      {itemForm.vertical && options.categories_by_vertical?.[itemForm.vertical]?.map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <input
                      type="text"
                      value={itemForm.subcategory}
                      onChange={(e) => setItemForm({ ...itemForm, subcategory: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      list="subjects-list"
                    />
                    <datalist id="subjects-list">
                      {itemForm.vertical && options.subcategories_by_vertical?.[itemForm.vertical]?.map(s => <option key={s} value={s} />)}
                    </datalist>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={itemForm.notes}
                    onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Links (comma-separated)</label>
                  <input
                    type="text"
                    value={itemForm.links}
                    onChange={(e) => setItemForm({ ...itemForm, links: e.target.value })}
                    placeholder="https://example.com, https://another.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={itemForm.tags}
                    onChange={(e) => setItemForm({ ...itemForm, tags: e.target.value })}
                    placeholder="tag1, tag2, tag3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Files</label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setItemForm({ ...itemForm, files: e.target.files })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
                  >
                    {editingItem ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAddModal(false); setEditingItem(null) }}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

