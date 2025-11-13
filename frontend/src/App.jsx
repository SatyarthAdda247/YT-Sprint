import React, { useState, useEffect } from 'react'
import axios from 'axios'

// API routes now on same domain - no VITE_API_URL needed!
const API_BASE = '/api'

console.log('🔗 API Base URL:', API_BASE)

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [showAuth, setShowAuth] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  
  // Auth form
  const [emailInput, setEmailInput] = useState('')
  
  // Options
  const [options, setOptions] = useState({ verticals: [], categories_by_vertical: {}, subjects_by_vertical: {}, content_subcategories: [] })
  
  // Filters
  const [vertical, setVertical] = useState('')
  const [category, setCategory] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [userOnly, setUserOnly] = useState(false)
  
  // Items
  const [items, setItems] = useState([])
  const [itemsLoading, setItemsLoading] = useState(false)
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  
  // Form
  const [itemForm, setItemForm] = useState({
    verificationLink: '', contentType: '', vertical: '', 
    exam: '', subject: '', status: '', contentSubcategory: '', videoFile: null, files: []
  })
  const [linkVerified, setLinkVerified] = useState(false)

  useEffect(() => {
    const initAuth = async () => {
      const savedEmail = localStorage.getItem('userEmail')
      if (savedEmail) {
        axios.defaults.headers.common['X-User-Email'] = savedEmail
        setUserEmail(savedEmail)
        setIsLoggedIn(true)
        setShowAuth(false)
        await loadOptions()
        await loadItems()
      }
      setIsLoading(false)
    }
    initAuth()
  }, [])

  useEffect(() => {
    if (isLoggedIn) {
      loadItems()
    }
  }, [vertical, category, subcategory, userOnly, isLoggedIn])

  const handleAuth = async (e) => {
    e.preventDefault()
    
    // Validate email domain
    const allowedDomains = ['adda247.com', 'addaeducation.com', 'studyiq.com']
    const isValidDomain = allowedDomains.some(domain => emailInput.endsWith(`@${domain}`))
    
    if (!isValidDomain) {
      alert('Only adda247.com, addaeducation.com, studyiq.com emails are allowed')
      return
    }
    
    setIsLoading(true)
    localStorage.setItem('userEmail', emailInput)
    axios.defaults.headers.common['X-User-Email'] = emailInput
    
    setUserEmail(emailInput)
    setIsLoggedIn(true)
    setShowAuth(false)
    
    await loadOptions()
    await loadItems()
    setIsLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('userEmail')
    delete axios.defaults.headers.common['X-User-Email']
    setIsLoggedIn(false)
    setShowAuth(true)
    setUserEmail('')
    setItems([])
  }

  const loadOptions = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/options`)
      setOptions({
        verticals: data.verticals || [],
        categories_by_vertical: data.categories_by_vertical || {},
        subjects_by_vertical: data.subjects_by_vertical || {},
        content_subcategories: data.content_subcategories || []
      })
    } catch (err) {
      console.error('Failed to load options:', err)
      alert('⚠️ Failed to load verticals/exams/subjects. Please refresh the page or check your connection.')
    }
  }

  const loadItems = async () => {
    try {
      setItemsLoading(true)
      const params = { vertical, category, subcategory, user_only: userOnly }
      const { data } = await axios.get(`${API_BASE}/metadata`, { params })
      setItems(data.items || [])
    } catch (err) {
      console.error('Failed to load items:', err)
      setItems([])
    } finally {
      setItemsLoading(false)
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
      const { data } = await axios.get(`${API_BASE}/check-duplicate/${videoId}`, {
        headers: { 'X-User-Email': userEmail }
      })
      if (data.exists) {
        alert(`This video already exists! Uploaded by: ${data.item.created_by}`)
        return
      }
      setLinkVerified(true)
      alert('✅ Link verified! No duplicates found.')
    } catch (err) {
      console.error('Verification error:', err)
      alert('Failed to verify link. You can still proceed.')
      setLinkVerified(true)
    }
  }

  const handleAddItem = async (e) => {
    e.preventDefault()
    
    // For Re-edit status, verification link is optional but video file is required
    if (itemForm.status === 'Re-edit') {
      if (!itemForm.videoFile) {
        alert('Please upload a video file for Re-edit status')
        return
      }
      // Check file size (20MB limit)
      if (itemForm.videoFile.size > 20 * 1024 * 1024) {
        alert('⚠️ Video file must be under 20MB')
        return
      }
    } else {
      // For other statuses, verification link is required
      if (!linkVerified && itemForm.verificationLink) {
        alert('Please verify the link first by clicking "Check Link"')
        return
      }
    }
    
    try {
      // For now, send as JSON (file upload will be added later with S3 presigned URLs)
      const payload = {
        email: userEmail,
        verificationLink: itemForm.verificationLink || '',
        contentType: itemForm.contentType,
        vertical: itemForm.vertical,
        exam: itemForm.exam,
        subject: itemForm.subject,
        status: itemForm.status,
        contentSubcategory: itemForm.contentSubcategory
      }
      
      if (editingItem) {
        await axios.put(`${API_BASE}/item/${editingItem.id}`, payload, {
          headers: { 
            'Content-Type': 'application/json',
            'X-User-Email': userEmail
          }
        })
      } else {
        await axios.post(`${API_BASE}/item`, payload, {
          headers: { 
            'Content-Type': 'application/json',
            'X-User-Email': userEmail
          }
        })
      }
      
      setShowAddModal(false)
      setEditingItem(null)
      setItemForm({ verificationLink: '', contentType: '', vertical: '', exam: '', subject: '', status: '', contentSubcategory: '', videoFile: null, files: [] })
      setLinkVerified(false)
      
      alert('✅ Entry saved successfully!')
      
      loadOptions()
      loadItems()
    } catch (err) {
      console.error('Save error:', err)
      const errorMsg = err.response?.data?.error || err.message || 'Failed to save item'
      if (err.response?.status === 403) {
        alert('❌ Not authorized: You can only edit items you created')
      } else if (err.response?.status === 413) {
        alert('❌ File too large. Maximum 20MB allowed.')
      } else {
        alert('❌ Error: ' + errorMsg)
      }
    }
  }

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Delete this item? This action cannot be undone.')) return
    
    try {
      await axios.delete(`${API_BASE}/item/${itemId}`)
      loadItems()
      loadOptions()
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to delete item'
      if (err.response?.status === 403) {
        alert('❌ Not authorized: You can only delete items you created')
      } else {
        alert(errorMsg)
      }
    }
  }

  const handleEditItem = (item) => {
    setEditingItem(item)
    setItemForm({
      verificationLink: item.verificationLink || '',
      contentType: item.contentType || '',
      vertical: item.vertical,
      exam: item.exam || '',
      subject: item.subject || '',
      status: item.status || '',
      contentSubcategory: item.contentSubcategory || '',
      videoFile: null,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">YT Sprint Dashboard</h1>
          <p className="text-gray-600 mb-6 text-center">Enter your email to continue</p>
          
          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="email"
              placeholder="yourname@adda247.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
            
            <p className="text-xs text-gray-500 text-center">
              Only @adda247.com, @addaeducation.com, @studyiq.com emails
            </p>
            
            <button
              type="submit"
              className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition"
            >
              Continue
            </button>
            
            <p className="text-xs text-gray-500 text-center">
              Your previous uploads will be shown automatically
            </p>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-2 px-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-red-600 font-bold">Adda</span>
            <span className="font-bold">Education</span>
            <span className="text-red-600 font-bold">-Hackathon</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{userEmail}</span>
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
        {/* Hero Banner */}
        <div className="bg-gradient-to-br from-red-500 via-pink-500 to-red-600 rounded-2xl p-10 mb-6 text-center relative overflow-hidden shadow-xl">
          <div className="absolute top-8 right-8 text-white text-5xl opacity-10">✨</div>
          <div className="absolute bottom-8 left-8 text-white text-4xl opacity-10">🚀</div>
          <h1 className="text-4xl font-bold text-white mb-6">Build the Feed</h1>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => { setEditingItem(null); setShowAddModal(true) }}
              className="px-6 py-3 bg-white text-red-600 rounded-full font-medium hover:bg-gray-50 transition shadow-lg inline-flex items-center gap-2"
            >
              <span className="text-lg">+</span> Add New Entry
            </button>
            <button
              onClick={handleExport}
              className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full font-medium hover:bg-white/30 transition border-2 border-white inline-flex items-center gap-2"
            >
              <span>📥</span> Export Entries
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition">
            <div className="w-14 h-14 bg-gradient-to-br from-red-50 to-red-100 rounded-xl flex items-center justify-center text-2xl">
              📋
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-800">{items.length}</div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Content Submissions</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center text-2xl">
              📊
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-800">{options.verticals.length}</div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Verticals</div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl p-6 mb-6 shadow-xl">
          <div className="flex items-center gap-2 mb-5 text-white">
            <span className="text-xl">🔍</span>
            <h2 className="text-lg font-semibold">Filter Content</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">Vertical Name</label>
              <select
                value={vertical}
                onChange={(e) => { setVertical(e.target.value); setCategory(''); setSubcategory('') }}
                className="w-full px-4 py-2.5 bg-white rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none text-sm"
              >
                <option value="">All Verticals</option>
                {options.verticals.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">Exam Name</label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setSubcategory('') }}
                disabled={!vertical}
                className="w-full px-4 py-2.5 bg-white rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none disabled:bg-gray-200 disabled:cursor-not-allowed text-sm"
              >
                <option value="">All Exams</option>
                {vertical && options.categories_by_vertical[vertical]?.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">Subject</label>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                disabled={!vertical}
                className="w-full px-4 py-2.5 bg-white rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none disabled:bg-gray-200 disabled:cursor-not-allowed text-sm"
              >
                <option value="">All Subjects</option>
                {vertical && options.subjects_by_vertical?.[vertical]?.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">User Filter</label>
              <select
                value={userOnly ? 'mine' : 'all'}
                onChange={(e) => setUserOnly(e.target.value === 'mine')}
                className="w-full px-4 py-2.5 bg-white rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none text-sm"
              >
                <option value="all">All Users</option>
                <option value="mine">My Uploads Only</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={() => { setVertical(''); setCategory(''); setSubcategory(''); setUserOnly(false) }}
            className="px-6 py-2 bg-white text-gray-800 rounded-lg font-medium hover:bg-gray-100 transition text-sm"
          >
            Clear All Filters
          </button>
        </div>

        {/* Content Entries Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
            <span className="text-red-600 text-xl">📄</span>
            <h2 className="text-lg font-semibold text-gray-800">Content Entries</h2>
          </div>
          
          {itemsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
                <p className="text-gray-600 text-sm">Loading items...</p>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No items found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-red-600 text-white text-left text-sm">
                    <th className="px-6 py-3 font-medium">S.NO</th>
                    <th className="px-6 py-3 font-medium">DATA TYPE</th>
                    <th className="px-6 py-3 font-medium">VERTICAL</th>
                    <th className="px-6 py-3 font-medium">TYPE / CATEGORY</th>
                    <th className="px-6 py-3 font-medium">EXAM / SUBJECT</th>
                    <th className="px-6 py-3 font-medium">VIDEO LINK</th>
                    <th className="px-6 py-3 font-medium">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                      <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                        {item.contentType || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {item.vertical}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {item.contentType === 'Content' ? item.contentSubcategory : item.contentType}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        <div>{item.exam || '-'}</div>
                        <div className="text-xs text-gray-500">{item.subject || '-'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {item.verificationLink ? (
                          <a
                            href={item.verificationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 underline max-w-xs truncate block"
                          >
                            {item.verificationLink}
                          </a>
                        ) : item.videoFile ? (
                          <button
                            onClick={() => getFileDownloadUrl(item.id, item.videoFile)}
                            className="text-purple-600 hover:text-purple-700 underline"
                          >
                            📹 Video File
                          </button>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleEditItem(item)}
                          className={`px-4 py-2 rounded-full font-medium text-sm transition ${
                            item.status === 'Published' ? 'bg-green-500 text-white hover:bg-green-600' :
                            item.status === 'Final' ? 'bg-blue-500 text-white hover:bg-blue-600' :
                            item.status === 'Pending' ? 'bg-yellow-500 text-white hover:bg-yellow-600' :
                            item.status === 'Re-edit' ? 'bg-orange-500 text-white hover:bg-orange-600' :
                            'bg-green-500 text-white hover:bg-green-600'
                          }`}
                        >
                          {item.status || 'View'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <label className="block text-sm font-medium text-gray-700 mb-2">🔍 Verification Link {itemForm.status !== 'Re-edit' && '*'}</label>
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
                      required={itemForm.status !== 'Re-edit'}
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

                {itemForm.contentType === 'Content' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content Sub-category *</label>
                    <select
                      value={itemForm.contentSubcategory}
                      onChange={(e) => setItemForm({ ...itemForm, contentSubcategory: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Sub-category</option>
                      {options.content_subcategories?.map(sc => (
                        <option key={sc} value={sc}>{sc}</option>
                      ))}
                    </select>
                  </div>
                )}
                
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                  <select
                    value={itemForm.subject}
                    onChange={(e) => setItemForm({ ...itemForm, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    disabled={!itemForm.vertical}
                    required
                  >
                    <option value="">Select Subject</option>
                    {itemForm.vertical && options.subjects_by_vertical?.[itemForm.vertical]?.map(s => (
                      <option key={s} value={s}>{s}</option>
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
                    <option value="Re-edit">Re-edit</option>
                    <option value="Final">Final</option>
                    <option value="Published">Published</option>
                  </select>
                </div>
                
                {itemForm.status === 'Re-edit' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">📹 Upload Video File *</label>
                    <input
                      type="file"
                      accept="video/*,.mp4,.mov,.avi,.mkv"
                      onChange={(e) => {
                        const file = e.target.files[0]
                        if (file && file.size > 20 * 1024 * 1024) {
                          alert('⚠️ File size must be under 20MB for shorts')
                          e.target.value = ''
                          return
                        }
                        setItemForm({ ...itemForm, videoFile: file })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Max 20MB for shorts - Upload to S3</p>
                  </div>
                )}
                
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

