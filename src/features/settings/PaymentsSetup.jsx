import { useState, useEffect } from 'react'
import uuidv4 from '../../utils/uuid'
import theme from '../../theme'
import * as DataRepository from '../../repositories/dataRepository'

export default function CategoriesPanel({ data, updateStore, autoOpenType }) {
  const [activeAddSection, setActiveAddSection] = useState(null)
  const [deleteWarning, setDeleteWarning] = useState(null)
  const [deleteTransactions, setDeleteTransactions] = useState(null)
  
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
    setDeleteWarning(category)
    setDeleteTransactions(null)
  }
  
  const handleConfirmDelete = async () => {
    if (deleteWarning && deleteTransactions !== null) {
      const categoryToDelete = deleteWarning
      
      // Delete from Supabase
      try {
        await DataRepository.deleteCategory(categoryToDelete.id)
        if (deleteTransactions) {
          // Delete each related transaction from Supabase
          const relatedTxIds = data.payments.transactions
            .filter(t => t.categoryId === categoryToDelete.id)
            .map(t => t.id)
          await Promise.all(relatedTxIds.map(id => DataRepository.deleteTransaction(id)))
        }
      } catch (error) {
        console.error('Error deleting category from Supabase:', error)
      }

      updateStore(current => {
        const updatedCategories = current.payments.categories.filter(c => c.id !== categoryToDelete.id)
        const updatedTransactions = deleteTransactions 
          ? current.payments.transactions.filter(t => t.categoryId !== categoryToDelete.id)
          : current.payments.transactions
        
        // Add to previous categories
        const previousCategories = current.payments.previousCategories || []
        const alreadyInPrevious = previousCategories.some(c => c.id === categoryToDelete.id)
        
        return {
          ...current,
          payments: {
            ...current.payments,
            categories: updatedCategories,
            transactions: updatedTransactions,
            previousCategories: alreadyInPrevious 
              ? previousCategories 
              : [...previousCategories, categoryToDelete]
          }
        }
      })
      
      setDeleteWarning(null)
      setDeleteTransactions(null)
    }
  }
  
  const handleRename = async (id, newName) => {
    // Update in Supabase
    try {
      const category = data.payments.categories.find(c => c.id === id)
      if (category) {
        await DataRepository.updateCategory(id, { ...category, name: newName })
      }
    } catch (error) {
      console.error('Error renaming category in Supabase:', error)
    }

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
  
  const toggleClassification = async (id) => {
    const category = data.payments.categories.find(c => c.id === id)
    const newClassification = category?.classification === 'need' ? 'want' : 'need'

    // Update in Supabase
    try {
      if (category) {
        await DataRepository.updateCategory(id, { ...category, classification: newClassification })
      }
    } catch (error) {
      console.error('Error updating category classification in Supabase:', error)
    }

    updateStore(current => ({
      ...current,
      payments: {
        ...current.payments,
        categories: current.payments.categories.map(c =>
          c.id === id ? { ...c, classification: newClassification } : c
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
        data={data}
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
        data={data}
        type="expense"
        toggleClassification={toggleClassification}
        isAddingActive={activeAddSection === 'expense'}
        onStartAdding={() => setActiveAddSection('expense')}
        onCancelAdding={() => setActiveAddSection(null)}
      />
      
      {deleteWarning && (
        <>
          <div
            onClick={() => {
              setDeleteWarning(null)
              setDeleteTransactions(null)
            }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 100
            }}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: theme.colors.bgModal,
            backdropFilter: theme.backdropFilter,
            WebkitBackdropFilter: theme.backdropFilter,
            borderRadius: theme.borderRadius.xxxl,
            padding: theme.spacing.xxl,
            width: '90%',
            maxWidth: '400px',
            zIndex: 101,
            border: `1px solid ${theme.colors.borderSubtle}`,
            boxShadow: theme.shadows.strong
          }}>
            <h3 style={{ margin: `0 0 ${theme.spacing.md} 0`, fontSize: theme.typography.h4, fontWeight: theme.typography.semiBold, color: theme.colors.textPrimary }}>
              Delete Category?
            </h3>
            <p style={{ margin: `0 0 ${theme.spacing.lg} 0`, fontSize: theme.typography.body, color: theme.colors.textSecondary, lineHeight: 1.5 }}>
              Would you like to delete all transactions related to this category too?
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm, marginBottom: theme.spacing.lg }}>
              <label
                onClick={() => setDeleteTransactions(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing.md,
                  padding: theme.spacing.md,
                  background: deleteTransactions === true ? theme.colors.bgCardDark : 'transparent',
                  border: `1px solid ${deleteTransactions === true ? theme.colors.accentPurple : theme.colors.borderSubtle}`,
                  borderRadius: theme.borderRadius.lg,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: `2px solid ${deleteTransactions === true ? theme.colors.accentPurple : theme.colors.borderSubtle}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {deleteTransactions === true && (
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: theme.colors.accentPurple
                    }} />
                  )}
                </div>
                <span style={{ fontSize: theme.typography.body, color: theme.colors.textPrimary }}>
                  Yes, delete all transactions
                </span>
              </label>
              
              <label
                onClick={() => setDeleteTransactions(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing.md,
                  padding: theme.spacing.md,
                  background: deleteTransactions === false ? theme.colors.bgCardDark : 'transparent',
                  border: `1px solid ${deleteTransactions === false ? theme.colors.accentPurple : theme.colors.borderSubtle}`,
                  borderRadius: theme.borderRadius.lg,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: `2px solid ${deleteTransactions === false ? theme.colors.accentPurple : theme.colors.borderSubtle}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {deleteTransactions === false && (
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: theme.colors.accentPurple
                    }} />
                  )}
                </div>
                <span style={{ fontSize: theme.typography.body, color: theme.colors.textPrimary }}>
                  No, keep transactions
                </span>
              </label>
            </div>
            
            {deleteTransactions === true && (
              <div style={{
                padding: theme.spacing.md,
                background: 'rgba(255, 77, 109, 0.1)',
                border: '1px solid rgba(255, 77, 109, 0.3)',
                borderRadius: theme.borderRadius.lg,
                marginBottom: theme.spacing.lg
              }}>
                <p style={{
                  margin: 0,
                  fontSize: theme.typography.small,
                  color: theme.colors.accentPink,
                  lineHeight: 1.4
                }}>
                  ⚠️ Warning: This will cause changes in your amounts and balance history.
                </p>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: theme.spacing.sm }}>
              <button
                onClick={() => {
                  setDeleteWarning(null)
                  setDeleteTransactions(null)
                }}
                style={{
                  flex: 1,
                  padding: theme.spacing.md,
                  background: theme.colors.bgCard,
                  color: theme.colors.textSecondary,
                  border: `1px solid ${theme.colors.borderSubtle}`,
                  borderRadius: theme.borderRadius.lg,
                  fontSize: theme.typography.body,
                  fontWeight: theme.typography.medium,
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteTransactions === null}
                style={{
                  flex: 1,
                  padding: theme.spacing.md,
                  background: deleteTransactions !== null ? theme.colors.accentPink : theme.colors.bgCardDark,
                  color: deleteTransactions !== null ? theme.colors.textPrimary : theme.colors.textSecondary,
                  border: 'none',
                  borderRadius: theme.borderRadius.lg,
                  fontSize: theme.typography.body,
                  fontWeight: theme.typography.medium,
                  cursor: deleteTransactions !== null ? 'pointer' : 'not-allowed',
                  outline: 'none',
                  opacity: deleteTransactions !== null ? 1 : 0.5
                }}
              >
                Confirm
              </button>
              </div>
          </div>
        </>
      )}
    </div>
  )
}

function CategorySection({ title, categories, onDeleteClick, onRename, hasTransactions, updateStore, data, type, toggleClassification, isAddingActive, onStartAdding, onCancelAdding }) {
  const [newName, setNewName] = useState('')
  const [newClassification, setNewClassification] = useState('need')
  const [editing, setEditing] = useState(null)
  const [editName, setEditName] = useState('')
  const [showPrevious, setShowPrevious] = useState(false)
  
  const previousCategories = (data.payments.previousCategories || []).filter(c => c.type === type)
  
  const handleAdd = async () => {
    if (newName.trim()) {
      const newCategory = { 
        id: uuidv4(), 
        name: newName.trim(), 
        type, 
        classification: type === 'expense' ? newClassification : null, 
        isDefault: false 
      }

      // Save to Supabase
      try {
        await DataRepository.addCategory(newCategory)
      } catch (error) {
        console.error('Error adding category to Supabase:', error)
      }

      updateStore(current => ({
        ...current,
        payments: {
          ...current.payments,
          categories: [
            ...current.payments.categories,
            newCategory
          ]
        }
      }))
      setNewName('')
      setNewClassification('need')
      onCancelAdding()
    }
  }
  
  const handleRestoreCategory = async (category) => {
    // Re-add to Supabase (it was deleted when removed)
    try {
      await DataRepository.addCategory(category)
    } catch (error) {
      console.error('Error restoring category to Supabase:', error)
    }

    updateStore(current => ({
      ...current,
      payments: {
        ...current.payments,
        categories: [...current.payments.categories, category],
        previousCategories: current.payments.previousCategories.filter(c => c.id !== category.id)
      }
    }))
    setShowPrevious(false)
    onCancelAdding()
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
    <div style={{ marginBottom: theme.spacing.xxxl }}>
      <h3 style={{ fontSize: theme.typography.body, marginBottom: theme.spacing.md, color: theme.colors.textSecondary, fontWeight: theme.typography.medium }}>{title}</h3>
      
      {categories.map(category => (
        <div
          key={category.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: theme.spacing.md,
            background: theme.colors.bgCard,
            backdropFilter: theme.backdropFilter,
            WebkitBackdropFilter: theme.backdropFilter,
            borderRadius: theme.borderRadius.lg,
            marginBottom: theme.spacing.sm,
            border: `1px solid ${theme.colors.borderSubtle}`,
            boxShadow: theme.shadows.card
          }}
        >
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
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
                  border: `1px solid ${theme.colors.borderSubtle}`,
                  borderRadius: theme.borderRadius.sm,
                  fontSize: theme.typography.body,
                  background: theme.colors.bgCardDark,
                  color: theme.colors.textPrimary,
                  outline: 'none'
                }}
              />
            ) : (
              <>
                <span style={{ fontSize: theme.typography.body, color: theme.colors.textPrimary }}>{category.name}</span>
                {category.isDefault && (
                  <span style={{
                    fontSize: theme.typography.micro,
                    padding: '2px 6px',
                    background: theme.colors.bgCardDark,
                    color: theme.colors.textSecondary,
                    borderRadius: '4px'
                  }}>
                    default
                  </span>
                )}
              </>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: theme.spacing.sm, alignItems: 'center' }}>
            {type === 'expense' && (
              <button
                onClick={() => toggleClassification(category.id)}
                style={{
                  padding: '4px 8px',
                  background: category.classification === 'need' ? theme.colors.accentPurple : theme.colors.accentPink,
                  color: theme.colors.textPrimary,
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: theme.typography.tiny,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  fontWeight: theme.typography.medium,
                  outline: 'none'
                }}
              >
                {category.classification}
              </button>
            )}
            <button
              onClick={() => startEdit(category)}
              className="btn-edit btn-edit-small"
              style={{ outline: 'none' }}
            >
              <img 
                src="/edit-pencil-01-svgrepo-com.svg" 
                alt="Edit"
                style={{ filter: 'invert(60%) sepia(10%) saturate(500%) hue-rotate(194deg) brightness(95%) contrast(85%)' }}
              />
            </button>
            {!category.isDefault && (
              <button
                onClick={() => onDeleteClick(category)}
                className="btn-delete btn-delete-small"
                style={{ outline: 'none' }}
              >
                <img 
                  src="/trash-blank-alt-svgrepo-com.svg" 
                  alt="Delete"
                  style={{ filter: 'invert(50%) sepia(20%) saturate(1000%) hue-rotate(320deg) brightness(100%) contrast(90%)' }}
                />
              </button>
            )}
          </div>
        </div>
      ))}
      
      {isAddingActive ? (
        <div style={{ marginTop: theme.spacing.sm }}>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Category name"
            autoFocus
            style={{
              width: '100%',
              padding: theme.spacing.sm,
              border: `1px solid ${theme.colors.borderSubtle}`,
              borderRadius: theme.borderRadius.lg,
              fontSize: theme.typography.body,
              marginBottom: theme.spacing.sm,
              background: theme.colors.bgCard,
              color: theme.colors.textPrimary,
              outline: 'none'
            }}
          />
          {type === 'expense' && (
            <div style={{ display: 'flex', gap: theme.spacing.sm, marginBottom: theme.spacing.sm }}>
              <button
                onClick={() => setNewClassification('need')}
                style={{
                  flex: 1,
                  padding: theme.spacing.sm,
                  background: newClassification === 'need' ? theme.colors.accentPurple : theme.colors.bgCard,
                  color: theme.colors.textPrimary,
                  border: `1px solid ${newClassification === 'need' ? 'transparent' : theme.colors.borderSubtle}`,
                  borderRadius: theme.borderRadius.lg,
                  cursor: 'pointer',
                  fontSize: theme.typography.body,
                  outline: 'none'
                }}
              >
                Need
              </button>
              <button
                onClick={() => setNewClassification('want')}
                style={{
                  flex: 1,
                  padding: theme.spacing.sm,
                  background: newClassification === 'want' ? theme.colors.accentPurple : theme.colors.bgCard,
                  color: theme.colors.textPrimary,
                  border: `1px solid ${newClassification === 'want' ? 'transparent' : theme.colors.borderSubtle}`,
                  borderRadius: theme.borderRadius.lg,
                  cursor: 'pointer',
                  fontSize: theme.typography.body,
                  outline: 'none'
                }}
              >
                Want
              </button>
            </div>
          )}
          <div style={{ display: 'flex', gap: theme.spacing.sm }}>
            <button
              onClick={handleAdd}
              style={{
                flex: 1,
                padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                background: theme.colors.accentPurple,
                color: theme.colors.textPrimary,
                border: 'none',
                borderRadius: theme.borderRadius.lg,
                cursor: 'pointer',
                fontSize: theme.typography.body,
                fontWeight: theme.typography.medium,
                outline: 'none'
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
                padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                background: theme.colors.bgCard,
                border: `1px solid ${theme.colors.borderSubtle}`,
                borderRadius: theme.borderRadius.lg,
                cursor: 'pointer',
                fontSize: theme.typography.body,
                color: theme.colors.textPrimary,
                outline: 'none'
              }}
            >
              Cancel
            </button>
          </div>
          
          {previousCategories.length > 0 && (
            <div style={{ marginTop: theme.spacing.lg }}>
              <button
                onClick={() => setShowPrevious(!showPrevious)}
                style={{
                  width: '100%',
                  padding: theme.spacing.sm,
                  background: 'transparent',
                  border: 'none',
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.small,
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing.xs,
                  outline: 'none'
                }}
              >
                <span>{showPrevious ? '▼' : '▶'}</span>
                <span>Previous Categories ({previousCategories.length})</span>
              </button>
              
              {showPrevious && (
                <div style={{ marginTop: theme.spacing.sm, display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
                  {previousCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleRestoreCategory(cat)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: theme.spacing.sm,
                        background: theme.colors.bgCardDark,
                        border: `1px solid ${theme.colors.borderSubtle}`,
                        borderRadius: theme.borderRadius.lg,
                        cursor: 'pointer',
                        fontSize: theme.typography.body,
                        color: theme.colors.textPrimary,
                        outline: 'none',
                        textAlign: 'left'
                      }}
                    >
                      <span>{cat.name}</span>
                      <span style={{ fontSize: theme.typography.small, color: theme.colors.textSecondary }}>+ Restore</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={onStartAdding}
          style={{
            width: '100%',
            padding: theme.spacing.md,
            marginTop: theme.spacing.sm,
            background: theme.colors.bgCardDark,
            border: `2px dashed ${theme.colors.borderMedium}`,
            borderRadius: theme.borderRadius.lg,
            cursor: 'pointer',
            fontSize: theme.typography.body,
            color: theme.colors.textSecondary,
            outline: 'none'
          }}
        >
          + Add category
        </button>
      )}
    </div>
  )
}
