import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from './Icon'

export function SearchInput() {
  const [value, setValue] = useState('')
  const navigate = useNavigate()

  const openSearch = () => {
    navigate('/search', { state: { query: value } })
  }

  return (
    <div className="search-field">
      <Icon name="search" size={19} />
      <input
        aria-label="Search tasks"
        placeholder="Search for a task"
        value={value}
        onFocus={openSearch}
        onChange={(event) => {
          setValue(event.target.value)
          openSearch()
        }}
      />
      <span className="search-shortcut" aria-hidden="true">↵</span>
    </div>
  )
}
