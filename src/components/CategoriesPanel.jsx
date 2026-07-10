import { useState, useEffect } from 'react'
import uuidv4 from '../utils/uuid'

export default function CategoriesPanel({ data, updateStore, autoOpenType }) {
  const [activeAddSection, setActiveAddSection] = useState(null)
  const [deleteWarning, setDeleteWarning] = useState(null)
  
  useEffect(() => {
    if (autoOpenType) {
      setActiveAddSection(autoOpenType)
    }
  }, [autoOpenType])
  
  const incomeCategories = data.payments.categories.filter(c => c.type === 'income')
  const expenseCategories = data.payments.categories.filter(c => c.type === 'expense')
  
  const hasTransactions = (categoryId) => {
    return data.payments.transactions.some(t => t.categoryId === categoryId)
  }
  
  const handleDeleteClick = (category) => {
    if (hasTransactions(category.id)) {
      setDeleteWarning(category)
    } else {
      handleDelete(category.id)
    }
  }
  
  const handleConfirmDelete = () => {
    if (deleteWarning) {
      updateStore(current => ({
        ...current,
        payments: {
          ...current.payments,
          categories: current.payments.categories.filter(c => c.id !== deleteWarning.id),
          transactions: current.payments.transactions.filter(t => t.categoryId !== deleteWarning.id)
        }
      }))
      setDeleteWarning(null)
    }
  }
  
  const handleDelete = (id) => {
    if (confirm('Delete this category?')) {
      updateStore(current => ({
        ...current,
        payments: {
          ...current.payments,
          categories: current.payments.categories.filter(c => c.id !== id)
        }
      }))
    }
  }
  
  const handleRename = (id, newName) => {
    updateStore(current => ({
      ...current,
      payments: {
        ...current.payments,
        categories: current.payments.categories.map(c =>
          c.id === id ? { ...c, name: newName } : c
        )
      }
    }))
  }
  
  const toggleClassification = (id) => {
    updateStore(current => ({
      ...current,
      payments: {
        ...current.payments,
        categories: current.payments.categories.map(c =>
          c.id === id ? { ...c, classification: c.classification === 'need' ? 'want' : 'need' } : c
        )
      }
    }))
  }
  
  return (
    <div>
      <CategorySection
        title="Income"
        categories={incomeCategories}
        onDeleteClick={handleDeleteClick}
        onRename={handleRename}
        hasTransactions={hasTransactions}
        updateStore={updateStore}
        type="income"
        isAddingActive={activeAddSection === 'income'}
        onStartAdding={() => setActiveAddSection('income')}
        onCancelAdding={() => setActiveAddSection(null)}
      />
      
      <CategorySection
        title="Expense"
        categories={expenseCategories}
        onDeleteClick={handleDeleteClick}
        onRename={handleRename}
        hasTransactions={hasTransactions}
        updateStore={updateStore}
        type="expense"
        toggleClassification={toggleClassification}
        isAddingActive={activeAddSection === 'expense'}
        onStartAdding={() => setActiveAddSection('expense')}
        onCancelAdding={() => setActiveAddSection(null)}
      />
      
      {deleteWarning && (
        <>
          <div
            onClick={() => setDeleteWarning(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 100
            }}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '400px',
            zIndex: 101
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 600 }}>
              Delete Category?
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#6b7280', lineHeight: 1.5 }}>
              Deleting this category will delete all the transactions labelled as this category.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setDeleteWarning(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#f3f4f6',
                  color: '#6b7280',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function CategorySection({ title, categories, onDeleteClick, onRename, hasTransactions, updateStore, type, toggleClassification, isAddingActive, onStartAdding, onCancelAdding }) {
  const [newName, setNewName] = useState('')
  const [newClassification, setNewClassification] = useState('need')
  const [editing, setEditing] = useState(null)
  const [editName, setEditName] = useState('')
  
  const handleAdd = () => {
    if (newName.trim()) {
      updateStore(current => ({
        ...current,
        payments: {
          ...current.payments,
          categories: [
            ...current.payments.categories,
            { 
              id: uuidv4(), 
              name: newName.trim(), 
              type, 
              classification: type === 'expense' ? newClassification : null, 
              isDefault: false 
            }
          ]
        }
      }))
      setNewName('')
      setNewClassification('need')
      onCancelAdding()
    }
  }
  
  const startEdit = (category) => {
    setEditing(category.id)
    setEditName(category.name)
  }
  
  const saveEdit = () => {
    if (editName.trim()) {
      onRename(editing, editName.trim())
    }
    setEditing(null)
  }
  
  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{ fontSize: '14px', marginBottom: '12px', color: '#6b7280', fontWeight: 500 }}>{title}</h3>
      
      {categories.map(category => (
        <div
          key={category.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px',
            background: '#f9f9f7',
            borderRadius: '8px',
            marginBottom: '8px'
          }}
        >
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {editing === category.id ? (
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onBlur={saveEdit}
                onKeyDown={e => e.key === 'Enter' && saveEdit()}
                autoFocus
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  border: '1px solid #e5e5e3',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            ) : (
              <>
                <span style={{ fontSize: '14px' }}>{category.name}</span>
                {category.isDefault && (
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    background: '#e5e5e3',
                    color: '#6b7280',
                    borderRadius: '4px'
                  }}>
                    default
                  </span>
                )}
              </>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {type === 'expense' && (
              <button
                onClick={() => toggleClassification(category.id)}
                style={{
                  padding: '4px 8px',
                  background: category.classification === 'need' ? '#4f46e5' : '#f43f5e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {category.classification}
              </button>
            )}
            <button
              onClick={() => startEdit(category)}
              className="btn-edit btn-edit-small"
            >
              <img 
                src="/edit-pencil-01-svgrepo-com.svg" 
                alt="Edit"
              />
            </button>
            {!category.isDefault && (
              <button
                onClick={() => onDeleteClick(category)}
                className="btn-delete btn-delete-small"
              >
                <img 
                  src="/trash-blank-alt-svgrepo-com.svg" 
                  alt="Delete"
                />
              </button>
            )}
          </div>
        </div>
      ))}
      
      {isAddingActive ? (
        <div style={{ marginTop: '8px' }}>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Category name"
            autoFocus
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #e5e5e3',
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '8px'
            }}
          />
          {type === 'expense' && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <button
                onClick={() => setNewClassification('need')}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: newClassification === 'need' ? '#4f46e5' : '#f9f9f7',
                  color: newClassification === 'need' ? '#fff' : '#1a1a1a',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Need
              </button>
              <button
                onClick={() => setNewClassification('want')}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: newClassification === 'want' ? '#4f46e5' : '#f9f9f7',
                  color: newClassification === 'want' ? '#fff' : '#1a1a1a',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Want
              </button>
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleAdd}
              style={{
                flex: 1,
                padding: '8px 16px',
                background: '#4f46e5',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Add
            </button>
            <button
              onClick={() => {
                onCancelAdding()
                setNewName('')
                setNewClassification('need')
              }}
              style={{
                flex: 1,
                padding: '8px 16px',
                background: '#f9f9f7',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={onStartAdding}
          style={{
            width: '100%',
            padding: '12px',
            marginTop: '8px',
            background: '#f9f9f7',
            border: '2px dashed #e5e5e3',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#6b7280'
          }}
        >
          + Add category
        </button>
      )}
    </div>
  )
}
