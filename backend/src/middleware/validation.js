import validator from 'validator'

// Validation middleware factory
export function validateBody(schema) {
  return (req, res, next) => {
    const errors = []
    
    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field]
      
      // Check if field is required
      if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        errors.push(`${field} is required`)
        continue
      }
      
      // Skip validation if field is not required and empty
      if (!rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        continue
      }
      
      // Type validation
      if (rules.type && typeof value !== rules.type) {
        errors.push(`${field} must be of type ${rules.type}`)
        continue
      }
      
      // String validations
      if (typeof value === 'string') {
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters long`)
        }
        
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${field} must be no more than ${rules.maxLength} characters long`)
        }
        
        if (rules.email && !validator.isEmail(value)) {
          errors.push(`${field} must be a valid email address`)
        }
        
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`${field} format is invalid`)
        }
      }
      
      // Number validations
      if (typeof value === 'number') {
        if (rules.min && value < rules.min) {
          errors.push(`${field} must be at least ${rules.min}`)
        }
        
        if (rules.max && value > rules.max) {
          errors.push(`${field} must be no more than ${rules.max}`)
        }
      }
      
      // Date validation
      if (rules.isDate && !validator.isISO8601(value)) {
        errors.push(`${field} must be a valid date`)
      }
      
      // Custom validation
      if (rules.custom && !rules.custom(value)) {
        errors.push(rules.customMessage || `${field} is invalid`)
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      })
    }
    
    next()
  }
}

// Common validation schemas
export const userValidation = {
  register: validateBody({
    username: {
      required: true,
      type: 'string',
      minLength: 3,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_-]+$/,
      customMessage: 'Username can only contain letters, numbers, underscores, and hyphens'
    },
    email: {
      required: true,
      type: 'string',
      email: true,
      maxLength: 255
    },
    password: {
      required: true,
      type: 'string',
      minLength: 8,
      maxLength: 128,
      custom: (password) => {
        // At least one uppercase, one lowercase, one number
        const hasUpper = /[A-Z]/.test(password)
        const hasLower = /[a-z]/.test(password)
        const hasNumber = /\d/.test(password)
        return hasUpper && hasLower && hasNumber
      },
      customMessage: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }
  }),
  
  login: validateBody({
    username: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 255
    },
    password: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 128
    }
  })
}

export const projectValidation = {
  create: validateBody({
    name: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 255,
      custom: (name) => name.trim().length > 0,
      customMessage: 'Project name cannot be empty or whitespace only'
    },
    description: {
      required: false,
      type: 'string',
      maxLength: 2000
    }
  }),
  
  update: validateBody({
    name: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 255,
      custom: (name) => name.trim().length > 0,
      customMessage: 'Project name cannot be empty or whitespace only'
    },
    description: {
      required: false,
      type: 'string',
      maxLength: 2000
    },
    archived: {
      required: false,
      custom: (value) => typeof value === 'boolean',
      customMessage: 'Archived must be a boolean value'
    }
  })
}

export const taskValidation = {
  create: validateBody({
    name: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 255,
      custom: (name) => name.trim().length > 0,
      customMessage: 'Task name cannot be empty or whitespace only'
    },
    description: {
      required: false,
      type: 'string',
      maxLength: 2000
    },
    start_date: {
      required: true,
      isDate: true
    },
    end_date: {
      required: false,
      isDate: true
    },
    status: {
      required: false,
      type: 'string',
      custom: (status) => ['To Do', 'In Progress', 'On Hold', 'Done'].includes(status),
      customMessage: 'Status must be one of: To Do, In Progress, On Hold, Done'
    },
    priority: {
      required: false,
      type: 'string',
      custom: (priority) => ['Low', 'Medium', 'High', 'Critical'].includes(priority),
      customMessage: 'Priority must be one of: Low, Medium, High, Critical'
    },
    project_id: {
      required: true,
      custom: (id) => Number.isInteger(Number(id)) && Number(id) > 0,
      customMessage: 'Project ID must be a positive integer'
    }
  }),
  
  update: validateBody({
    name: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 255,
      custom: (name) => name.trim().length > 0,
      customMessage: 'Task name cannot be empty or whitespace only'
    },
    description: {
      required: false,
      type: 'string',
      maxLength: 2000
    },
    start_date: {
      required: true,
      isDate: true
    },
    end_date: {
      required: false,
      isDate: true
    },
    status: {
      required: false,
      type: 'string',
      custom: (status) => ['To Do', 'In Progress', 'On Hold', 'Done'].includes(status),
      customMessage: 'Status must be one of: To Do, In Progress, On Hold, Done'
    },
    priority: {
      required: false,
      type: 'string',
      custom: (priority) => ['Low', 'Medium', 'High', 'Critical'].includes(priority),
      customMessage: 'Priority must be one of: Low, Medium, High, Critical'
    }
  }),
  
  addNote: validateBody({
    content: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 5000,
      custom: (content) => content.trim().length > 0,
      customMessage: 'Note content cannot be empty or whitespace only'
    }
  })
}

// Parameter validation for route parameters
export function validateParam(paramName, validator) {
  return (req, res, next) => {
    const value = req.params[paramName]
    
    if (!validator(value)) {
      return res.status(400).json({
        error: 'Invalid parameter',
        details: [`${paramName} is invalid`]
      })
    }
    
    next()
  }
}

export const paramValidation = {
  id: validateParam('id', (id) => {
    const numId = Number(id)
    return Number.isInteger(numId) && numId > 0
  })
}