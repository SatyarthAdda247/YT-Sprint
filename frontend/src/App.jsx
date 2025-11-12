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
    email: '', verificationLink: '', contentType: '', vertical: '', 
    exam: '', status: '', files: []
  })
  const [linkVerified, setLinkVerified] = useState(false)

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

  const handleCheckLink = async () => {
    const youtubeRegex = /(?:youtube\.com\/(?:shorts\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    const match = itemForm.verificationLink.match(youtubeRegex)
    
    if (!match) {
      alert('Invalid YouTube link. Please enter a valid YouTube video or shorts URL.')
      return
    }
    
    const videoId = match[1]
    
    // Check for duplicate
    try {
      const { data } = await axios.get(`${API_BASE}/check-duplicate/${videoId}`)
      if (data.exists) {
        alert(`This video already exists! Uploaded by: ${data.item.created_by}`)
        return
      }
      setLinkVerified(true)
      alert('Link verified! No duplicates found.')
    } catch (err) {
      alert('Failed to verify link')
    }
  }

  const handleAddItem = async (e) => {
    e.preventDefault()
    
    if (!linkVerified) {
      alert('Please verify the link first by clicking "Check Link"')
      return
    }
    
    const formData = new FormData()
    formData.append('email', itemForm.email)
    formData.append('verificationLink', itemForm.verificationLink)
    formData.append('contentType', itemForm.contentType)
    formData.append('vertical', itemForm.vertical)
    formData.append('exam', itemForm.exam)
    formData.append('status', itemForm.status)
    
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
      setItemForm({ email: '', verificationLink: '', contentType: '', vertical: '', exam: '', status: '', files: [] })
      setLinkVerified(false)
      
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
      email: item.email || '',
      verificationLink: item.verificationLink || '',
      contentType: item.contentType || '',
      vertical: item.vertical,
      exam: item.exam || '',
      status: item.status || '',
      files: []
    })
    setLinkVerified(true)
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
                {item.exam && <p className="text-gray-600"><span className="font-medium">Exam:</span> {item.exam}</p>}
                {item.contentType && <p className="text-gray-600"><span className="font-medium">Type:</span> {item.contentType}</p>}
                {item.status && (
                  <span className={`inline-block px-2 py-1 text-xs rounded ${
                    item.status === 'Published' ? 'bg-green-100 text-green-800' :
                    item.status === 'Final' ? 'bg-blue-100 text-blue-800' :
                    item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status}
                  </span>
                )}
              </div>
              
              {item.verificationLink && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">Video Link:</p>
                  <a
                    href={item.verificationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-red-600 hover:text-red-700 block truncate"
                  >
                    {item.verificationLink}
                  </a>
                </div>
              )}
              
              {item.email && (
                <p className="text-xs text-gray-500">Email: {item.email}</p>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={itemForm.email}
                    onChange={(e) => setItemForm({ ...itemForm, email: e.target.value })}
                    placeholder="yourname@adda247.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Only adda247.com, addaeducation.com, studyiq.com emails are allowed</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <label className="block text-sm font-medium text-gray-700 mb-2">🔍 Verification Link *</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={itemForm.verificationLink}
                      onChange={(e) => { 
                        setItemForm({ ...itemForm, verificationLink: e.target.value })
                        setLinkVerified(false)
                      }}
                      placeholder="https://youtube.com/shorts/..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleCheckLink}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 transition"
                    >
                      Check Link
                    </button>
                  </div>
                  {linkVerified && (
                    <p className="text-xs text-green-600 mt-1">✓ Link verified - no duplicates found</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type of Content *</label>
                  <select
                    value={itemForm.contentType}
                    onChange={(e) => setItemForm({ ...itemForm, contentType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Content Type</option>
                    <option value="Exam_Information">Exam Information</option>
                    <option value="Content">Content</option>
                    <option value="Motivational_or_Fun">Motivational or Fun</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vertical Name *</label>
                  <select
                    value={itemForm.vertical}
                    onChange={(e) => setItemForm({ ...itemForm, vertical: e.target.value, exam: '' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Vertical</option>
                    {options.verticals.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exam Name *</label>
                  <select
                    value={itemForm.exam}
                    onChange={(e) => setItemForm({ ...itemForm, exam: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    disabled={!itemForm.vertical}
                    required
                  >
                    <option value="">Select Exam</option>
                    {itemForm.vertical && options.categories_by_vertical?.[itemForm.vertical]?.map(e => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                  <select
                    value={itemForm.status}
                    onChange={(e) => setItemForm({ ...itemForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="Draft">Draft</option>
                    <option value="Pending">Pending</option>
                    <option value="Final">Final</option>
                    <option value="Published">Published</option>
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { 
                      setShowAddModal(false)
                      setEditingItem(null)
                      setLinkVerified(false)
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition"
                  >
                    Add Entry
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

