import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { showToast } from './Toast'
import { getCurrencyByCountry } from '../utils/countries'
import uuidv4 from '../utils/uuid'

export default function BottomSheet({ isOpen, onClose, categories, onSave, data, updateStore }) {
  const navigate = useNavigate()
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  
  useEffect(() => {
    if (isOpen) {
      setType('expense')
      setAmount('')
      setCategoryId('')
      setDate(new Date().toISOString().split('T')[0])
      setNote('')
      setCategoryDropdownOpen(false)
    }
  }, [isOpen])
  
  const filteredCategories = categories.filter(c => c.type === type)
  const canSave = amount > 0 && categoryId
  
  const handleSave = () => {
    const category = categories.find(c => c.id === categoryId)
    const currencySymbol = getCurrencyByCountry(data.profile.country)
    onSave({
      type,
      amount: parseFloat(amount),
      categoryId,
      date,
      note: note.trim() || null,
      classification: category.classification
    })
    showToast(`Logged ${currencySymbol}${amount} · ${category.name}`)
    onClose()
  }
  
  const handleAddCategory = () => {
    onClose()
    navigate('/payments', { state: { openSetup: true, categoryType: type } })
  }
  
  if (!isOpen) return null
  
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 300
        }}
      />
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#fff',
        borderRadius: '16px 16px 0 0',
        padding: '20px',
        zIndex: 301,
        maxWidth: '480px',
        margin: '0 auto',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <div style={{
          width: '40px',
          height: '4px',
          background: '#e5e5e3',
          borderRadius: '2px',
          margin: '0 auto 20px'
        }} />
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button
            onClick={() => setType('income')}
            style={{
              flex: 1,
              padding: '12px',
              background: type === 'income' ? '#4f46e5' : '#f9f9f7',
              color: type === 'income' ? '#fff' : '#1a1a1a',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            Income
          </button>
          <button
            onClick={() => setType('expense')}
            style={{
              flex: 1,
              padding: '12px',
              background: type === 'expense' ? '#4f46e5' : '#f9f9f7',
              color: type === 'expense' ? '#fff' : '#1a1a1a',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            Expense
          </button>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#1a1a1a', fontWeight: 500 }}>
            Amount
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            autoFocus
            placeholder="0"
            style={{
              width: '100%',
              padding: '12px',
              paddingLeft: '32px',
              border: '1px solid #e5e5e3',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
          <span style={{
            position: 'relative',
            top: '-38px',
            left: '12px',
            color: '#6b7280'
          }}>₹</span>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#1a1a1a', fontWeight: 500 }}>
            Category
          </label>
          <CustomDropdown
            value={categoryId}
            onChange={setCategoryId}
            options={filteredCategories}
            placeholder="Select category"
            isOpen={categoryDropdownOpen}
            onToggle={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
            onClose={() => setCategoryDropdownOpen(false)}
            onAddCategory={handleAddCategory}
            type={type}
            updateStore={updateStore}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#1a1a1a', fontWeight: 500 }}>
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e5e5e3',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#1a1a1a', fontWeight: 500 }}>
            Note (optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="e.g. California burrito"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e5e5e3',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
        </div>
        
        <button
          onClick={handleSave}
          disabled={!canSave}
          style={{
            width: '100%',
            padding: '16px',
            background: canSave ? '#4f46e5' : '#e5e5e3',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 500,
            cursor: canSave ? 'pointer' : 'not-allowed'
          }}
        >
          Save
        </button>
      </div>
    </>
  )
}

function CustomDropdown({ value, onChange, options, placeholder, isOpen, onToggle, onClose, onAddCategory, type, updateStore }) {
  const dropdownRef = useRef(null)
  const selectedOption = options.find(opt => opt.id === value)
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose()
        setIsAddingCategory(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])
  
  const handleSelect = (optionId) => {
    onChange(optionId)
    onClose()
    setIsAddingCategory(false)
  }
  
  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={onToggle}
        type="button"
        style={{
          width: '100%',
          padding: '12px',
          border: '1px solid #e5e5e3',
          borderRadius: '8px',
          fontSize: '16px',
          boxSizing: 'border-box',
          background: '#fff',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: selectedOption ? '#1a1a1a' : '#9ca3af'
        }}
      >
        <span>{selectedOption ? selectedOption.name : placeholder}</span>
        <span style={{ 
          fontSize: '12px',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s'
        }}>
          ▼
        </span>
      </button>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          background: '#fff',
          border: '1px solid #e5e5e3',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            maxHeight: '240px',
            overflowY: 'auto'
          }}>
            {options.length === 0 ? (
              <div style={{
                padding: '32px 16px',
                color: '#9ca3af',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                No categories yet
              </div>
            ) : (
              options.map(option => (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  type="button"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    background: value === option.id ? '#f9f9f7' : 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '15px',
                    color: '#1a1a1a',
                    borderBottom: '1px solid #f3f4f6'
                  }}
                >
                  {option.name}
                </button>
              ))
            )}
          </div>
          
          {!isAddingCategory ? (
            <button
              onClick={() => setIsAddingCategory(true)}
              type="button"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                borderTop: '1px dashed #e5e5e3',
                background: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '15px',
                color: '#4f46e5',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '18px' }}>+</span>
              <span>Add Category</span>
            </button>
          ) : (
            <AddCategoryForm 
              onClose={() => setIsAddingCategory(false)}
              onSelect={handleSelect}
              type={type}
              updateStore={updateStore}
            />
          )}
        </div>
      )}
    </div>
  )
}

function AddCategoryForm({ onClose, onSelect, type, updateStore }) {
  const [newName, setNewName] = useState('')
  const [classification, setClassification] = useState('need')
  const inputRef = useRef(null)
  
  useEffect(() => {
    inputRef.current?.focus()
  }, [])
  
  const handleAdd = () => {
    if (!newName.trim()) return
    
    const newCategory = {
      id: uuidv4(),
      name: newName.trim(),
      type,
      classification: type === 'expense' ? classification : null,
      isDefault: false
    }
    
    updateStore(current => ({
      ...current,
      payments: {
        ...current.payments,
        categories: [...current.payments.categories, newCategory]
      }
    }))
    
    onSelect(newCategory.id)
    onClose()
  }
  
  return (
    <div style={{
      borderTop: '1px dashed #e5e5e3',
      padding: '16px',
      background: '#f9f9f7'
    }}>
      <input
        ref={inputRef}
        type="text"
        value={newName}
        onChange={e => setNewName(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') handleAdd()
          if (e.key === 'Escape') onClose()
        }}
        placeholder="Category name"
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '1px solid #e5e5e3',
          borderRadius: '6px',
          fontSize: '14px',
          marginBottom: '12px',
          boxSizing: 'border-box',
          background: '#fff'
        }}
      />
      
      {type === 'expense' && (
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '12px' 
        }}>
          <button
            onClick={() => setClassification('need')}
            type="button"
            style={{
              flex: 1,
              padding: '8px',
              background: classification === 'need' ? '#4f46e5' : '#fff',
              color: classification === 'need' ? '#fff' : '#1a1a1a',
              border: '1px solid #e5e5e3',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500
            }}
          >
            Need
          </button>
          <button
            onClick={() => setClassification('want')}
            type="button"
            style={{
              flex: 1,
              padding: '8px',
              background: classification === 'want' ? '#4f46e5' : '#fff',
              color: classification === 'want' ? '#fff' : '#1a1a1a',
              border: '1px solid #e5e5e3',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500
            }}
          >
            Want
          </button>
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleAdd}
          type="button"
          disabled={!newName.trim()}
          style={{
            flex: 1,
            padding: '10px 16px',
            background: newName.trim() ? '#4f46e5' : '#e5e5e3',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: newName.trim() ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          Add
        </button>
        <button
          onClick={onClose}
          type="button"
          style={{
            flex: 1,
            padding: '10px 16px',
            background: '#fff',
            color: '#1a1a1a',
            border: '1px solid #e5e5e3',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
